import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

function Step3Report({ report }) {
  if (!report) return null;

  const {
    finalScore = 0,
    confidence = 0,
    correctness = 0,
    communication = 0,
    questionWiseScore = [],
  } = report;

  // 📊 Chart Data
  const chartData = questionWiseScore.map((q, i) => ({
    name: `Q${i + 1}`,
    score: q.score || 0,
  }));

  // 🧠 Verdict
  let verdict = "";
  let tagline = "";

  if (finalScore >= 8) {
    verdict = "Strong Candidate";
    tagline = "Ready for real interviews 🚀";
  } else if (finalScore >= 5) {
    verdict = "Average Candidate";
    tagline = "Needs some improvements";
  } else {
    verdict = "Needs Improvement";
    tagline = "Work on clarity and confidence";
  }

  const MetricBar = ({ label, value }) => (
    <div>
      <div className="flex justify-between mb-1 text-sm">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="h-2 rounded-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${value * 10}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Interview Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm">
            AI-powered performance insights
          </p>
        </div>

        {/* TOP SECTION */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* SCORE */}
          <motion.div
            className="bg-white rounded-2xl shadow p-6 text-center"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <p className="text-gray-500">Overall Performance</p>

            <motion.h2
              className="text-4xl font-bold text-emerald-600 mt-2"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
            >
              {finalScore}/10
            </motion.h2>

            <p className="mt-3 font-semibold">{verdict}</p>
            <p className="text-sm text-gray-500">{tagline}</p>
          </motion.div>

          {/* CHART */}
          <motion.div
            className="bg-white rounded-2xl shadow p-6"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="mb-4 font-semibold">Performance Trend</h3>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* SKILLS */}
        <motion.div
          className="bg-white rounded-2xl shadow p-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-semibold mb-4">Skill Evaluation</h3>

          <div className="space-y-4">
            <MetricBar label="Confidence" value={confidence} />
            <MetricBar label="Communication" value={communication} />
            <MetricBar label="Correctness" value={correctness} />
          </div>
        </motion.div>

        {/* QUESTIONS */}
        <motion.div
          className="bg-white rounded-2xl shadow p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-semibold mb-6">Question Breakdown</h3>

          <div className="space-y-4">
            {questionWiseScore.map((q, index) => (
              <motion.div
                key={index}
                className="border rounded-xl p-4 hover:shadow transition"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-gray-500">Question {index + 1}</p>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      q.score >= 7
                        ? "bg-green-100 text-green-600"
                        : q.score >= 4
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                    }`}
                  >
                    {q.score || 0}/10
                  </span>
                </div>

                <p className="text-gray-800 mb-2">{q.question}</p>

                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-sm text-gray-700">
                  <span className="font-semibold text-emerald-700">
                    AI Feedback:
                  </span>{" "}
                  {q.feedback || "No feedback available"}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Step3Report;
