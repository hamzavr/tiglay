const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Document, Supplier, Client, User } = require('../models');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all documents
router.get('/', auth, async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    const where = {};

    if (type && type !== 'all') {
      where.type = type;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const documents = await Document.findAll({
      where,
      include: [
        { model: Supplier, attributes: ['name'], required: false },
        { model: Client, attributes: ['name'], required: false },
        { model: User, attributes: ['username'], required: false }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get document by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        { model: Supplier },
        { model: Client },
        { model: User, attributes: ['username'] }
      ]
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create document
router.post('/', [auth, authorize('admin', 'manager', 'cashier')], [
  body('type').notEmpty().withMessage('Document type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate document number if not provided
    const generateDocumentNumber = (type) => {
      const prefix = {
        'supplier_purchase_order': 'BC',
        'reception_slip': 'BR',
        'stock_entry': 'ES',
        'customer_sales_order': 'VT',
        'delivery_note': 'BL',
        'invoice': 'FA'
      }[type] || 'DOC';
      
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `${prefix}${year}-${random}`;
    };

    // Get workflow step based on type
    const getWorkflowStep = (type) => {
      const steps = {
        'supplier_purchase_order': 1,
        'reception_slip': 2,
        'stock_entry': 3,
        'customer_sales_order': 4,
        'delivery_note': 5,
        'invoice': 6
      };
      return steps[type] || 1;
    };

    const documentData = {
      ...req.body,
      number: req.body.number || generateDocumentNumber(req.body.type),
      workflowStep: req.body.workflowStep || getWorkflowStep(req.body.type),
      userId: req.user.id
    };

    console.log('Creating document with data:', documentData);

    const document = await Document.create(documentData);

    // Fetch the created document with associations
    const createdDocument = await Document.findByPk(document.id, {
      include: [
        { model: Supplier, attributes: ['name'], required: false },
        { model: Client, attributes: ['name'], required: false },
        { model: User, attributes: ['username'], required: false }
      ]
    });

    res.status(201).json(createdDocument);
  } catch (error) {
    console.error('Error creating document:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Document number already exists' });
    }
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update document
router.put('/:id', [auth, authorize('admin', 'manager', 'cashier')], async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Log the request body for debugging
    console.log('Updating document with data:', req.body);

    // Only update allowed fields to prevent issues
    const allowedFields = ['status', 'notes', 'amount', 'paidAmount', 'paymentMethod', 'clientId', 'supplierId'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    console.log('Filtered update data:', updateData);

    await document.update(updateData);
    
    // Fetch the updated document with associations
    const updatedDocument = await Document.findByPk(req.params.id, {
      include: [
        { model: Supplier, attributes: ['name'], required: false },
        { model: Client, attributes: ['name'], required: false },
        { model: User, attributes: ['username'], required: false }
      ]
    });

    res.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete document
router.delete('/:id', [auth, authorize('admin', 'manager')], async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await document.destroy();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get workflow statistics
router.get('/workflow/stats', auth, async (req, res) => {
  try {
    const stats = await Promise.all([
      Document.count({ where: { type: 'supplier_purchase_order' } }),
      Document.count({ where: { type: 'reception_slip' } }),
      Document.count({ where: { type: 'stock_entry' } }),
      Document.count({ where: { type: 'customer_sales_order' } }),
      Document.count({ where: { type: 'delivery_note' } }),
      Document.count({ where: { type: 'invoice' } })
    ]);

    res.json({
      purchaseOrders: stats[0],
      receptionSlips: stats[1],
      stockEntries: stats[2],
      salesOrders: stats[3],
      deliveryNotes: stats[4],
      invoices: stats[5]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
