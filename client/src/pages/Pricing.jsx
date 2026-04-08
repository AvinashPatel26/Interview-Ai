import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { ServerUrl } from "../App";

function Pricing() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      credits: 100,
      description: "Perfect for beginners starting interview preparation",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: 100,
      credits: 150,
      description: "Great for focused practice and skill improvement",
      popular: true,
      features: [
        "150 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: 500,
      credits: 650,
      description: "Best value for serious job preparation",
      features: [
        "650 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analysis",
        "Priority AI Processing",
      ],
      badge: "Best Value",
    },
  ];

  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id);

      const res = await axios.post(
        ServerUrl + "/api/payment/order",
        {
          planId: plan.id,
          amount: plan.price,
          credits: plan.credits,
        },
        { withCredentials: true }, // ✅ FIX
      );

      const { order } = res.data;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "InterviewIQ.AI",
        description: plan.name,
        order_id: order.id,

        handler: async function (response) {
          await axios.post(ServerUrl + "/api/payment/verify", response, {
            withCredentials: true,
          });

          alert("Payment Successful 🚀");
        },

        theme: {
          color: "#10b981",
        },

        // ✅ keep this (no phone input)
        prefill: {
          name: "User",
          email: "test@test.com",
          contact: "9999999999",
        },

        readonly: {
          contact: true,
          email: true,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-16 px-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-14 flex items-start gap-4"
      >
        <button
          onClick={() => navigate("/")}
          className="mt-2 p-3 rounded-full bg-white shadow hover:shadow-md transition"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>

        <div className="text-center w-full">
          <h1 className="text-4xl font-bold text-gray-800">Choose Your Plan</h1>
          <p className="text-gray-500 mt-3 text-lg">
            Flexible pricing to match your interview preparation goals.
          </p>
        </div>
      </motion.div>

      {/* CARDS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className={`relative bg-white rounded-2xl shadow-lg p-6 cursor-pointer transition duration-300
              ${isSelected ? "border-2 border-emerald-500 shadow-xl" : "hover:shadow-xl"}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {/* BADGE */}
              {plan.badge && (
                <span className="absolute top-4 right-4 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              {plan.popular && (
                <span className="absolute top-4 left-4 bg-yellow-400 text-xs px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              {/* NAME */}
              <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>

              {/* PRICE */}
              <p className="text-4xl font-bold text-emerald-600 mb-1">
                ₹{plan.price}
              </p>

              <p className="text-sm text-gray-400 mb-3">
                {plan.credits} Credits
              </p>

              {/* DESC */}
              <p className="text-gray-500 text-sm mb-4">{plan.description}</p>

              {/* FEATURES */}
              <ul className="space-y-2 mb-6 text-sm text-gray-700">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-500">✔</span> {f}
                  </li>
                ))}
              </ul>

              {/* BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (plan.price !== 0) {
                    handlePayment(plan);
                  }
                }}
                className={`w-full py-3 rounded-lg font-semibold transition
                ${
                  plan.price === 0
                    ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {loadingPlan === plan.id
                  ? "Processing..."
                  : plan.price === 0
                    ? "Current Plan"
                    : "Proceed to Pay"}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default Pricing;
