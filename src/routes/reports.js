// routes/reports.js
const express = require('express');
const { Member, Transaction, Loan, Fine, sequelize } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

router.use(authenticate);

// Member statement
router.get('/member-statement/:memberId', async (req, res) => {
  const memberId = req.params.memberId;
  if (req.user.role === 'member' && req.user.memberId != memberId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const transactions = await Transaction.findAll({
    where: { memberId },
    order: [['date', 'ASC']]
  });
  const loans = await Loan.findAll({ where: { memberId } });
  const fines = await Fine.findAll({ where: { memberId, waived: false } });

  res.json({ transactions, loans, fines });
});

// Loan book summary
router.get('/loan-book', authorize('admin','treasurer','auditor'), async (req, res) => {
  const loans = await Loan.findAll({
    where: { outstandingBalance: { [Op.gt]: 0 } },
    include: ['member']
  });
  const totalOutstanding = loans.reduce((sum, l) => sum + parseFloat(l.outstandingBalance), 0);
  res.json({ loans, totalOutstanding });
});

// Fine summary
router.get('/fine-summary', authorize('admin','treasurer','auditor'), async (req, res) => {
  const fines = await Fine.findAll({
    where: { waived: false },
    include: ['member', 'meeting']
  });
  const totalFines = fines.reduce((sum, f) => sum + parseFloat(f.amount), 0);
  res.json({ fines, totalFines });
});

// Interest projection (before year-end) – placeholder
router.get('/interest-projection', authorize('admin','treasurer','auditor'), async (req, res) => {
  // This would run the interest calculation logic with current data and project
  res.json({ message: 'To be implemented' });
});

module.exports = router;