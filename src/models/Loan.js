// models/Loan.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Loan = sequelize.define('Loan', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  memberId: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false }, // principal
  outstandingBalance: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  interestRate: { type: DataTypes.DECIMAL(5,2), defaultValue: 30.00 }, // 30% monthly
  takenAt: { type: DataTypes.DATEONLY, allowNull: false },
  lastInterestCalculation: { type: DataTypes.DATEONLY } // track last meeting when interest applied
});

module.exports = Loan;