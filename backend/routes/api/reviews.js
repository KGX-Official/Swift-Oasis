const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { Review } = require("../../db/models");
const { Image } = require("../../db/models");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const reviewValidation = [];

//Get Current User Reviews
router.get("/current", requireAuth, async (req, res, _next) => {
  const currentUserReviews = await Review.findAll({
    where: {
      userId: req.user.id,
    },
    include: [
      {
        model: Image,
        as: "ReviewImages", //Aliasing the model
        attributes: ["id", "url"],
      },
    ],
  });
  return res.status(200).json(currentUserReviews);
});

router.get("/");

module.exports = router;
