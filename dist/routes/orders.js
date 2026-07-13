"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const Order_1 = __importDefault(require("../models/Order"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get user's orders
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const orders = await Order_1.default.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Get order by ID
router.get('/:orderId', auth_1.authenticateToken, async (req, res) => {
    try {
        const order = await Order_1.default.findOne({
            orderId: req.params.orderId,
            userId: req.user.userId
        });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Create new order
router.post('/', auth_1.authenticateToken, [
    (0, express_validator_1.body)('items').isArray({ min: 1 }).withMessage('Items are required'),
    (0, express_validator_1.body)('total').isNumeric().withMessage('Total is required'),
    (0, express_validator_1.body)('orderType').isIn(['delivery', 'pickup', 'dine_in']).withMessage('Invalid order type')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { items, total, orderType, address, tableNumber, scheduledTime } = req.body;
        // Generate order ID
        const orderId = 'ORD' + Date.now().toString().slice(-6);
        // Create order
        const order = new Order_1.default({
            orderId,
            userId: req.user.userId,
            items,
            total,
            orderType,
            address,
            tableNumber,
            scheduledTime
        });
        await order.save();
        // Add order to user's orders
        const user = await User_1.default.findById(req.user.userId);
        if (user) {
            user.orders.push({
                id: orderId,
                items,
                total,
                status: 'pending',
                orderType,
                address,
                tableNumber,
                scheduledTime,
                createdAt: order.createdAt.toISOString()
            });
            await user.save();
        }
        res.status(201).json({
            message: 'Order created successfully',
            order
        });
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Update order status (admin only - simplified for now)
router.patch('/:orderId/status', auth_1.authenticateToken, [
    (0, express_validator_1.body)('status').isIn(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { status } = req.body;
        const order = await Order_1.default.findOneAndUpdate({ orderId: req.params.orderId }, { status }, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // Update order status in user's orders
        const user = await User_1.default.findById(order.userId);
        if (user) {
            const userOrder = user.orders.find(o => o.id === req.params.orderId);
            if (userOrder) {
                userOrder.status = status;
                await user.save();
            }
        }
        res.json({
            message: 'Order status updated successfully',
            order
        });
    }
    catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
