// models/Meeting.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Meeting = sequelize.define('Meeting', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  date: { type: DataTypes.DATEONLY, allowNull: false, unique: true },
  notes: { type: DataTypes.TEXT }
});

module.exports = Meeting;