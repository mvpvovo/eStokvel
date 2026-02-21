// models/Transaction.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  memberId: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  type: { 
    type: DataTypes.ENUM(
      'contribution', 
      'fine', 
      'loan_disbursement', 
      'loan_repayment', 
      'loan_interest',
      'compulsory_fee',
      'event_income',
      'event_expense',
      'bank_interest'
    ),
    allowNull: false
  },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  description: { type: DataTypes.TEXT },
  meetingId: { type: DataTypes.INTEGER } // optional link to meeting
});

module.exports = Transaction;