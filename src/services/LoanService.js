// services/loanService.js
const { Loan, Transaction, Member, sequelize } = require('../models');
const { Op } = require('sequelize');

class LoanService {
  // Apply monthly interest to all outstanding loans as of a given date (meeting date)
  static async applyMonthlyInterest(meetingDate) {
    const loans = await Loan.findAll({
      where: {
        outstandingBalance: { [Op.gt]: 0 }
      },
      include: ['member']
    });

    for (const loan of loans) {
      // If interest already applied this month? We'll assume lastInterestCalculation tracks last meeting.
      // For simplicity, we apply interest if lastInterestCalculation is before this meeting month.
      const lastCalc = loan.lastInterestCalculation ? new Date(loan.lastInterestCalculation) : null;
      const meeting = new Date(meetingDate);
      if (!lastCalc || lastCalc.getMonth() !== meeting.getMonth() || lastCalc.getFullYear() !== meeting.getFullYear()) {
        const interest = loan.outstandingBalance * (loan.interestRate / 100);
        loan.outstandingBalance = parseFloat(loan.outstandingBalance) + interest;
        loan.lastInterestCalculation = meetingDate;

        // Record transaction
        await Transaction.create({
          memberId: loan.memberId,
          date: meetingDate,
          type: 'loan_interest',
          amount: interest,
          description: `Monthly interest on loan #${loan.id}`,
        });

        // Update member's currentBalance (decrease by interest? Actually interest increases debt, so currentBalance decreases)
        const member = await Member.findByPk(loan.memberId);
        member.currentBalance = parseFloat(member.currentBalance) - interest;
        await member.save();
        await loan.save();
      }
    }
  }

  // Process loan payment (member pays some amount)
  static async processPayment(memberId, amount, meetingId, date) {
    const member = await Member.findByPk(memberId);
    if (!member) throw new Error('Member not found');

    // Deduct payment from loans (FIFO or proportionally). For simplicity, reduce total outstanding by amount.
    // In a real system, you'd allocate to specific loans.
    const loans = await Loan.findAll({
      where: { memberId, outstandingBalance: { [Op.gt]: 0 } },
      order: [['takenAt', 'ASC']]
    });

    let remaining = amount;
    for (const loan of loans) {
      if (remaining <= 0) break;
      const payment = Math.min(remaining, loan.outstandingBalance);
      loan.outstandingBalance -= payment;
      remaining -= payment;
      await loan.save();
    }

    // Record transaction
    await Transaction.create({
      memberId,
      date,
      type: 'loan_repayment',
      amount,
      description: 'Loan repayment',
      meetingId
    });

    // Update member currentBalance (increase, because debt reduced)
    member.currentBalance = parseFloat(member.currentBalance) + amount;
    await member.save();
  }

  // Disburse new loan
  static async disburseLoan(memberId, amount, meetingId, date) {
    const member = await Member.findByPk(memberId);
    if (!member) throw new Error('Member not found');
    if (amount > member.currentBalance) throw new Error('Loan amount exceeds savings');

    const loan = await Loan.create({
      memberId,
      amount,
      outstandingBalance: amount,
      takenAt: date,
      lastInterestCalculation: date
    });

    // Update member totals
    member.currentBalance = parseFloat(member.currentBalance) - amount;
    member.totalBorrowed = parseFloat(member.totalBorrowed) + amount;
    await member.save();

    // Record transaction
    await Transaction.create({
      memberId,
      date,
      type: 'loan_disbursement',
      amount,
      description: 'New loan',
      meetingId
    });

    return loan;
  }

  // At year-end, apply compulsory fee if total borrowed < 3000
  static async applyCompulsoryFee(year) {
    const members = await Member.findAll({ where: { status: 'active' } });
    const target = 3000;
    const feeRate = 0.30;

    for (const member of members) {
      const borrowed = member.totalBorrowed;
      if (borrowed < target) {
        const shortfall = target - borrowed;
        const fee = shortfall * feeRate;

        // Create a "loan" entry for this fee? Or just record transaction and increase debt.
        // We'll treat as interest (increase outstanding balance)
        const loan = await Loan.findOne({ where: { memberId: member.id, outstandingBalance: { [Op.gt]: 0 } } });
        if (loan) {
          loan.outstandingBalance = parseFloat(loan.outstandingBalance) + fee;
          await loan.save();
        } else {
          // Create a new loan with zero principal but fee as balance
          await Loan.create({
            memberId: member.id,
            amount: 0,
            outstandingBalance: fee,
            takenAt: new Date(year, 11, 31), // Dec 31
            lastInterestCalculation: new Date(year, 11, 31)
          });
        }

        // Record transaction
        await Transaction.create({
          memberId: member.id,
          date: new Date(year, 11, 31),
          type: 'compulsory_fee',
          amount: fee,
          description: 'Compulsory loan shortfall fee'
        });

        // Decrease member balance
        member.currentBalance = parseFloat(member.currentBalance) - fee;
        await member.save();
      }
    }
  }
}

module.exports = LoanService;