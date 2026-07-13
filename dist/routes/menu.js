"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MenuItem_1 = __importDefault(require("../models/MenuItem"));
const router = express_1.default.Router();
// Get all menu items
router.get('/', async (req, res) => {
    try {
        const menuItems = await MenuItem_1.default.find({ isAvailable: true });
        res.json(menuItems);
    }
    catch (error) {
        console.error('Get menu error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Get menu items by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const menuItems = await MenuItem_1.default.find({ category, isAvailable: true });
        res.json(menuItems);
    }
    catch (error) {
        console.error('Get menu by category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Get popular menu items
router.get('/popular', async (req, res) => {
    try {
        const menuItems = await MenuItem_1.default.find({ isPopular: true, isAvailable: true });
        res.json(menuItems);
    }
    catch (error) {
        console.error('Get popular menu error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Get menu item by ID
router.get('/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem_1.default.findOne({ id: req.params.id, isAvailable: true });
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(menuItem);
    }
    catch (error) {
        console.error('Get menu item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Seed menu data (for development)
router.post('/seed', async (req, res) => {
    try {
        // Check if menu is already seeded
        const existingItems = await MenuItem_1.default.countDocuments();
        if (existingItems > 0) {
            return res.status(400).json({ message: 'Menu already seeded' });
        }
        const menuData = [
            // Starters
            {
                id: '1',
                name: 'Paneer Tikka',
                description: 'Marinated cottage cheese cubes grilled to perfection with bell peppers and onions in tandoor',
                price: 299,
                image: '/src/assets/dish-paneer-tikka.jpg',
                category: 'starters',
                isPopular: true,
                isVeg: true,
                spiceLevel: 'medium'
            },
            {
                id: '2',
                name: 'Chicken Malai Tikka',
                description: 'Creamy and tender chicken pieces marinated in cheese, cream and mild spices',
                price: 349,
                image: '/src/assets/dish-malai-tikka.jpg',
                category: 'starters',
                isPopular: true,
                spiceLevel: 'mild'
            },
            {
                id: '3',
                name: 'Samosa (2 pcs)',
                description: 'Crispy fried pastry filled with spiced potatoes, peas and aromatic herbs',
                price: 99,
                image: '/src/assets/dish-samosa.jpg',
                category: 'starters',
                isVeg: true,
                spiceLevel: 'medium'
            },
            // Add more menu items as needed...
        ];
        await MenuItem_1.default.insertMany(menuData);
        res.json({ message: 'Menu seeded successfully' });
    }
    catch (error) {
        console.error('Seed menu error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
