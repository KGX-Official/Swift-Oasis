const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { User, Spot, Review, Image } = require("../../db/models");
const { bookingValidation } = require("../../utils/validation");


module.exports = router;
