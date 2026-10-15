import type { SchemaOptions } from 'mongoose';

/**
 * Standard Schema options for all documents in the Social Media Service.
 * - Enables automatic createdAt and updatedAt timestamps.
 * - Transforms _id to id and stringifies Decimal128 for clean JSON serialization.
 * - Removes MongoDB internal version key (__v).
 */
export const defaultSchemaOptions: SchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, any>) => {
      ret.id = ret._id;
      // Convert Decimal128 fields to string representation if present
      for (const key of Object.keys(ret)) {
        if (ret[key] && typeof ret[key] === 'object' && ret[key]._bsontype === 'Decimal128') {
          ret[key] = ret[key].toString();
        }
      }
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
