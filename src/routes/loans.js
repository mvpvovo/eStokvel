// routes/loans.js
const express = require('express');
const { Loan, Member } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const LoanService = require('../services/loanService');
const router = express.Router();

router.use(authenticate);

// Get all loans (admin/treasurer/auditor)
router.get('/', authorize('admin','treasurer','auditor'), async (req, res) => {
  const loans = await Loan.findAll({ include: ['member'] });
  res.json(loans);
});

// Get loans for a specific member (own or privileged)
router.get('/member/:memberId', async (req, res) => {
  const memberId = req.params.memberId;
  if (req.user.role === 'member' && req.user.memberId != memberId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const loans = await Loan.findAll({ where: { memberId } });
  res.json(loans);
});

// Endpoint to manually apply compulsory fee (admin/treasurer) – usually run at year-end
router.post('/apply-compulsory-fee', authorize('admin','treasurer'), async (req, res) => {
  const { year } = req.body;
  await LoanService.applyCompulsoryFee(year);
  res.json({ message: 'Compulsory fees applied' });
});

module.exports = router;