const express = require('express');
const router = express.Router();
const { 
    getAllTechnologies,
    createTechnology,
    updateTechnology,
    deleteTechnology
} = require('../controllers/technologyController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getAllTechnologies)
    .post(protect, createTechnology);

router.route('/:id')
    .put(protect, updateTechnology)
    .delete(protect, deleteTechnology);

module.exports = router;