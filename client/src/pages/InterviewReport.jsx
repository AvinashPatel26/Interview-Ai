import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { FaArrowLeft } from "react-icons/fa";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { motion } from "framer-motion";

function InterviewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const getReport = async () => {
      try {
        const res = await axios.get(`${ServerUrl}/api/interview/report/${id}`, {
          withCredentials: true,
        });
        setReport(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getReport();
  }, [id]);

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading report...
      </div>
    );
  }

  const {
    finalScore = 0,
    confidence = 0,
    correctness = 0,
    communication = 0,
    questionWiseScore = [],
  } = report;

  const chartData = questionWiseScore.map((q, i) => ({
    name: `Q${i + 1}`,
    score: q.score || 0,
  }));

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
    tagline = "Focus on fundamentals and clarity";
  }

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("AI Interview Performance Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Final Score: ${finalScore}/10`, 20, 35);

    doc.text(`Confidence: ${confidence}`, 20, 45);
    doc.text(`Communication: ${communication}`, 20, 52);
    doc.text(`Correctness: ${correctness}`, 20, 59);

    doc.text(`${verdict} - ${tagline}`, 20, 70);

    const tableData = questionWiseScore.map((q, i) => [
      i + 1,
      q.question,
      `${q.score || 0}/10`,
      q.feedback || "No feedback",
    ]);

    autoTable(doc, {
      startY: 85,
      head: [["#", "Question", "Score", "Feedback"]],
      body: tableData,
    });

    doc.save("AI_Interview_Report.pdf");
  };

  const MetricBar = ({ label, value }) => (
    <div>
      <div className="flex justify-between mb-1 text-sm">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <motion.div
        className="w-full bg-gray-200 rounded-full h-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="h-2 rounded-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${value * 10}%` }}
          transition={{ duration: 0.8 }}
        />
      </motion.div>
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
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => navigate("/history")}
              className="p-3 rounded-full bg-white shadow"
            >
              <FaArrowLeft />
            </motion.button>

            <div>
              <h1 className="text-2xl font-bold">
                Interview Analytics Dashboard
              </h1>
              <p className="text-gray-500 text-sm">
                AI-powered candidate evaluation
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadPDF}
            className="bg-emerald-600 text-white px-5 py-2 rounded-lg shadow"
          >
            Download PDF
          </motion.button>
        </div>

        {/* GRID */}
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

                  <span className="text-sm font-semibold text-emerald-600">
                    {q.score || 0}/10
                  </span>
                </div>

                <p className="text-gray-800 mb-2">{q.question}</p>

                <div className="bg-emerald-50 border rounded-lg p-3 text-sm">
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

export default InterviewReport;
