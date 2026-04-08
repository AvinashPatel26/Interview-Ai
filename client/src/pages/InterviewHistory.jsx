import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { FaArrowLeft } from "react-icons/fa";

function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getMyInterview = async () => {
      try {
        const res = await axios.get(
          ServerUrl + "/api/interview/get-interview",
          {
            withCredentials: true,
          },
        );

        setInterviews(res.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    getMyInterview();
  }, []); // ✅ FIXED

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-10">
      <div className="w-[90vw] lg:w-[70vw] mx-auto">
        {/* HEADER */}
        <div className="mb-10 flex items-start gap-4 flex-wrap">
          <button
            onClick={() => navigate("/")}
            className="mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Interview History
            </h1>

            <p className="text-gray-500 mt-2">
              Track your past interviews and performance reports
            </p>
          </div>
        </div>

        {/* LIST */}
        {interviews.length === 0 ? (
          <p className="text-gray-500">No interviews found</p>
        ) : (
          <div className="flex flex-col gap-6">
            {interviews.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate(`/report/${item._id}`)}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 flex justify-between items-center cursor-pointer"
              >
                {/* LEFT */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {item.role}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {item.experience} year • {item.mode}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="text-right">
                  <p className="text-emerald-600 text-lg font-bold">
                    {item.finalScore ?? 0}/10
                  </p>

                  <p className="text-xs text-gray-400">Overall Score</p>

                  <span
                    className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
                      item.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {item.status === "completed" ? "completed" : "Incompleted"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewHistory;
