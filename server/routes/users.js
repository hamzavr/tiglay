const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { auth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const router = express.Router();

// Middleware pour vérifier si l'utilisateur est admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé. Seuls les administrateurs peuvent gérer les utilisateurs.' });
  }
  next();
};

// Obtenir tous les utilisateurs (admin seulement)
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'isActive', 'lastLogin', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des utilisateurs' });
  }
});

// Créer un nouvel utilisateur (admin seulement)
router.post('/', auth, requireAdmin, [
  body('username').isLength({ min: 3 }).withMessage('Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  body('email').isEmail().withMessage('Veuillez fournir un email valide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('role').isIn(['admin', 'manager', 'cashier']).withMessage('Le rôle doit être admin, manager ou cashier')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email ou nom d\'utilisateur existe déjà' });
    }

    // Créer le nouvel utilisateur
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'cashier',
      isActive: true
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'utilisateur' });
  }
});

// Mettre à jour un utilisateur (admin seulement)
router.put('/:id', auth, requireAdmin, [
  body('username').optional().isLength({ min: 3 }).withMessage('Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  body('email').optional().isEmail().withMessage('Veuillez fournir un email valide'),
  body('password').optional().isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('role').optional().isIn(['admin', 'manager', 'cashier']).withMessage('Le rôle doit être admin, manager ou cashier'),
  body('isActive').optional().isBoolean().withMessage('Le statut doit être un booléen')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { username, email, password, role, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'email ou le nom d'utilisateur est déjà utilisé par un autre utilisateur
    if (email || username) {
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            ...(email ? [{ email }] : []),
            ...(username ? [{ username }] : [])
          ],
          id: { [Op.ne]: id }
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Un utilisateur avec cet email ou nom d\'utilisateur existe déjà' });
      }
    }

    // Préparer les données à mettre à jour
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    // Si un nouveau mot de passe est fourni, le hasher
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    await user.update(updateData);

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'utilisateur' });
  }
});

// Supprimer un utilisateur (admin seulement)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Empêcher l'admin de se supprimer lui-même
    if (req.user.id === id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    await user.destroy();

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'utilisateur' });
  }
});

// Obtenir un utilisateur spécifique (admin seulement)
router.get('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'email', 'role', 'isActive', 'lastLogin', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'utilisateur' });
  }
});

module.exports = router;
