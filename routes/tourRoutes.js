const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.param('id',tourController.checkId)

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan').get(tourController.getMonthlyPlan);

// router
//     .route('/')
//     .get( tourController.getAlltour)
//     .post(tourController.createTour)
//authController.protec,
// router
//     .route('/:id')
//     .get(tourController.getTour)
//     .patch(tourController.updateTour)
//     .delete(authController.protec,authController.restrictTo('admin'),tourController.deleteTour)

module.exports = router;
