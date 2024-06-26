"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    getImageable(options) {
      if (!this.imageableType) return Promise.resolve(null);
      const mixinMethodName = `get${this.imageableType}`;
      return this[mixinMethodName](options);
    }

    static associate(models) {
      Image.belongsTo(models.Spot, {
        foreignKey: "imageableId",
        constraints: false,
        as: "SpotImages",
      });
      Image.belongsTo(models.Review, {
        foreignKey: "imageableId",
        constraints: false,
        as: "ReviewImages",
      });
    }
  }
  Image.init(
    {
      imageableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      imageableType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 255],
          notEmpty: true,
        },
      },
      preview: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Image",
    }
  );
  return Image;
};
