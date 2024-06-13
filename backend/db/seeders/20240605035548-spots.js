"use strict";

const { Spot } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

const demoSpots = [
  {
    ownerId: 1,
    address: "123 Disney Lane",
    city: "San Francisco",
    state: "California",
    country: "United States of America",
    lat: 37.7645358,
    lng: -122.4730327,
    name: "App Academy",
    description: "Place where web developers are created",
    price: 123.0,
  },
  {
    ownerId: 2,
    address: "123 Main St",
    city: "Springfield",
    state: "Illinois",
    country: "USA",
    lat: 39.7817,
    lng: -89.6501,
    name: "Charming Bungalow",
    description: "A charming bungalow located in the heart of Springfield.",
    price: 150.0,
  },
  {
    ownerId: 3,
    address: "456 Elm St",
    city: "Gotham",
    state: "New York",
    country: "USA",
    lat: 40.7128,
    lng: -74.006,
    name: "Modern Apartment",
    description: "A modern apartment with all amenities.",
    price: 200.0,
  },
  {
    ownerId: 4,
    address: "789 Oak St",
    city: "Metropolis",
    state: "New York",
    country: "USA",
    lat: 40.7128,
    lng: -74.0059,
    name: "Cozy Cottage",
    description: "A cozy cottage in a quiet neighborhood.",
    price: 120.0,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(_queryInterface, _Sequelize) {
    await Spot.bulkCreate(demoSpots, {});
  },

  async down(queryInterface, _Sequelize) {
    options.tableName = "Spots";
    return queryInterface.bulkDelete(options);
  },
};
