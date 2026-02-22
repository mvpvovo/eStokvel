// routes/meetings.js
const express = require('express');
const { Meeting, Fine, Transaction, Member, sequelize } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const LoanService = require('../services/loanService.js');
const router = express.Router();

router.use(authenticate);

// Create a new meeting (admin/treasurer)
router.post('/', authorize('admin','treasurer'), async (req, res) => {
  const { date, notes } = req.body;
  // Check if meeting already exists for this date
  const existing = await Meeting.findOne({ where: { date } });
  if (existing) return res.status(400).json({ error: 'Meeting already exists for this date' });

  const meeting = await Meeting.create({ date, notes });
  res.status(201).json(meeting);
});

// Process meeting: apply loan interest, record fines, handle payments/loans
router.post('/:id/process', authorize('admin','treasurer'), async (req, res) => {
  const meeting = await Meeting.findByPk(req.params.id);
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

  const { fines, payments, loans } = req.body; // arrays of objects

  // Start transaction
  const t = await sequelize.transaction();

  try {
    // 1. Apply monthly interest on all loans
    await LoanService.applyMonthlyInterest(meeting.date);

    // 2. Process fines
    for (const f of fines) {
      await Fine.create({
        memberId: f.memberId,
        meetingId: meeting.id,
        amount: f.amount,
        reason: f.reason,
        waived: f.waived || false,
        waivedBy: f.waived ? req.user.id : null
      }, { transaction: t });

      // If not waived, record as transaction and reduce member balance
      if (!f.waived) {
        await Transaction.create({
          memberId: f.memberId,
          date: meeting.date,
          type: 'fine',
          amount: f.amount,
          description: f.reason,
          meetingId: meeting.id
        }, { transaction: t });

        const member = await Member.findByPk(f.memberId, { transaction: t });
        member.currentBalance = parseFloat(member.currentBalance) - f.amount;
        await member.save({ transaction: t });
      }
    }

    // 3. Process loan repayments
    for (const p of payments) {
      await LoanService.processPayment(p.memberId, p.amount, meeting.id, meeting.date, { transaction: t });
    }

    // 4. Process new loans
    for (const l of loans) {
      await LoanService.disburseLoan(l.memberId, l.amount, meeting.id, meeting.date, { transaction: t });
    }

    await t.commit();
    res.json({ message: 'Meeting processed' });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
