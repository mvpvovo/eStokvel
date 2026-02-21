// routes/events.js
const express = require('express');
const { Event, Transaction } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate);

// CRUD for events (admin/treasurer)
router.get('/', authorize('admin','treasurer','auditor'), async (req, res) => {
  const events = await Event.findAll();
  res.json(events);
});

router.post('/', authorize('admin','treasurer'), async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json(event);
});

router.put('/:id', authorize('admin','treasurer'), async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  await event.update(req.body);
  res.json(event);
});

// Record actual income/expense (creates transactions)
router.post('/:id/record-income', authorize('admin','treasurer'), async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });

  const { amount, description } = req.body;
  event.actualIncome = parseFloat(event.actualIncome) + amount;
  await event.save();

  await Transaction.create({
    memberId: null, // event income not attributed to a member
    date: new Date(),
    type: 'event_income',
    amount,
    description
  });

  res.json(event);
});

// Similarly for expense
router.post('/:id/record-expense', authorize('admin','treasurer'), async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });

  const { amount, description } = req.body;
  event.actualExpense = parseFloat(event.actualExpense) + amount;
  await event.save();

  await Transaction.create({
    memberId: null,
    date: new Date(),
    type: 'event_expense',
    amount,
    description
  });

  res.json(event);
});

module.exports = router;