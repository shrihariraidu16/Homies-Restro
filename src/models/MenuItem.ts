import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem extends Document {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'starters' | 'mains' | 'desserts' | 'breads' | 'beverages';
  isPopular?: boolean;
  isVeg?: boolean;
  spiceLevel?: 'mild' | 'medium' | 'hot';
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: {
    type: String,
    enum: ['starters', 'mains', 'desserts', 'breads', 'beverages'],
    required: true
  },
  isPopular: { type: Boolean, default: false },
  isVeg: { type: Boolean, default: true },
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot']
  },
  isAvailable: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
