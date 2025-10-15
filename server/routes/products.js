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
    if (payload.supplierId === '') payload.supplierId = null;

    console.log('Received product data:', {
      code: payload.code,
      supplierId: payload.supplierId,
      name: payload.name
    });
    
    // Vérifier si un produit avec le même code existe
    const existing = await Product.findOne({ where: { code: payload.code } });
    if (existing) {
      console.log('Found existing product:', {
        id: existing.id,
        code: existing.code,
        supplierId: existing.supplierId,
        name: existing.name
      });
      // Si le fournisseur est différent, créer un nouveau produit
      const existingSupplierId = existing.supplierId || null;
      const newSupplierId = payload.supplierId || null;
      
      // Si les deux sont null/undefined, considérer comme même fournisseur
      const hasDifferentSupplier = (
        // Les deux ont des supplierId mais ils sont différents
        (existingSupplierId && newSupplierId && existingSupplierId !== newSupplierId) ||
        // L'existant a un supplierId mais le nouveau n'en a pas
        (existingSupplierId && !newSupplierId) ||
        // L'existant n'a pas de supplierId mais le nouveau en a un
        (!existingSupplierId && newSupplierId)
      );
      
      console.log('Supplier comparison:', {
        existingSupplierId,
        newSupplierId,
        hasDifferentSupplier
      });
      
      if (hasDifferentSupplier) {
        console.log('Different supplier detected, creating new product:', {
          existingSupplierId: existing.supplierId,
          newSupplierId: payload.supplierId,
          productCode: payload.code
        });
        // Créer un nouveau produit avec un code unique
        const newCode = `${payload.code}-${Date.now()}`;
        const newProductPayload = { ...payload, code: newCode };
        if (!newProductPayload.supplierId) {
          delete newProductPayload.supplierId;
        }
        try {
          const newProduct = await Product.create(newProductPayload);
          return res.status(201).json(newProduct);
        } catch (createError) {
          // Si l'erreur est due à la colonne supplierId qui n'existe pas, essayer sans ce champ
          if (createError.message && createError.message.includes('supplierId')) {
            delete newProductPayload.supplierId;
            const newProduct = await Product.create(newProductPayload);
            return res.status(201).json(newProduct);
          }
          throw createError;
        }
      } else {
        console.log('Same supplier detected, updating existing product:', {
          existingSupplierId: existing.supplierId,
          newSupplierId: payload.supplierId,
          productCode: payload.code
        });
      }
      
      // Mettre à jour le produit existant seulement si les fournisseurs sont identiques
      if (!hasDifferentSupplier) {
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
        supplierId: payload.supplierId || existing.supplierId,
        isActive: true
        });
        return res.json(existing);
      }
    }

    // Ne pas inclure supplierId s'il est vide ou null
    const createPayload = { ...payload };
    if (!createPayload.supplierId) {
      delete createPayload.supplierId;
    }
    
    try {
      const product = await Product.create(createPayload);
      return res.status(201).json(product);
    } catch (createError) {
      // Si l'erreur est due à la colonne supplierId qui n'existe pas, essayer sans ce champ
      if (createError.message && createError.message.includes('supplierId')) {
        delete createPayload.supplierId;
        const product = await Product.create(createPayload);
        return res.status(201).json(product);
      }
      throw createError;
    }
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
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
    if (payload.supplierId === '') payload.supplierId = null;

    console.log('Updating product:', {
      id: req.params.id,
      supplierId: payload.supplierId,
      name: payload.name
    });

    try {
      await product.update(payload);
      res.json(product);
    } catch (updateError) {
      console.error('Error updating product:', updateError);
      // Si l'erreur est due à la colonne supplierId qui n'existe pas, essayer sans ce champ
      if (updateError.message && updateError.message.includes('supplierId')) {
        delete payload.supplierId;
        await product.update(payload);
        res.json(product);
      } else {
        throw updateError;
      }
    }
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