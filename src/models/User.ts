import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress {
  id: string;
  label: string;
  fullAddress: string;
  city: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export interface IOrder {
  id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  orderType: 'delivery' | 'pickup' | 'dine_in';
  address?: IAddress;
  tableNumber?: number;
  scheduledTime?: string;
  createdAt: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  addresses: IAddress[];
  orders: IOrder[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  id: { type: String, required: true },
  label: { type: String, required: true },
  fullAddress: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const OrderSchema = new Schema<IOrder>({
  id: { type: String, required: true },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
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
  address: AddressSchema,
  tableNumber: Number,
  scheduledTime: String,
  createdAt: { type: String, required: true }
});

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  addresses: [AddressSchema],
  orders: [OrderSchema]
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
