const User = require('./User');
const Member = require('./Member');
const Transaction = require('./Transaction');
const Loan = require('./Loan');
const Meeting = require('./Meeting');
const Fine = require('./Fine');
const Event = require('./Event');
const AlcoholAssignment = require('./AlcoholAssignment');

// Define associations here if needed (optional for now)

module.exports = {
  User,
  Member,
  Transaction,
  Loan,
  Meeting,
  Fine,
  Event,
  AlcoholAssignment
};