const express = require('express');
const { body, validationResult } = require('express-validator');
const { Product, Supplier } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const router = express.Router();

// Get all products
router.get('/', auth, async (req, res) => {
  try {
    const { search, category, lowStock } = req.query;
    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { nameAr: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (lowStock === 'true') {
      where[Op.and] = [
        sequelize.where(
          sequelize.col('stock'),
          Op.lte,
          sequelize.col('minStock')
        )
      ];
    }

    const products = await Product.findAll({
      where,
      include: [{ model: Supplier, attributes: ['name'] }],
      order: [['name', 'ASC']]
    });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Supplier }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product
router.post('/', [auth, authorize('admin', 'manager')], [
  body('name').notEmpty().withMessage('Product name is required'),
  body('code').notEmpty().withMessage('Product code is required'),
  body('buyPrice').isNumeric().withMessage('Buy price must be a number'),
  body('sellPrice').isNumeric().withMessage('Sell price must be a number'),
  body('category').notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Product code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', [auth, authorize('admin', 'manager')], async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.update(req.body);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', [auth, authorize('admin', 'manager')], async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.update({ isActive: false });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;