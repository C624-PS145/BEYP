const express = require('express');
const router = express.Router();
const { 
    getAllCertifications, 
    createCertification, 
    updateCertification, 
    deleteCertification 
} = require('../controllers/certificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getAllCertifications)
    .post(protect, createCertification);

router.route('/:id')
    .put(protect, updateCertification)
    .delete(protect, deleteCertification);

module.exports = router;
