// models/Member.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Member = sequelize.define('Member', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  beneficiaryName: { type: DataTypes.STRING },
  beneficiaryPhone: { type: DataTypes.STRING },
  joinDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  status: { 
    type: DataTypes.ENUM('active', 'deceased', 'left'),
    defaultValue: 'active'
  },
  currentBalance: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 }, // contributions - loans
  totalBorrowed: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 }, // sum of loan principals taken
  totalContributions: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 } // total contributed this year
});

module.exports = Member;