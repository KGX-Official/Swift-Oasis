const express = require("express");
const router = express.Router();
const sequelize = require("sequelize");
const { requireAuthentication } = require("../../utils/auth");
const { Review, Image, Spot, User } = require("../../db/models");
const { reviewValidation } = require("../../utils/validation");

//Get Current User Reviews
router.get("/current", requireAuthentication, async (req, res, _next) => {
  const currentUserReviews = await Review.findAll({
    where: {
      userId: req.user.id,
    },
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: Spot,
        attributes: [
          "id",
          "ownerId",
          "address",
          "city",
          "state",
          "country",
          "lat",
          "lng",
          "name",
          "price",
          [
            //Use Spot.id due to nesting
            sequelize.literal(
              "(SELECT url FROM Images WHERE Images.imageableId = Spot.id AND imageableType = 'Spot' LIMIT 1)"
            ),
            "previewImage",
          ],
        ],
      },
      {
        model: Image,
        as: "ReviewImages", //Aliasing the model
        attributes: ["id", "url"],
      },
    ],
  });
  return res.status(200).json({
    Reviews: currentUserReviews,
  });
});

//Add Review Image
router.post(
  "/:reviewId/images",
  requireAuthentication,
  async (req, res, _next) => {
    const review = await Review.findByPk(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review couldn't be found",
      });
    }
    if (review.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You do not have permission to update this review" });
    }

    const reviewImages = await Image.findAll({
      where: {
        imageableId: req.params.reviewId,
        imageableType: "Review",
      },
    });

    if (reviewImages.length === 10) {
      return res.status(403).json({
        message: "Maximum number of images for this resource was reached",
      });
    }
    const { url } = req.body;
    const newReviewImage = await Image.create({
      imageableId: req.params.reviewId,
      imageableType: "Review",
      url: url,
      preview: false,
    });

    return res.status(201).json({
      id: newReviewImage.id,
      url: newReviewImage.url,
    });
  }
);

//Edit Review
router.put(
  "/:reviewId",
  requireAuthentication,
  reviewValidation,
  async (req, res, next) => {
    const review = await Review.findByPk(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        message: "Review couldn't be found",
      });
    }
    if (review.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You do not have permission to update this review" });
    }

    const { reviewEdit, starsEdit } = req.body;
    await review.update({
      review: reviewEdit,
      stars: starsEdit,
    });

    return res.status(200).json(review);
  }
);

router.delete("/:reviewId", requireAuthentication, async (req, res, next) => {
  const review = await Review.findByPk(req.params.reviewId);

  if (!review) {
    return res.status(404).json({
      message: "Review couldn't be found",
    });
  }
  if (review.userId !== req.user.id) {
    return res
      .status(403)
      .json({ message: "You do not have permission to update this review" });
  }

  await review.destroy();

  return res.status(200).json({
    message: "Successfully deleted",
  });
});

module.exports = router;
