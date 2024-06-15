const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { User, Spot, Booking, Review, Image } = require("../../db/models");
const { bookingValidation, checkBookingConflict } = require("../../utils/validation");

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
router.put('/:bookingId', requireAuth, bookingValidation, checkBookingConflict, async (req, res, _next) => {
    const booking = await Booking.findByPk(req.params.bookingId)
    const { startDate, endDate } = req.body

    if(!booking){
        return res.status(404).json({
            message: "Booking couldn't be found"
        })
    }

    if(booking.userId !== req.user.id){
        return res
          .status(403)
          .json({ error: "You do not have permission to update this booking" });
    }

    const currentDate = new Date();
    if(currentDate > booking.endDate ){
        return res.status(403).json({
            message: "Past bookings can't be modified"
        })
    }

    const updatedBooking = await booking.update({
        startDate,
        endDate
    })

    return res.status(200).json(updatedBooking)
})

//Delete Booking
router.delete('')
module.exports = router;
