const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Client, Sale } = require('../models');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all clients
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

    const clients = await Client.findAll({
      where,
      include: [{ 
        model: Sale, 
        attributes: ['id', 'total', 'createdAt'],
        limit: 5,
        order: [['createdAt', 'DESC']],
        required: false
      }],
      order: [['name', 'ASC']]
    });

    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get client by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [{ 
        model: Sale,
        order: [['createdAt', 'DESC']]
      }]
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create client
router.post('/', [auth, authorize('admin', 'manager', 'cashier')], [
  body('name').notEmpty().withMessage('Client name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('email').optional().isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update client
router.put('/:id', [auth, authorize('admin', 'manager', 'cashier')], async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    await client.update(req.body);
    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete client (soft delete)
router.delete('/:id', [auth, authorize('admin', 'manager')], async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    await client.update({ isActive: false });
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
