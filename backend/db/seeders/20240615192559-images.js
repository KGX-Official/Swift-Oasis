"use strict";

const { Image } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // use schema in production
}

const demoImages = [
  {
    imageableId: 1,
    imageableType: "Spot",
    url: "https://example.com/images/spot1.jpg",
    preview: true,
  },
  {
    imageableId: 1,
    imageableType: "Spot",
    url: "https://example.com/images/spot1-1.jpg",
    preview: false,
  },
  {
    imageableId: 2,
    imageableType: "Spot",
    url: "https://example.com/images/spot2.jpg",
    preview: true,
  },
  {
    imageableId: 2,
    imageableType: "Spot",
    url: "https://example.com/images/spot2-1.jpg",
    preview: false,
  },
  {
    imageableId: 3,
    imageableType: "Spot",
    url: "https://example.com/images/spot3.jpg",
    preview: true,
  },
  {
    imageableId: 3,
    imageableType: "Spot",
    url: "https://example.com/images/spot3-1.jpg",
    preview: false,
  },
  {
    imageableId: 4,
    imageableType: "Spot",
    url: "https://example.com/images/spot4.jpg",
    preview: true,
  },
  {
    imageableId: 4,
    imageableType: "Spot",
    url: "https://example.com/images/spot4-1.jpg",
    preview: false,
  },
  {
    imageableId: 1,
    imageableType: "Review",
    url: "https://example.com/images/review1.jpg",
    preview: true,
  },
  {
    imageableId: 2,
    imageableType: "Review",
    url: "https://example.com/images/review2.jpg",
    preview: true,
  },
  {
    imageableId: 3,
    imageableType: "Review",
    url: "https://example.com/images/review3.jpg",
    preview: true,
  },
  {
    imageableId: 4,
    imageableType: "Review",
    url: "https://example.com/images/review4.jpg",
    preview: true,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(_queryInterface, _Sequelize) {
    await Image.bulkCreate(demoImages, { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Images";
    return queryInterface.bulkDelete(options);
  },
};
