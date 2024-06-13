"use strict";

const { Review } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

const demoReviews = [
  {
    userId: 1,
    spotId: 1,
    review: "Excellent place! Web development at its finest.",
    stars: 5,
  },
  {
    userId: 3,
    spotId: 1,
    review: "I couldn't have asked for a better spot. Love it here!",
    stars: 5,
  },
  {
    userId: 1,
    spotId: 2,
    review: "Amazing place, very clean and well-maintained!",
    stars: 5,
  },
  {
    userId: 2,
    spotId: 2,
    review: "Great location, but a bit noisy at night.",
    stars: 4,
  },
  {
    userId: 3,
    spotId: 3,
    review: "Modern and comfortable. Had a wonderful stay!",
    stars: 5,
  },
  {
    userId: 1,
    spotId: 3,
    review: "Loved the amenities. Will visit again.",
    stars: 5,
  },
  {
    userId: 2,
    spotId: 4,
    review: "Cozy and quiet. Perfect for a weekend getaway.",
    stars: 4,
  },
  {
    userId: 3,
    spotId: 4,
    review: "Nice cottage, but could use some updates.",
    stars: 3,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(_queryInterface, _Sequelize) {
    await Review.bulkCreate(demoReviews, { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Reviews";
    return queryInterface.bulkDelete(options);
  },
};
