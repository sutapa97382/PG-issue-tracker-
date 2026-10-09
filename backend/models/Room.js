import mongoose from 'mongoose';
import { generateRoomSecretKey } from '../utils/generateKey.js';

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Please provide a room number'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^[A-Za-z0-9-]+$/,
        'Invalid room number format. Valid examples: A-101, B-204, R102, 101',
      ],
    },
    propertyName: {
      type: String,
      default: 'PropMate Residency',
      trim: true,
    },
    secretKey: {
      type: String,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Vacant', 'Occupied'],
        message: 'Status must be Vacant or Occupied',
      },
      default: 'Vacant',
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: auto-generate secretKey if not provided
roomSchema.pre('save', function (next) {
  if (!this.secretKey) {
    this.secretKey = generateRoomSecretKey(this.roomNumber);
  }
  next();
});

const Room = mongoose.model('Room', roomSchema);
export default Room;
