const express = require('express');
const router = express.Router();
const { 
    getAllExperience, 
    createExperience,
    updateExperience,
    deleteExperience
} = require('../controllers/experienceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getAllExperience)
    .post(protect, createExperience);

router.route('/:id')
    .put(protect, updateExperience)
    .delete(protect, deleteExperience);

module.exports = router;
