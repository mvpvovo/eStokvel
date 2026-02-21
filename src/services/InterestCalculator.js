// services/interestCalculator.js
const { Member, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');

class InterestCalculator {
  static async calculateYearEndInterest(year) {
    // 1. Determine total interest pool from transactions of type: bank_interest, loan_interest, event_income net
    const bankInterest = await Transaction.sum('amount', {
      where: { type: 'bank_interest', date: { [Op.gte]: `${year}-01-01`, [Op.lte]: `${year}-12-31` } }
    }) || 0;

    const loanInterest = await Transaction.sum('amount', {
      where: { type: 'loan_interest', date: { [Op.gte]: `${year}-01-01`, [Op.lte]: `${year}-12-31` } }
    }) || 0;

    const eventIncome = await Transaction.sum('amount', {
      where: { type: 'event_income', date: { [Op.gte]: `${year}-01-01`, [Op.lte]: `${year}-12-31` } }
    }) || 0;

    const eventExpense = await Transaction.sum('amount', {
      where: { type: 'event_expense', date: { [Op.gte]: `${year}-01-01`, [Op.lte]: `${year}-12-31` } }
    }) || 0;

    const netEvent = eventIncome - eventExpense;
    const totalInterestPool = bankInterest + loanInterest + netEvent;

    // 2. Get all active members with their total contributions
    const members = await Member.findAll({
      where: { status: 'active' },
      attributes: ['id', 'name', 'totalContributions']
    });

    const minThreshold = 17000;
    const fullThreshold = 25200;

    // Separate members
    const qualifying = members.filter(m => m.totalContributions >= minThreshold);
    const fullThresholdMembers = qualifying.filter(m => m.totalContributions >= fullThreshold);
    const reducedMembers = qualifying.filter(m => m.totalContributions < fullThreshold && m.totalContributions >= minThreshold);

    // If no qualifying members, nothing to distribute
    if (qualifying.length === 0) return;

    // 3. Calculate provisional shares proportional to contributions
    const totalQualifyingContributions = qualifying.reduce((sum, m) => sum + parseFloat(m.totalContributions), 0);
    const provisionalShares = {};
    for (const m of qualifying) {
      provisionalShares[m.id] = (parseFloat(m.totalContributions) / totalQualifyingContributions) * totalInterestPool;
    }

    // 4. Apply reduction to reduced members
    const reductionPercent = (contrib) => {
      const ratio = (fullThreshold - contrib) / (fullThreshold - minThreshold);
      return Math.min(ratio * 0.10, 0.10); // max 10%
    };

    let totalReductions = 0;
    const finalShares = {};

    // Reduced members
    for (const m of reducedMembers) {
      const reduction = reductionPercent(m.totalContributions);
      const reducedAmount = provisionalShares[m.id] * (1 - reduction);
      finalShares[m.id] = reducedAmount;
      totalReductions += provisionalShares[m.id] - reducedAmount;
    }

    // Full threshold members initially get full provisional
    for (const m of fullThresholdMembers) {
      finalShares[m.id] = provisionalShares[m.id];
    }

    // 5. Distribute reductions equally among full threshold members
    if (fullThresholdMembers.length > 0 && totalReductions > 0) {
      const bonusEach = totalReductions / fullThresholdMembers.length;
      for (const m of fullThresholdMembers) {
        finalShares[m.id] += bonusEach;
      }
    }

    // 6. Save interest as transactions (or record in a separate Interest table)
    // For now, we create a transaction for each member (type: 'interest_earned')
    for (const memberId in finalShares) {
      const amount = finalShares[memberId];
      await Transaction.create({
        memberId,
        date: new Date(year, 0, 31), // January 31 next year (or payout date)
        type: 'interest_earned',
        amount,
        description: `Interest for year ${year}`
      });
    }

    return finalShares;
  }
}

module.exports = InterestCalculator;