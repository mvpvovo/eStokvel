// models/AlcoholAssignment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AlcoholAssignment = sequelize.define('AlcoholAssignment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  memberId: { type: DataTypes.INTEGER, allowNull: false },
  month: { type: DataTypes.INTEGER, allowNull: false }, // 1-12
  year: { type: DataTypes.INTEGER, allowNull: false },
  spirits: { type: DataTypes.STRING }, // description or count
  beerTrays: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT }
});

module.exports = AlcoholAssignment;