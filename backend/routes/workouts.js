const express = require("express");
const router = express.Router();
const workoutsController = require("../controllers/workoutsController");

router.post('/', workoutsController.logWorkout);
router.get('/', workoutsController.getAllWorkouts);
router.get('/:id', workoutsController.getWorkout);
router.put('/:id', workoutsController.editWorkout);
router.delete('/:id', workoutsController.deleteWorkout);

module.exports = router