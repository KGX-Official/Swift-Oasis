const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { Spot } = require("../../db/models");
const { Image } = require("../../db/models");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const spotValidation = [
  check("address").notEmpty().withMessage("Street address is required"),
  check("city").notEmpty().withMessage("City is required"),
  check("state").notEmpty().withMessage("State is required"),
  check("country").notEmpty().withMessage("Country is required"),
  check("lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be within -90 and 90"),
  check("lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be within -180 and 180"),
  check("name")
    .notEmpty()
    .isLength({ max: 50 })
    .withMessage("Name must be less than 50 characters"),
  check("description").notEmpty().withMessage("Description is required"),
  check("price")
    .isFloat({ min: 0 })
    .withMessage("Price per day must be a positive number"),
  handleValidationErrors,
];

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
    return res.json(404).json({
      message: "Spot couldn't be found",
    });
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

  await spot.update([
    {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    },
  ]);

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

module.exports = router;
