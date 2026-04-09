import { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "ShoppingItem",
      required: true,
      index: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "MNT",
      uppercase: true,
      trim: true,
    },

    // QPay invoice data
    qpayInvoiceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    qpayInvoiceNo: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    qpayQrText: {
      type: String,
      default: "",
    },
    qpayQrImage: {
      type: String,
      default: "",
    },
    qpayUrls: [
      {
        name: { type: String, default: "" },
        description: { type: String, default: "" },
        logo: { type: String, default: "" },
        link: { type: String, default: "" },
      },
    ],

    // Request context
    locale: {
      type: String,
      default: "en",
      trim: true,
      index: true,
    },

    // Payment lifecycle
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "expired", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidAt: {
      type: Date,
      default: null,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    // Metadata / debugging / reconciliation
    qpayRaw: {
      type: Schema.Types.Mixed,
      default: null,
    },
    qpayRawCheck: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ itemId: 1, createdAt: -1 });

const Order = models.Order || model("Order", OrderSchema);

export default Order;
