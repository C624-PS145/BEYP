const express = require('express');
const router = express.Router();
const { getPortfolioContext } = require('../controllers/portfolioContextController');

router.get('/', getPortfolioContext);

module.exports = router;
