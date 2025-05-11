import { Document, Types } from 'mongoose';
import { Request, Response } from 'express';
import { Multer } from 'multer';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  name: string;
  googleId?: string;
  facebookId?: string;
  signupType: 'email/password' | 'google' | 'facebook';
  isEmailVerified: boolean;
  lastLogin?: Date;
  profiles: Types.ObjectId[];
  products: {
    productId: Types.ObjectId;
    amount: number;
  }[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isActive: boolean;
}

export interface IPayment extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  invoiceId: string;
  amount: number;
  currency: string;
  description: string;
  status: 'initiated' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
}

export interface IProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  email: string;
  name: string;
  username: string;
  phoneNumber: string;
  title?: string;
  photo?: string;
  links: {
    _id?: Types.ObjectId;
    type: string;
    url: string;
    isEnabled: boolean;
  }[];
  groups: Types.ObjectId[];
  contacts: Types.ObjectId[];
}

export interface IGroup extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  note?: string;
  photo?: string;
  contacts: Types.ObjectId[];
  profileId: Types.ObjectId;
  userId?: Types.ObjectId;
  isActive: boolean;
}

export interface IContact extends Document {
  _id: Types.ObjectId;
  fullName: string;
  phoneNumber: string;
  email?: string;
  title?: string;
  note?: string;
  photo?: string;
  profileId: Types.ObjectId;
  userId: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRequest extends Request {
  user?: IUser;
  file?: Express.Multer.File;
}

export type IResponse = Response; 