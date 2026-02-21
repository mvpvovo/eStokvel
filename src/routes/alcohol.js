// routes/alcohol.js
const express = require('express');
const { AlcoholAssignment, Member } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate);

// Get all assignments for a year
router.get('/:year', authorize('admin','treasurer','auditor'), async (req, res) => {
  const assignments = await AlcoholAssignment.findAll({
    where: { year: req.params.year },
    include: ['member']
  });
  res.json(assignments);
});

// Create or update assignment for a member/month
router.post('/', authorize('admin','treasurer'), async (req, res) => {
  const { memberId, month, year, spirits, beerTrays, notes } = req.body;
  const [assignment, created] = await AlcoholAssignment.upsert({
    memberId, month, year, spirits, beerTrays, notes
  });
  res.status(created ? 201 : 200).json(assignment);
});

// Get assignments for a specific member (own data)
router.get('/member/:memberId/:year', async (req, res) => {
  const memberId = req.params.memberId;
  if (req.user.role === 'member' && req.user.memberId != memberId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const assignments = await AlcoholAssignment.findAll({
    where: { memberId, year: req.params.year }
  });
  res.json(assignments);
});

module.exports = router;