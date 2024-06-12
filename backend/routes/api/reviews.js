const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { Review, Image } = require("../../db/models");
const { reviewValidation } = require("../../utils/validation");



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

//Add Review Image
router.post('/:reviewId/images', requireAuth, async (req, res, _next) => {
    const review = await Review.findByPk(req.params.reviewId)

    if(!review){
        return res.status(404).json({
          message: "Review couldn't be found",
        });
    }
    if(review.userId !== req.user.id){
        return res
          .status(403)
          .json({ message: "You do not have permission to update this review" });
    }

    const reviewImages = await Image.findAll({
        where: {
            imageableId: req.params.reviewId,
            imageableType: "Review"
        }
    })

    if(reviewImages.length === 10){
        return res.status(403).json({
          message: "Maximum number of images for this resource was reached",
        });
    }
    const { url } = req.body
    const newReviewImage = await Image.create({
        imageableId: req.params.reviewId,
        imageableType: "Review",
        url: url,
        preview: false
    })

    return res.status(201).json({
        id: newReviewImage.id,
        url: newReviewImage.url
    })
})

router.put("/:reviewId", requireAuth, reviewValidation, async (req, res, next) => {
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

     const { reviewEdit, starsEdit } = req.body
     await review.update({
        review: reviewEdit,
        stars: starsEdit
     })

     return res.status(200).json(review)
});

router.delete('/:reviewId', requireAuth, async (req, res, next) => {
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

    await review.destroy()

    return res.status(200).json({
        message: "Successfully deleted"
    })
})

module.exports = router;