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
    const { search, lowStock } = req.query;
    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { nameAr: { [Op.iLike]: `%${search}%` } }
      ];
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
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Sanitize payload: convert empty dates to null to avoid Invalid date errors
    const payload = { ...req.body };
    if (payload.expiryDate === '') payload.expiryDate = null;
    if (payload.arrivalDate === '') payload.arrivalDate = null;

    // Solution robuste: si un produit avec le même code existe (même inactif), on le réactive et on met à jour les champs
    const existing = await Product.findOne({ where: { code: payload.code } });
    if (existing) {
      await existing.update({
        name: payload.name ?? existing.name,
        nameAr: payload.nameAr ?? existing.nameAr,
        description: payload.description ?? existing.description,
        descriptionAr: payload.descriptionAr ?? existing.descriptionAr,
        size: payload.size ?? existing.size,
        buyPrice: payload.buyPrice ?? existing.buyPrice,
        sellPrice: payload.sellPrice ?? existing.sellPrice,
        stock: payload.stock ?? existing.stock,
        minStock: payload.minStock ?? existing.minStock,
        expiryDate: payload.expiryDate ?? existing.expiryDate,
        location: payload.location ?? existing.location,
        image: payload.image ?? existing.image,
        missingQuantity: payload.missingQuantity ?? existing.missingQuantity ?? 0,
        surplusQuantity: payload.surplusQuantity ?? existing.surplusQuantity ?? 0,
        isActive: true
      });
      return res.json(existing);
    }

    const product = await Product.create(payload);
    return res.status(201).json(product);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      // En dernier recours, renvoyer succès idempotent en retrouvant le produit et en le mettant à jour
      try {
        const existing = await Product.findOne({ where: { code: req.body.code } });
        if (existing) {
          await existing.update({ 
            stock: req.body.stock ?? existing.stock,
            missingQuantity: req.body.missingQuantity ?? existing.missingQuantity ?? 0,
            surplusQuantity: req.body.surplusQuantity ?? existing.surplusQuantity ?? 0,
            isActive: true 
          });
          return res.json(existing);
        }
      } catch (_) {}
      return res.status(200).json({ message: 'OK' });
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

    // Sanitize payload for update as well
    const payload = { ...req.body };
    if (payload.expiryDate === '') payload.expiryDate = null;
    if (payload.arrivalDate === '') payload.arrivalDate = null;

    await product.update(payload);
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