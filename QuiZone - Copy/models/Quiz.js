const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },
        
        category: {
            type: String,
            required: true,
            enum: ["Programming", "General Knowledge", "Science", "Other"]
        },
        
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        questions: [
            {
                questionText: {
                    type: String,
                    required: true
                },

                options: {
                    type: [String],
                    required: true
                },

                correctAnswer: {
                    type: String,
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Quiz", quizSchema);