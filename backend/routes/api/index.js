const router = require("express").Router();
const sessionRouter = require("./session.js");
const usersRouter = require("./users.js");
const spotsRouter = require("./spots.js");
const reviewsRouter = require("./reviews.js");
const bookingsRouter = require("./bookings.js");

const { restoreUser, requireAuth } = require("../../utils/auth.js");

const { Image, Review, Spot } = require("../../db/models");

router.use(restoreUser);

router.use("/session", sessionRouter);
router.use("/users", usersRouter);
router.use("/spots", spotsRouter);
router.use("/reviews", reviewsRouter);
router.use("/bookings", bookingsRouter);

//Test Route
// router.post("/test", (req, res) => {
//   res.json({ requestBody: req.body });
// });

//Delete Spot Image
router.delete("/spot-images/:imageId", requireAuth, async (req, res, _next) => {
  const image = await Image.findOne({
    where: {
      imageableId: req.params.imageId,
      imageableType: "Spot",
    },
  });

  if (!image) {
    return res.status(404).json({ message: "Spot image couldn't be found" });
  }

  const spot = await Spot.findByPk(image.imageableId);
  if (spot.ownerId !== req.user.id) {
    return res
      .status(403)
      .json({ message: "You do not have permission to delete this image" });
  }

  await image.destroy();

  return res.status(200).json({
    message: "Successfully deleted",
  });
});

//Delete Review Spot
router.delete(
  "/review-images/:imageId",
  requireAuth,
  async (req, res, _next) => {
    const image = await Image.findOne({
      where: {
        imageableId: req.params.imageId,
        imageableType: "Review",
      },
    });

    if (!image) {
      return res
        .status(404)
        .json({ message: "Review image couldn't be found" });
    }

    const review = await Review.findByPk(image.imageableId);
    if (review.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this image" });
    }

    await image.destroy();

    return res.status(200).json({
      message: "Successfully deleted",
    });
  }
);

module.exports = router;
