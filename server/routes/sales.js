const express = require('express');
const { Op } = require('sequelize');
const { Sale, SaleItem, Product, Client } = require('../models');
const { auth } = require('../middleware/auth');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

const router = express.Router();

// Get all sales
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const sales = await Sale.findAll({
      where,
      include: [
        { model: Client, attributes: ['name', 'phone'] },
        { 
          model: SaleItem, 
          include: [{ model: Product, attributes: ['name', 'code'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create sale
router.post('/', auth, async (req, res) => {
  try {
    const { items, clientId, paymentMethod, total } = req.body;
    
    console.log('Sale creation request:', { items, clientId, paymentMethod, total });

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }
    
    if (!total || total <= 0) {
      return res.status(400).json({ message: 'Total must be greater than 0' });
    }

    // Create sale
    const sale = await Sale.create({
      total: parseFloat(total),
      paymentMethod,
      clientId: clientId || null,
      userId: req.user.id
    });

    // Create sale items and update stock
    for (const item of items) {
      await SaleItem.create({
        saleId: sale.id,
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      });

      // Update product stock
      const product = await Product.findByPk(item.id);
      await product.update({
        stock: product.stock - item.quantity,
        totalPurchases: product.totalPurchases + item.quantity
      });
    }

    // Update client total purchases
    if (clientId) {
      const client = await Client.findByPk(clientId);
      await client.update({
        totalPurchases: client.totalPurchases + parseFloat(total)
      });
    }

    // Generate PDF invoice
    const pdfPath = await generateInvoicePDF(sale.id);

    const completeSale = await Sale.findByPk(sale.id, {
      include: [
        { model: Client },
        { 
          model: SaleItem, 
          include: [{ model: Product }]
        }
      ]
    });

    res.status(201).json({ sale: completeSale, pdfPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sales statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = await Sale.sum('total', {
      where: {
        createdAt: { [Op.gte]: today },
        status: 'completed'
      }
    });

    const totalSales = await Sale.count();
    
    const recentSales = await Sale.findAll({
      limit: 5,
      include: [
        { model: Client, attributes: ['name'] },
        { 
          model: SaleItem, 
          include: [{ model: Product, attributes: ['name'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      todaySales: todaySales || 0,
      totalSales,
      recentSales
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;