"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Review.hasMany(models.Image, {
        foreignKey: "imageableId",
        constraints: false,
        scope: {
          imageableType: "Review",
        },
      });
    }
  }
  Review.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull:false,

      },
      spotId: {
        type: DataTypes.INTEGER,
        allowNull:false,

      },
      review: {
        type: DataTypes.TEXT,
        allowNull:false,
        validate: {
          notEmpty: true
        }

      },
      stars: {
        type: DataTypes.INTEGER,
        allowNull:false,
        validate: {
          len: [1,5]
        }

      }
    },
    {
      sequelize,
      modelName: "Review",
    }
  );
  return Review;
};
