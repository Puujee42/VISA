import mongoose, { Schema, model, models } from "mongoose";

const BookingSchema = new Schema(
  {
    userId: { type: String, required: true }, // Clerk User ID
    serviceId: { type: String, required: true },
    serviceTitle: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm

    // Contact Info
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    note: { type: String },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
      default: 'pending'
    },
    livekitRoom: { type: String, default: '' },

  },
  { timestamps: true }
);

const Booking = models.Booking || model("Booking", BookingSchema);
export default Booking;