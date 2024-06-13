"use strict";

const { Review } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

const demoReviews = [
  {
    spotId: 1,
    userId: 1,
    review: "Excellent place! Web development at its finest.",
    rating: 5,
  },
  {
    spotId: 1,
    userId: 3,
    review: "I couldn't have asked for a better spot. Love it here!",
    rating: 5,
  },
  {
    spotId: 2,
    userId: 1,
    review: "Amazing place, very clean and well-maintained!",
    rating: 5,
  },
  {
    spotId: 2,
    userId: 2,
    review: "Great location, but a bit noisy at night.",
    rating: 4,
  },
  {
    spotId: 3,
    userId: 3,
    review: "Modern and comfortable. Had a wonderful stay!",
    rating: 5,
  },
  {
    spotId: 3,
    userId: 1,
    review: "Loved the amenities. Will visit again.",
    rating: 5,
  },
  {
    spotId: 4,
    userId: 2,
    review: "Cozy and quiet. Perfect for a weekend getaway.",
    rating: 4,
  },
  {
    spotId: 4,
    userId: 3,
    review: "Nice cottage, but could use some updates.",
    rating: 3,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(_queryInterface, _Sequelize) {
    await Review.bulkCreate(demoReviews, { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Reviews";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      review: {
        [Op.in]: [
          "Excellent place! Web development at its finest.",
          "I couldn't have asked for a better spot. Love it here!",
          "Amazing place, very clean and well-maintained!",
          "Great location, but a bit noisy at night.",
          "Modern and comfortable. Had a wonderful stay!",
          "Loved the amenities. Will visit again.",
          "Cozy and quiet. Perfect for a weekend getaway.",
          "Nice cottage, but could use some updates.",
        ],
      },
    });
  },
};
