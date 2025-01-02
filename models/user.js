import mongoose from 'mongoose';
import {boolean, date, string} from 'zod';

const UserSchema = new mongoose.Schema ({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password Required'],
  },
  pin: {
    type: Number,
    require: true,
    max: [4, 'Pin Must be 4 Digits Number'],
  },
  joined: {
    type: Date,
    default: Date.now (),
  },
  updated: {
    type: Date,
    default: Date.now (),
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

export const UserModel = new mongoose.model ('user', UserSchema);
