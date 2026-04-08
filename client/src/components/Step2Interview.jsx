import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ServerUrl } from "../App";
import Timer from "./Timer";

function Step2Interview({ interviewData, onFinish }) {
  if (!interviewData || !interviewData.questions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading interview...
      </div>
    );
  }

  const { interviewId, questions, userName } = interviewData;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex] || {};

  // 🔊 SPEAK
  const speak = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // 🎤 INIT MIC (FIXED)
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setAnswer(transcript);
    };

    // ✅ sync mic state
    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // 🎥 CAMERA PREVIEW
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {});
  }, []);

  // 🚀 INTRO
  useEffect(() => {
    if (userName) {
      speak(`Hello ${userName}, welcome to your AI interview`);
    }
  }, [userName]);

  // 🎯 QUESTION CHANGE
  useEffect(() => {
    if (!currentQuestion?.question) return;

    setAnswer("");
    setFeedback("");
    setTimeLeft(currentQuestion?.timeLimit || 60);

    speak(currentQuestion.question);

    // ✅ SAFE auto mic start
    setTimeout(() => {
      startListening();
    }, 500);

    startTimer();

    return () => clearInterval(timerRef.current);
  }, [currentIndex]);

  // ⏱ TIMER
  const startTimer = () => {
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 🎤 START (FIXED)
  const startListening = () => {
    if (!recognitionRef.current) return;

    if (listening) return; // ✅ prevent crash

    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (err) {
      console.log("Mic already started");
    }
  };

  // 🛑 STOP (FIXED)
  const stopListening = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {}

    setListening(false);
  };

  // 📤 SUBMIT
  const handleSubmit = async () => {
    stopListening();
    clearInterval(timerRef.current);

    try {
      setLoading(true);

      const res = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: (currentQuestion?.timeLimit || 60) - timeLeft,
        },
        { withCredentials: true },
      );

      setFeedback(res.data.feedback);
      speak(res.data.feedback);

      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          onFinish && onFinish();
        }
      }, 3000);
    } catch (err) {
      console.log(err);
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (!currentQuestion?.question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading question...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="p-6 flex flex-col gap-4">
          <div className="bg-gray-100 p-4 rounded-xl text-sm shadow-sm">
            {currentQuestion?.question}
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-500">Interview Status</p>
              <p className="text-green-600 font-semibold text-sm">
                {listening ? "Listening..." : "Paused"}
              </p>
            </div>

            <div className="flex justify-center mb-4">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit || 60}
              />
            </div>

            <div className="flex justify-between text-sm text-gray-500">
              <span>{currentIndex + 1} Current</span>
              <span>{questions.length} Total</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-3 text-emerald-700">
            AI Smart Interview
          </h2>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="flex-1 border-2 border-gray-200 focus:border-emerald-400 outline-none rounded-xl p-4 mb-4 resize-none"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={listening ? stopListening : startListening}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                listening ? "bg-red-500" : "bg-black"
              }`}
            >
              🎤
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl"
            >
              Submit Answer
            </button>
          </div>
        </div>
      </div>

      {/* Camera */}
      <video
        ref={videoRef}
        autoPlay
        muted
        className="fixed bottom-6 right-6 w-48 h-32 rounded-xl shadow-lg object-cover"
      />
    </div>
  );
}

export default Step2Interview;
