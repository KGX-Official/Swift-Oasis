"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Spots extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Spots.init(
    {
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
          isNumeric: true,
          min: 1
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255],
        },
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isAlpha: true,
          len: [1, 100],
        },
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isAlpha: true,
          len: [1, 100],
        },
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isAlpha: true,
          len: [1, 100],
        },
      },
      lat: {
        type: DataTypes.DECIMAL(12, 8),
        allowNull: false,
        validate: {
          notEmpty: true,
          min: -90,
          max: 90
        },
      },
      lng: {
        type: DataTypes.DECIMAL(12, 8),
        allowNull: false,
        validate: {
          notEmpty: true,
          min: -180,
          max: 180
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isAlpha: true,
          len: [1, 50],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notEmpty: true,
          isDecimal: true,
          min: 0,
        },
      },
    },
    {
      sequelize,
      modelName: "Spots",
    }
  );
  return Spots;
};
