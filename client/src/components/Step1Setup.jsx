import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine,
} from "react-icons/fa";
import axios from "axios";
import { ServerUrl } from "../App";
import { useDispatch, useSelector } from "react-redux"; // ✅ FIX
import { setUserData } from "../redux/userSlice";

function Step1Setup({ onStart }) {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [skills, setSkills] = useState([]);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyzeResume = async () => {
    if (!resumeFile) return;

    try {
      setAnalyzing(true);

      const formData = new FormData();
      formData.append("resume", resumeFile);

      const result = await axios.post(
        ServerUrl + "/api/interview/resume",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.text || "");
      setAnalysisDone(true);
    } catch (err) {
      console.log(err);
      alert("Resume analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/generate-questions", // ✅ FIXED
        { role, experience, mode, resumeText, projects, skills },
        { withCredentials: true },
      );

      console.log(result.data);

      if (userData) {
        dispatch(
          setUserData({
            ...userData,
            credits: result.data.creditsLeft, // ✅ FIXED
          }),
        );
      }

      // optional next step trigger
      if (onStart) {
        onStart(result.data);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4"
    >
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl grid md:grid-cols-2 overflow-hidden">
        {/* LEFT */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 md:p-10"
        >
          <h2 className="text-3xl font-bold mb-6">Start your AI Interview</h2>

          <div className="space-y-4">
            {[
              { icon: <FaUserTie />, text: "AI Interview Questions" },
              { icon: <FaBriefcase />, text: "Experience Customization" },
              { icon: <FaFileUpload />, text: "Resume Analysis" },
              { icon: <FaMicrophoneAlt />, text: "Voice Answers" },
              { icon: <FaChartLine />, text: "Performance Tracking" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3 items-center bg-white p-3 rounded-lg"
              >
                <div className="text-green-600">{item.icon}</div>
                <p>{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="p-6 md:p-10"
        >
          <h3 className="text-xl font-semibold mb-6">Setup Interview</h3>

          <input
            type="text"
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          />

          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          >
            <option value="">Select Experience</option>
            <option>Fresher</option>
            <option>1-2 years</option>
            <option>3-5 years</option>
          </select>

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          >
            <option>Technical</option>
            <option>HR</option>
            <option>Behavioral</option>
          </select>

          {/* RESULT */}
          {analysisDone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-gray-50 border rounded-xl p-4"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Resume Analysis Result
              </h3>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Projects:</p>
                <ul className="text-sm list-disc pl-4">
                  {projects.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {!analysisDone && (
            <label className="w-full mb-4 cursor-pointer">
              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition
                ${resumeFile ? "border-green-500 bg-green-100" : "border-green-300 bg-green-50 hover:bg-green-100"}`}
              >
                <FaFileUpload size={28} className="text-green-600 mb-2" />

                <p className="text-sm font-medium text-gray-700">
                  {resumeFile ? resumeFile.name : "Upload Resume (PDF)"}
                </p>

                <p className="text-xs text-gray-500 mt-1">Click to upload</p>
              </div>

              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          )}

          <button
            onClick={handleAnalyzeResume}
            disabled={!resumeFile || analyzing}
            className="w-full mb-3 bg-blue-500 text-white py-2 rounded"
          >
            {analyzing ? "AI is analyzing your resume..." : "Analyze Resume"}
          </button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            disabled={loading || !experience || !role}
            className="w-full bg-green-500 text-white py-3 rounded disabled: bg-gray-600 hover:bg-green-700 text-white py-rounded-full text-lg font-semibold transition duration-300 shadow-md"
          >
            {loading ? "Starting..." : "Start Interview 🚀"}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Step1Setup;
