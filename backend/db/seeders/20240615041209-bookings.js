"use strict";

const { Booking } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

const demoBookings = [
  {
    spotId: 1,
    userId: 1,
    startDate: "2024-07-01",
    endDate: "2024-07-10",
  },
  {
    spotId: 1,
    userId: 2,
    startDate: "2024-08-15",
    endDate: "2024-08-20",
  },
  {
    spotId: 2,
    userId: 3,
    startDate: "2024-09-05",
    endDate: "2024-09-12",
  },
  {
    spotId: 3,
    userId: 1,
    startDate: "2024-06-20",
    endDate: "2024-06-25",
  },
  {
    spotId: 3,
    userId: 2,
    startDate: "2024-10-01",
    endDate: "2024-10-10",
  },
  {
    spotId: 4,
    userId: 3,
    startDate: "2024-11-15",
    endDate: "2024-11-20",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(_queryInterface, _Sequelize) {
    await Booking.bulkCreate(demoBookings, { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Bookings";
    return queryInterface.bulkDelete(options);
  },
};
