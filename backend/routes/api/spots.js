const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { Spot, Image, Review } = require("../../db/models");
const { spotValidation, reviewValidation } = require("../../utils/validation");

// const checkSpotStatus = async () => {
//   const spot = await Spot.findByPk(req.params.spotId);

//   if (!spot) {
//     return res.status(404).json({ error: "Spot couldn't be found" });
//   }

//   return spot;
// };

//Get All Spots
router.get("/", async (_req, res, _next) => {
  const allSpots = await Spot.findAll();
  return res.json(allSpots);
});

//Get Current User Spots
router.get("/current", requireAuth, async (req, res, _next) => {
  const currentUserSpots = await Spot.findAll({
    where: {
      ownerId: req.user.id,
    },
  });
  return res.status(200).json(currentUserSpots);
});

//Get Spot Details
router.get("/:spotId", async (req, res, next) => {
  const spot = await Spot.findByPk(req.params.spotId);

  if (!spot) {
    return res.status(404).json({ error: "Spot couldn't be found" });
  }
  return res.status(200).json(spot);
});

//Create Spot
router.post("/", requireAuth, spotValidation, async (req, res, _next) => {
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;

  const spot = await Spot.create({
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
  });

  return res.status(201).json(spot);
});

//Add Image to Spot
router.post("/:spotId/images", requireAuth, async (req, res, next) => {
  const spot = await Spot.findByPk(req.params.spotId);

  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }

  if (spot.ownerId !== req.user.id) {
    return res
      .status(403)
      .json({ error: "You do not have permission to update this spot" });
  }

  const { url, preview } = req.body;

  await Image.create({
    imageableId: parseInt(req.params.spotId),
    imageableType: "Spot",
    url: url,
    preview: preview,
  });

  return res.status(201).json({
    id,
    url,
    preview,
  });
});

//Edit Spot
router.put("/:spotId", requireAuth, spotValidation, async (req, res, _next) => {
  const spot = await Spot.findByPk(req.params.spotId);

  if (!spot) {
    return res.status(404).json({ error: "Spot couldn't be found" });
  }

  if (spot.ownerId !== req.user.id) {
    return res
      .status(403)
      .json({ error: "You do not have permission to update this spot" });
  }

  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;

  await spot.update({
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
  });

  return res.status(200).json(spot);
});

//Delete Spot
router.delete("/:spotId", async (req, res, _next) => {
  const spot = await Spot.findByPk(req.params.spotId);

  if (!spot) {
    return res.status(404).json({ error: "Spot couldn't be found" });
  }
  await spot.destroy();

  return res.status(200).json({
    message: " Successfully deleted",
  });
});

//Get all Spot's reviews
router.get("/:spotId/reviews", async (req, res, next) => {
  const spot = await Spot.findByPk(req.params.spotId);

  if (!spot) {
    return res.status(404).json({ error: "Spot couldn't be found" });
  }

  const spotReviews = await Review.findAll({
    where: {
      spotId: req.params.spotId,
    },
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: Image,
        as: "ReviewImages", //Aliasing the model
        attributes: ["id", "url"],
      },
    ],
  });
  return res.status(200).json({ Reviews: spotReviews });
});

//Create new Spot Review
router.post(
  "/:spotId/reviews",
  requireAuth,
  reviewValidation,
  async (req, res, _next) => {
    const spot = await Spot.findByPk(req.params.spotId);

    if (!spot) {
      return res.status(404).json({ error: "Spot couldn't be found" });
    }

    const existingReview = await Review.findOne({
      where: {
        userId: req.user.id,
        spotId: req.params.spotId,
      },
    });

    if (existingReview) {
      return res
        .status(500)
        .json({ message: "User already has a review for this spot" });
    }

    const { newReview, stars } = req.body;

    const spotReview = await Review.create({
      userId: req.user.id,
      spotId: req.params.spotId,
      review: newReview,
      stars: stars,
    });

    return res.status(201).json(spotReview);
  }
);

module.exports = router;
