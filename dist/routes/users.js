"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get user profile
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Update user profile
router.put('/profile', auth_1.authenticateToken, [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    (0, express_validator_1.body)('phone').optional().trim().isLength({ min: 10 }).withMessage('Valid phone number is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, phone } = req.body;
        const user = await User_1.default.findByIdAndUpdate(req.user.userId, { name, phone }, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            message: 'Profile updated successfully',
            user
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Add address
router.post('/addresses', auth_1.authenticateToken, [
    (0, express_validator_1.body)('label').trim().isLength({ min: 1 }).withMessage('Label is required'),
    (0, express_validator_1.body)('fullAddress').trim().isLength({ min: 5 }).withMessage('Full address is required'),
    (0, express_validator_1.body)('city').trim().isLength({ min: 1 }).withMessage('City is required'),
    (0, express_validator_1.body)('pincode').trim().isLength({ min: 6 }).withMessage('Valid pincode is required'),
    (0, express_validator_1.body)('phone').trim().isLength({ min: 10 }).withMessage('Valid phone number is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const addressData = req.body;
        const user = await User_1.default.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Generate unique ID for address
        const addressId = Date.now().toString();
        const newAddress = {
            id: addressId,
            ...addressData
        };
        // If this is the default address, unset others
        if (newAddress.isDefault) {
            user.addresses = user.addresses.map(addr => ({ ...addr, isDefault: false }));
        }
        user.addresses.push(newAddress);
        await user.save();
        res.status(201).json({
            message: 'Address added successfully',
            address: newAddress
        });
    }
    catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Update address
router.put('/addresses/:addressId', auth_1.authenticateToken, [
    (0, express_validator_1.body)('label').optional().trim().isLength({ min: 1 }).withMessage('Label is required'),
    (0, express_validator_1.body)('fullAddress').optional().trim().isLength({ min: 5 }).withMessage('Full address is required'),
    (0, express_validator_1.body)('city').optional().trim().isLength({ min: 1 }).withMessage('City is required'),
    (0, express_validator_1.body)('pincode').optional().trim().isLength({ min: 6 }).withMessage('Valid pincode is required'),
    (0, express_validator_1.body)('phone').optional().trim().isLength({ min: 10 }).withMessage('Valid phone number is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { addressId } = req.params;
        const updateData = req.body;
        const user = await User_1.default.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const addressIndex = user.addresses.findIndex(addr => addr.id === addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }
        // If setting as default, unset others
        if (updateData.isDefault) {
            user.addresses = user.addresses.map(addr => ({ ...addr, isDefault: false }));
        }
        user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...updateData };
        await user.save();
        res.json({
            message: 'Address updated successfully',
            address: user.addresses[addressIndex]
        });
    }
    catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Delete address
router.delete('/addresses/:addressId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User_1.default.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.addresses = user.addresses.filter(addr => addr.id !== addressId);
        await user.save();
        res.json({ message: 'Address deleted successfully' });
    }
    catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
