const router = require('express').Router();
const ServiceCategory = require('../models/ServiceCategory');

// GET /api/categories  (pública, sin auth)
router.get('/', async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ isActive: true }).sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
