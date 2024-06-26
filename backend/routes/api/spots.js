const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const { requireAuthentication } = require("../../utils/auth");
const { User, Spot, Image, Review, Booking } = require("../../db/models");
const {
  spotValidation,
  reviewValidation,
  bookingValidation,
  checkBookingConflict,
  queryValidation,
} = require("../../utils/validation");

//Get All Spots
router.get("/", queryValidation, async (req, res, _next) => {
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
    req.query;

  page = parseInt(page, 10) || 1;
  size = parseInt(size, 10) || 20;
  minLat = parseFloat(minLat);
  maxLat = parseFloat(maxLat);
  minLng = parseFloat(minLng);
  maxLng = parseFloat(maxLng);
  minPrice = parseInt(minPrice);
  maxPrice = parseInt(maxPrice);

  if (size > 20) {
    size = 20;
  }

  const limit = size;
  const offset = size * (page - 1);

  const allSpots = await Spot.findAll({
    attributes: {
      include: [
        [
          Sequelize.cast(
            Sequelize.literal(
              `(SELECT ROUND (AVG("stars"), 1) FROM "swift_oasis"."Reviews" WHERE "swift_oasis"."Reviews"."spotId" = "Spot"."id")`
            ),
            "FLOAT"
          ),
          "avgRating",
        ],

        [
          Sequelize.literal(
            `(SELECT "url" FROM "swift_oasis"."Images" WHERE "swift_oasis"."Images"."imageableId" = "Spot"."id" AND "swift_oasis"."Images"."imageableType" = 'Spot' LIMIT 1)`
          ),
          "previewImage",
        ],
      ],
    },
    limit,
    offset,
  });

  return res.json({
    Spots: allSpots,
    page,
    size,
  });
});

//Get Current User Spots
router.get("/current", requireAuthentication, async (req, res, _next) => {
  const currentUserSpots = await Spot.findAll({
    where: {
      ownerId: req.user.id,
    },
    attributes: {
      include: [
        [
          Sequelize.cast(
            Sequelize.literal(
              `(SELECT ROUND (AVG("stars"), 1) FROM "swift_oasis"."Reviews" WHERE "swift_oasis"."Reviews"."spotId" = "Spot"."id")`
            ),
            "FLOAT"
          ),
          "avgRating",
        ],
        [
          Sequelize.literal(
            `(SELECT "url" FROM "swift_oasis"."Images" WHERE "swift_oasis"."Images"."imageableId" = "Spot"."id" AND "swift_oasis"."Images"."imageableType" = 'Spot' LIMIT 1)`
          ),
          "previewImage",
        ],
      ],
    },
  });

  return res.status(200).json({
    Spots: currentUserSpots,
  });
});

//Get Spot Details
router.get("/:spotId", async (req, res, next) => {
  const spot = await Spot.findOne({
    where: {
      id: req.params.spotId,
    },
    attributes: {
      include: [
        [
          Sequelize.cast(
            Sequelize.literal(
              `(SELECT COUNT(*) FROM "swift_oasis"."Reviews" WHERE "swift_oasis"."Reviews"."spotId" = "Spot"."id")`
            ),
            "INTEGER"
          ),
          "numReviews",
        ],
        [
          Sequelize.cast(
            Sequelize.literal(
              `(SELECT ROUND (AVG("stars"), 1) FROM "swift_oasis"."Reviews" WHERE "swift_oasis"."Reviews"."spotId" = "Spot"."id")`
            ),
            "FLOAT"
          ),
          "avgStarRating",
        ],
      ],
    },
    include: [
      {
        model: Image,
        as: "SpotImages", //Aliasing the model
        where: {
          imageableId: req.params.spotId,
          imageableType: "Spot",
        },
        attributes: ["id", "url", "preview"],
      },
      {
        model: User,
        as: "Owner",
        attributes: ["id", "firstName", "lastName"],
      },
    ],
  });

  if (!spot) {
    return res.status(404).json({ error: "Spot couldn't be found" });
  }
  return res.status(200).json(spot);
});

//Create Spot
router.post(
  "/",
  requireAuthentication,
  spotValidation,
  async (req, res, _next) => {
    const {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    } = req.body;

    const spot = await Spot.create({
      ownerId: req.user.id,
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
  }
);

//Add Image to Spot
router.post(
  "/:spotId/images",
  requireAuthentication,
  async (req, res, next) => {
    const spot = await Spot.findByPk(req.params.spotId);

    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
      });
    }

    if (spot.ownerId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden"});
    }

    const { url, preview } = req.body;

    const newImage = await Image.create({
      imageableId: req.params.spotId,
      imageableType: "Spot",
      url: url,
      preview: preview,
    });

    return res.status(201).json({
      id: newImage.id,
      url: newImage.url,
      preview: newImage.preview,
    });
  }
);

//Edit Spot
router.put(
  "/:spotId",
  requireAuthentication,
  spotValidation,
  async (req, res, _next) => {
    const spot = await Spot.findByPk(req.params.spotId);

    if (!spot) {
      return res.status(404).json({ error: "Spot couldn't be found" });
    }

    if (spot.ownerId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden"});
    }

    const {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    } = req.body;

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
  }
);

//Delete Spot
router.delete("/:spotId", requireAuthentication, async (req, res, _next) => {
  const spot = await Spot.findByPk(req.params.spotId);

  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  if (spot.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
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
  requireAuthentication,
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

    const { review, stars } = req.body;

    const spotReview = await Review.create({
      userId: req.user.id,
      spotId: req.params.spotId,
      review: review,
      stars: stars,
    });

    return res.status(201).json(spotReview);
  }
);

//Get all Bookings for a Spot
router.get(
  "/:spotId/bookings",
  requireAuthentication,
  async (req, res, _next) => {
    const spot = await Spot.findByPk(req.params.spotId);

    if (!spot) {
      return res.status(404).json({ error: "Spot couldn't be found" });
    }

    //If you ARE NOT the owner
    const currentBookings = await Booking.findAll({
      attributes: ["spotId", "startDate", "endDate"],
      where: {
        spotId: req.params.spotId,
      },
    });
    if (spot.ownerId !== req.user.id) {
      return res.status(200).json({
        Bookings: currentBookings,
      });
    }

    //If you ARE the owner
    const currentBookingDetails = await Booking.findAll({
      where: {
        spotId: req.params.spotId,
      },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });
    if (spot.ownerId === req.user.id) {
      return res.status(200).json({
        Bookings: currentBookingDetails,
      });
    }
  }
);

//Create New Booking
router.post(
  "/:spotId/bookings",
  requireAuthentication,
  bookingValidation,
  checkBookingConflict,
  async (req, res, _next) => {
    const spot = await Spot.findByPk(req.params.spotId);

    if (!spot) {
      return res.status(404).json({ error: "Spot couldn't be found" });
    }

    const { startDate, endDate } = req.body;

    const newBooking = await Booking.create({
      spotId: req.params.spotId,
      userId: req.user.id,
      startDate: startDate,
      endDate: endDate,
    });

    return res.status(201).json(newBooking);
  }
);
module.exports = router;
