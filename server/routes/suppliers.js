const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Supplier, Product, Document } = require('../models');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all suppliers
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const suppliers = await Supplier.findAll({
      where,
      include: [{ 
        model: Product, 
        attributes: ['id', 'name'],
        where: { isActive: true },
        required: false
      }],
      order: [['name', 'ASC']]
    });

    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get supplier by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id, {
      include: [{ model: Product }]
    });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create supplier
router.post('/', [auth, authorize('admin', 'manager')], [
  body('name').notEmpty().withMessage('Supplier name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('email').optional().isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update supplier
router.put('/:id', [auth, authorize('admin', 'manager')], async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    await supplier.update(req.body);
    res.json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete supplier (soft delete)
router.delete('/:id', [auth, authorize('admin', 'manager')], async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    await supplier.update({ isActive: false });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get supplier orders
router.get('/:id/orders', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const orders = await Document.findAll({
      where: {
        supplierId: req.params.id,
        type: 'supplier_purchase_order'
      },
      include: [
        {
          model: Supplier,
          attributes: ['id', 'name', 'phone', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Format the orders to include proper structure
    const formattedOrders = orders.map(order => ({
      id: order.id,
      number: order.number,
      type: order.type,
      status: order.status || 'draft',
      amount: order.amount || 0,
      items: order.items || [],
      notes: order.notes || '',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      supplier: order.Supplier
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching supplier orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
