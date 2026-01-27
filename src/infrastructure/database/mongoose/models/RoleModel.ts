import mongoose, { Document, Schema } from 'mongoose';

export interface IRoleDocument extends Document {
  name: string;
  description: string;
  permissionIds: mongoose.Types.ObjectId[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRoleDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    permissionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { _id, __v, permissionIds, ...rest } = ret;

        return {
          ...rest,
          id: _id.toString(),
          permissionIds: permissionIds.map((id: mongoose.Types.ObjectId) =>
            id.toString()
          ),
        };
      },
    },
  }
);

export const RoleModel = mongoose.model<IRoleDocument>('Role', RoleSchema);
