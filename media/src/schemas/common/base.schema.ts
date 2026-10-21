import type { SchemaOptions } from 'mongoose';

/**
 * Standard Schema options for all documents in the Media Service.
 * - Enables automatic createdAt and updatedAt timestamps.
 * - Transforms _id to id for clean JSON serialization.
 * - Removes MongoDB internal version key (__v).
 */
export const defaultSchemaOptions: SchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, any>) => {
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret: Record<string, any>) => {
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    },
  },
};
