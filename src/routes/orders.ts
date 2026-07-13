import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Get user's orders
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/:orderId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      userId: req.user.userId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new order
router.post('/', authenticateToken, [
  body('items').isArray({ min: 1 }).withMessage('Items are required'),
  body('total').isNumeric().withMessage('Total is required'),
  body('orderType').isIn(['delivery', 'pickup', 'dine_in']).withMessage('Invalid order type')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, total, orderType, address, tableNumber, scheduledTime } = req.body;

    // Generate order ID
    const orderId = 'ORD' + Date.now().toString().slice(-6);

    // Create order
    const order = new Order({
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
    const user = await User.findById(req.user.userId);
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
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin only - simplified for now)
router.patch('/:orderId/status', authenticateToken, [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']).withMessage('Invalid status')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status in user's orders
    const user = await User.findById(order.userId);
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
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
