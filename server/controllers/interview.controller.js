import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";


// ------------------ RESUME ANALYSIS ------------------
export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }

    const filepath = req.file.path;

    const fileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items.map((item) => item.str).join(" ");
      resumeText += pageText + "\n";
    }

    resumeText = resumeText.replace(/\s+/g, " ").trim();

    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
        `,
      },
      {
        role: "user",
        content: resumeText,
      },
    ];

    const aiResponse = await askAi(messages);

    let parsed;
    try {
      const clean = aiResponse.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = {
        role: "",
        experience: "",
        projects: [],
        skills: [],
      };
    }

    await fs.promises.unlink(filepath);

    return res.status(200).json({
      message: "Resume analyzed successfully",
      role: parsed.role || "",
      experience: parsed.experience || "",
      projects: parsed.projects || [],
      skills: parsed.skills || [],
      text: resumeText,
    });

  } catch (error) {
    console.error("Resume Analysis Error:", error);

    return res.status(500).json({
      message: "Failed to analyze resume",
      error: error.message,
    });
  }
};


// ------------------ GENERATE QUESTIONS ------------------
export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, skills, projects, mode, resumeText } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.credits < 50) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    const projectText =
      Array.isArray(projects) && projects.length > 0
        ? projects.join(", ")
        : "None";

    const skillText =
      Array.isArray(skills) && skills.length > 0
        ? skills.join(", ")
        : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
Role: ${role}
Experience: ${experience}
InterviewMode: ${mode}
Skills: ${skillText}
Projects: ${projectText}
Resume: ${safeResume}
    `;

    const messages = [
      {
        role: "system",
        content: `
You are a real human interviewer.

Generate exactly 5 interview questions.

Rules:
- Each question: 15–25 words
- One question per line
- No numbering
- No extra text
- Simple English
- Practical & realistic

Difficulty:
1 → Easy  
2 → Easy  
3 → Medium  
4 → Medium  
5 → Hard
        `,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const aiResponse = await askAi(messages);

    const questions = aiResponse
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    user.credits -= 50;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      skills,
      projects,
      mode,
      resumeText: safeResume,
      questions: questions.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120][index],
      })),
    });

    return res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions,
    });

  } catch (error) {
    console.error("Generate Question Error:", error);

    return res.status(500).json({
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};


// ------------------ SUBMIT ANSWER ------------------
export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(400).json({ message: "Interview not found" });
    }

    const question = interview.questions[questionIndex];
    if (!question) {
      return res.status(400).json({ message: "Question not found" });
    }

    // if no answer
    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer";
      question.answer = "";

      await interview.save();

      return res.json({
        feedback: question.feedback,
        score: 0,
      });
    }

    // if time exceeded
    if (timeTaken && timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time exceeded";
      question.answer = answer;

      await interview.save();

      return res.json({
        feedback: question.feedback,
        score: 0,
      });
    }

    const message = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer.

Score:
- confidence
- communication
- correctness

Calculate:
final score = average

Feedback:
- 10 to 15 words
- natural tone

Return JSON:
{
"confidence": number,
"communication": number,
"correctness": number,
"finalScore": number,
"feedback": "string"
}
        `
      },
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
        `
      }
    ];

    const aiResponse = await askAi(message);

    let parsed;
    try {
      const clean = aiResponse.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = {
        confidence: 5,
        communication: 5,
        correctness: 5,
        finalScore: 5,
        feedback: "Average answer, needs improvement",
      };
    }

    question.answer = answer;
    question.score = parsed.finalScore || 0;
    question.feedback = parsed.feedback || "";
    question.confidence = parsed.confidence || 0;
    question.correctness = parsed.correctness || 0;

    await interview.save();

    return res.status(200).json({
      feedback: question.feedback,
      score: question.score,
      confidence: question.confidence,
      correctness: question.correctness,
    });

  } catch (error) {
    console.error("Submit Answer Error:", error);

    return res.status(500).json({
      message: "Failed to submit answer",
      error: error.message,
    });
  }
};

export const finishInterview = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(400).json({ message: "Interview not found" })

    }
    const totalQuestions = interview.questions.length;
    let totalScore = 0;
    let totalConfidence = 0;
    let totalCorrectness = 0;
    let totalCommunication = 0;

    interview.questions.forEach((question) => {
      totalScore += question.score || 0;
      totalConfidence += question.confidence || 0;
      totalCorrectness += question.correctness || 0;
      totalCommunication += question.communication || 0;
    });

    const finalScore = totalScore / totalQuestions ? totalScore / totalQuestions : 0;

    const avgConfidence = totalConfidence / totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCorrectness = totalCorrectness / totalQuestions ? totalCorrectness / totalQuestions : 0;
    const avgCommunication = totalCommunication / totalQuestions ? totalCommunication / totalQuestions : 0;

    interview.finalScore = finalScore;
    interview.status = "Completed";

    await interview.save();

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      avgConfidence: Number(avgConfidence.toFixed(1)),
      avgCorrectness: Number(avgCorrectness.toFixed(1)),
      avgCommunication: Number(avgCommunication.toFixed(1)),
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score,
        confidence: q.confidence,
        correctness: q.correctness,
        feedback: q.feedback,
      })),
    });

  } catch (error) {
    console.error("Finish Interview Error:", error);

    return res.status(500).json({
      message: "Failed to finish interview",
      error: error.message,
    });

  }
}


export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("role experience mode finalScore status createdAt");

    return res.status(200).json(interviews);
  } catch (error) {
    return res.status(500).json({
      message: `Get My Interviews Error ${error.message}`,
    });
  }
};



export const getInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(400).json({ message: "Interview not found" });
    }

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCorrectness = 0;
    let totalCommunication = 0;

    interview.questions.forEach((question) => {
      totalScore += question.score || 0;
      totalConfidence += question.confidence || 0;
      totalCorrectness += question.correctness || 0;
      totalCommunication += question.communication || 0;
    });

    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      questionWiseScore: interview.questions,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Get Interview Report Error ${error.message}`,
    });
  }
};