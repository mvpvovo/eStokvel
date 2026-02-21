// models/Fine.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fine = sequelize.define('Fine', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  memberId: { type: DataTypes.INTEGER, allowNull: false },
  meetingId: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  reason: { type: DataTypes.STRING },
  waived: { type: DataTypes.BOOLEAN, defaultValue: false },
  waivedBy: { type: DataTypes.INTEGER } // userId
});

module.exports = Fine;