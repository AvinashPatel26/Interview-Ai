import razorpay from "../services/razorpay.service.js";
import Payment from "../models/payment.model.js";
import crypto from "crypto";
import User from "../models/user.model.js";

export const createOrder = async (req, res) => {
    try {
        const { planId, amount, credits } = req.body;

        if (!amount || !credits) {
            return res.status(400).json({
                message: "Invalid plan data",
            });
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        await Payment.create({
            userId: req.userId,
            planId,
            amount,
            credits,
            razorpayOrderId: order.id,
            status: "pending",
        });

        return res.status(200).json({
            success: true,
            order,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Create order failed",
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        // 🔐 Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            // ❌ mark failed
            await Payment.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { status: "failed" }
            );

            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        // ✅ find payment
        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment record not found",
            });
        }

        // 🚨 prevent duplicate crediting
        if (payment.status === "success") {
            return res.status(200).json({
                success: true,
                message: "Already processed",
            });
        }

        // ✅ update payment
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.status = "success";
        await payment.save();

        // 🎯 add credits safely
        await User.findByIdAndUpdate(payment.userId, {
            $inc: { credits: payment.credits },
        });

        return res.status(200).json({
            success: true,
            message: "Payment successful",
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Payment verification failed",
        });
    }
};