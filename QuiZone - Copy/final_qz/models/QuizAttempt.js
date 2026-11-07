const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true
        },

        quizTitle: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true
        },

        totalQuestions: {
            type: Number,
            required: true
        },

        correctAnswers: {
            type: Number,
            required: true
        },

        incorrectAnswers: {
            type: Number,
            required: true
        },

        score: {
            type: Number,
            required: true
        },

        percentage: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);