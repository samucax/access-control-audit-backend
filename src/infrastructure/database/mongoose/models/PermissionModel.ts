import mongoose, { Document, Schema } from 'mongoose';
import { PermissionAction } from '../../../../domain/entities/Permission';

export interface IPermissionDocument extends Document {
  name: string;
  resource: string;
  action: PermissionAction;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermissionDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 50,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['create', 'read', 'update', 'delete', 'manage'],
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { _id, __v, ...rest } = ret;
        return {
          ...rest,
          id: _id.toString(),
        };
      },
    },
  }
);

// Compound unique index to prevent duplicate resource-action combinations
PermissionSchema.index({ resource: 1, action: 1 }, { unique: true });

export const PermissionModel = mongoose.model<IPermissionDocument>(
  'Permission',
  PermissionSchema
);
