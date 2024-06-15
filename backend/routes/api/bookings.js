const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { User, Spot, Booking, Review, Image } = require("../../db/models");
const {
  bookingValidation,
  checkBookingConflict,
} = require("../../utils/validation");

//Current User Bookings
router.get("/current", requireAuth, async (req, res, _next) => {
  const currentUserBookings = await Booking.findAll({
    where: {
      userId: req.user.id,
    },
    include: {
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
          sequelize.literal(
            "(SELECT url FROM Images WHERE Images.imageableId = Spot.id AND imageableType = 'Spot' LIMIT 1)"
          ),
          "previewImage",
        ],
      ],
    },
  });

  res.status(200).json({ Bookings: currentUserBookings });
});

//Edit Booking
router.put(
  "/:bookingId",
  requireAuth,
  bookingValidation,
  checkBookingConflict,
  async (req, res, _next) => {
    const booking = await Booking.findByPk(req.params.bookingId);
    const { startDate, endDate } = req.body;

    if (!booking) {
      return res.status(404).json({
        message: "Booking couldn't be found",
      });
    }

    if (booking.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You do not have permission to update this booking" });
    }

    const currentDate = new Date();
    if (currentDate > new Date(booking.endDate)) {
      return res.status(403).json({
        message: "Past bookings can't be modified",
      });
    }

    const updatedBooking = await booking.update({
      startDate,
      endDate,
    });

    return res.status(200).json(updatedBooking);
  }
);

//Delete Booking
router.delete("/:bookingId", requireAuth, async (req, res, next) => {
  const booking = await Booking.findByPk(req.params.bookingId);

  const spot = await Spot.findByPk(booking.spotId);

  if (!booking) {
    return res.status(404).json({
      message: "Booking couldn't be found",
    });
  }

  if (booking.userId !== req.user.id || spot.ownerId !== req.user.id) {
    return res
      .status(403)
      .json({ error: "You do not have permission to update this booking" });
  }

  const currentDate = new Date();
  if (currentDate > new Date(booking.startDate)) {
    return res.status(403).json({
      message: "Bookings that have been started can't be deleted",
    });
  }

  await booking.destroy();

  return res.status(200).json({
    message: "Successfully deleted",
  });
});

module.exports = router;
