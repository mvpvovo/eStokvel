// routes/members.js
const express = require('express');
const { Member, User, Transaction } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate);

// Get all members (admin/treasurer/auditor)
router.get('/', authorize('admin','treasurer','auditor'), async (req, res) => {
  const members = await Member.findAll();
  res.json(members);
});

// Get single member (own data if member, or all if privileged)
router.get('/:id', async (req, res) => {
  const memberId = req.params.id;
  if (req.user.role === 'member' && req.user.memberId != memberId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const member = await Member.findByPk(memberId, {
    include: [{ model: Transaction, as: 'transactions' }]
  });
  res.json(member);
});

// Create member (admin/treasurer)
router.post('/', authorize('admin','treasurer'), async (req, res) => {
  const member = await Member.create(req.body);
  res.status(201).json(member);
});

// Update member (admin/treasurer)
router.put('/:id', authorize('admin','treasurer'), async (req, res) => {
  const member = await Member.findByPk(req.params.id);
  if (!member) return res.status(404).json({ error: 'Not found' });
  await member.update(req.body);
  res.json(member);
});

// Delete member (admin only)
router.delete('/:id', authorize('admin'), async (req, res) => {
  const member = await Member.findByPk(req.params.id);
  if (!member) return res.status(404).json({ error: 'Not found' });
  await member.destroy();
  res.json({ message: 'Deleted' });
});

module.exports = router;