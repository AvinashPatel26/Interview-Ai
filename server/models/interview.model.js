import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: String,
    difficulty: String,
    timeLimit: Number,

    answer: String,
    feedback: String,

    score: {
        type: Number,
        default: 0,
    },

    confidence: {
        type: Number,
        default: 0,
    },

    correctness: {
        type: Number,
        default: 0,
    },
});

const interviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        role: {
            type: String,
            required: true,
        },

        experience: {
            type: String,
            required: true,
        },

        skills: [
            {
                type: String,
            },
        ],

        projects: [
            {
                type: String,
            },
        ],

        mode: {
            type: String,
            enum: ["HR", "Technical", "Behavioral"],
            default: "Technical",
        },

        resumeText: {
            type: String,
        },

        // ✅ FIXED STATUS (ONLY ONE)
        status: {
            type: String,
            enum: ["Incomplete", "Completed"],
            default: "Incomplete",
        },

        questions: [questionSchema],

        // ✅ FIXED NAME
        finalScore: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;