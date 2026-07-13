import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  orderId: string;
  userId: string;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  orderType: 'delivery' | 'pickup' | 'dine_in';
  address?: {
    id: string;
    label: string;
    fullAddress: string;
    city: string;
    pincode: string;
    phone: string;
    isDefault: boolean;
  };
  tableNumber?: number;
  scheduledTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  menuItemId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const OrderSchema = new Schema<IOrder>({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  items: [OrderItemSchema],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  orderType: {
    type: String,
    enum: ['delivery', 'pickup', 'dine_in'],
    required: true
  },
  address: {
    id: String,
    label: String,
    fullAddress: String,
    city: String,
    pincode: String,
    phone: String,
    isDefault: Boolean
  },
  tableNumber: Number,
  scheduledTime: String
}, {
  timestamps: true
});

export default mongoose.model<IOrder>('Order', OrderSchema);
