import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { type HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { defaultSchemaOptions } from './common/base.schema.js';

export type SubscriptionTierDocument = HydratedDocument<SubscriptionTier>;

@Schema({
  ...defaultSchemaOptions,
  collection: 'subscription_tiers',
})
export class SubscriptionTier {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  /**
   * Auth0 user ID of the creator offering this tier.
   */
  @Prop({ type: String, required: true, index: true })
  creatorId: string;

  /**
   * Title of the tier (e.g., "Silver Fan", "VIP All-Access").
   */
  @Prop({ type: String, required: true, maxlength: 100, trim: true })
  title: string;

  /**
   * Detailed description of perks and benefits.
   */
  @Prop({ type: String, maxlength: 500, default: null, trim: true })
  description: string | null;

  /**
   * Hierarchical weight/level of the tier.
   * Higher weight grants access to lower weight tiers (e.g. weight 3 accesses weight 1 and 2 content).
   */
  @Prop({ type: Number, required: true, min: 1, index: true })
  weight: number;

  /**
   * Recurring monthly price denominated in Opux (Opx).
   * Stored as Decimal128 to ensure financial decimal precision.
   */
  @Prop({
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    get: (v: mongoose.Types.Decimal128) => (v ? v.toString() : null),
  })
  priceOpx: mongoose.Types.Decimal128;

  /**
   * Bullet list of perks included with this tier.
   */
  @Prop({ type: [String], default: [] })
  perks: string[];

  /**
   * Indicates whether this tier is currently active and available for new subscriptions.
   */
  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  /**
   * Soft-deletion timestamp.
   */
  @Prop({ type: Date, default: null, index: true })
  deletedAt: Date | null;
}

export const SubscriptionTierSchema = SchemaFactory.createForClass(SubscriptionTier);

// Ensure creator cannot create duplicate tier weights
SubscriptionTierSchema.index({ creatorId: 1, weight: 1, deletedAt: 1 }, { unique: true });

// Optimize query for active creator tiers
SubscriptionTierSchema.index({ creatorId: 1, isActive: 1, deletedAt: 1 });
