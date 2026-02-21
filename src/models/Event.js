// models/Event.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY },
  budgetAmount: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  actualIncome: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  actualExpense: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  netIncome: { type: DataTypes.VIRTUAL,
    get() { return this.actualIncome - this.actualExpense; }
  }
});

module.exports = Event;