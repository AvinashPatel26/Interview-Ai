import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  BsRobot,
  BsMic,
  BsClock,
  BsBarChart,
  BsFileEarmarkText,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import AuthModel from "../components/AuthModel";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

function Home() {
  const { userData } = useSelector((state) => state.user);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  // 🌈 GLOBAL CURSOR GLOW
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const features = [
    {
      icon: <BsRobot size={28} />,
      title: "AI Mock Interviews",
      desc: "Practice interviews powered by AI with smart questioning",
    },
    {
      icon: <BsMic size={28} />,
      title: "Voice Interaction",
      desc: "Answer questions using voice for real interview experience",
    },
    {
      icon: <BsClock size={28} />,
      title: "Timed Sessions",
      desc: "Simulate real interview pressure with time limits",
    },
    {
      icon: <BsBarChart size={28} />,
      title: "Performance Analytics",
      desc: "Track your performance with detailed insights",
    },
    {
      icon: <BsFileEarmarkText size={28} />,
      title: "Interview History",
      desc: "Access all your past interviews anytime",
    },
    {
      icon: <HiSparkles size={28} />,
      title: "Smart AI Feedback",
      desc: "Get intelligent feedback to improve your answers",
    },
  ];

  const aiCapabilities = [
    {
      icon: <HiSparkles size={26} />,
      title: "Adaptive Questioning",
      desc: "AI adjusts difficulty based on your answers in real-time",
    },
    {
      icon: <BsBarChart size={26} />,
      title: "Real-time Scoring",
      desc: "Instant performance scoring with actionable insights",
    },
    {
      icon: <BsMic size={26} />,
      title: "Voice Analysis",
      desc: "Analyze tone, clarity, and confidence in speech",
    },
    {
      icon: <BsRobot size={26} />,
      title: "AI Feedback Engine",
      desc: "Detailed feedback on every response you give",
    },
  ];

  const interviewModes = [
    {
      title: "Technical Interview",
      img: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    },
    {
      title: "HR Interview",
      img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
    },
    {
      title: "Behavioral Round",
      img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    },
    {
      title: "Mock Practice Mode",
      img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    },
  ];
  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col relative overflow-hidden">
      {/* 🌈 Cursor Glow */}
      <div
        className="pointer-events-none fixed w-72 h-72 bg-green-400/20 rounded-full blur-3xl z-0"
        style={{
          left: mousePos.x - 150,
          top: mousePos.y - 150,
        }}
      />

      {/* Background Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-green-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-green-300 rounded-full blur-3xl opacity-30"></div>

      {/* ✨ Floating Particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-green-400/30 rounded-full blur-sm animate-pulse"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}

      <Navbar />

      {/* Top Tag */}
      <div className="flex-1 px-6 py-20">
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
            <HiSparkles
              size={16}
              className="bg-green-50 text-green-600 rounded-full p-1"
            />
            AI powered Interview Platform System
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="text-center mb-28">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto"
        >
          Practice interview with{" "}
          <span className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-transparent bg-clip-text px-5 py-1">
            AI Intelligence
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg"
        >
          Role-based interview with smart follow ups, adaptive difficulty and
          real time performance evaluation
        </motion.p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <motion.button
            onClick={() => {
              if (!userData) {
                setShowAuth(true);
                return;
              }
              navigate("/interview");
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative bg-black text-white px-10 py-3 rounded-full overflow-hidden shadow-lg hover:shadow-2xl transition"
          >
            <span className="absolute inset-0 bg-green-400/10 opacity-0 hover:opacity-100 transition duration-300"></span>
            <span className="relative z-10">Start Interview</span>
          </motion.button>

          <motion.button
            onClick={() => {
              if (!userData) {
                setShowAuth(true);
                return;
              }
              navigate("/history");
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border border-gray-300 px-10 py-3 rounded-full hover:bg-gray-100 transition shadow-sm hover:shadow-md"
          >
            View History
          </motion.button>
        </div>
      </div>

      {/* FEATURES */}
      <div className="flex flex-wrap justify-center items-center gap-10 mb-28 px-6">
        {features.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            animate={{ y: [0, -8, 0] }}
            whileHover={{ scale: 1.07, y: -6 }}
            className={`
              group relative bg-white/80 backdrop-blur-xl rounded-3xl border border-green-100 
              p-8 w-80 max-w-[90%] shadow-lg hover:shadow-2xl 
              transition-all duration-300 overflow-hidden
              ${index === 0 ? "rotate-[-4deg]" : ""}
            `}
          >
            {/* Cursor Glow inside card */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-300 via-green-500 to-green-300 blur opacity-0 group-hover:opacity-40 transition duration-500"></div>

            <div className="relative z-10">
              <div className="text-green-600 mb-4 flex justify-center">
                {item.icon}
              </div>

              <h3 className="text-lg font-semibold text-center mb-2">
                {item.title}
              </h3>

              <p className="text-sm text-gray-500 text-center">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
      {/* 🤖 AI Capabilities */}
      <div className="px-6 mb-28">
        <h2 className="text-3xl font-semibold text-center mb-12">
          Advanced AI Capabilities
        </h2>

        <div className="flex flex-wrap justify-center gap-8">
          {aiCapabilities.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative bg-white/80 backdrop-blur-xl rounded-3xl border border-green-100 
        p-6 w-72 shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
            >
              {/* Glow */}
              <div className="absolute inset-0 bg-green-400/10 opacity-0 group-hover:opacity-100 transition"></div>

              <div className="relative z-10 text-center">
                <div className="text-green-600 mb-3 flex justify-center">
                  {item.icon}
                </div>

                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 🎯 Interview Modes */}
      <div className="px-6 mb-32">
        <h2 className="text-3xl font-semibold text-center mb-12">
          Interview Modes
        </h2>

        <div className="flex flex-wrap justify-center gap-8">
          {interviewModes.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="group relative w-80 rounded-3xl overflow-hidden shadow-lg"
            >
              {/* Image */}
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-48 object-cover group-hover:scale-110 transition duration-500"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>

              {/* Text */}
              <div className="absolute bottom-4 left-4 text-white z-10">
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AUTH MODAL */}
      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}

      <Footer />
    </div>
  );
}

export default Home;
