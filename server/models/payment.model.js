import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        planId: {
            type: String,
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        credits: {
            type: Number,
            required: true,
        },

        razorpayOrderId: {
            type: String,
        },

        razorpayPaymentId: {
            type: String,
        },

        status: {
            type: String,
            enum: ["pending", "success", "failed"], // ✅ FIXED
            default: "pending",
        },
    },
    { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;