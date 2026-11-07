// Import Required Packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import Models
const User = require("./models/User");
const Quiz = require("./models/Quiz");
const QuizAttempt = require("./models/QuizAttempt");

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error.message);
    });


// ==========================================
// USER REGISTRATION API
// ==========================================

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields."
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: "Registration successful!",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed.",
            error: error.message
        });
    }
});


// ==========================================
// USER LOGIN API
// ==========================================

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect password."
            });
        }

        res.json({
            message: "Login successful!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed.",
            error: error.message
        });
    }
});


// ==========================================
// CREATE QUIZ API
// ==========================================

app.post("/api/quizzes", async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            questions,
            userId
        } = req.body;

        if (!title || !category || !questions ||
            questions.length === 0 || !userId) {

            return res.status(400).json({
                message: "Please provide quiz title, category, questions and user ID."
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found. Please login again."
            });
        }

        const newQuiz = new Quiz({
            title,
            description,
            category,
            createdBy: userId,
            questions
        });

        await newQuiz.save();

        res.status(201).json({
            message: "Quiz created successfully!",
            quiz: newQuiz
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to create quiz.",
            error: error.message
        });
    }
});


// ==========================================
// GET ALL QUIZZES API
// ==========================================

app.get("/api/quizzes", async (req, res) => {
    try {
        const quizzes = await Quiz.find()
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });

        res.json({
            message: "Quizzes fetched successfully!",
            quizzes
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch quizzes.",
            error: error.message
        });
    }
});


// ==========================================
// FILTER QUIZZES BY CATEGORY API
// ==========================================

app.get("/api/quizzes/category/:category", async (req, res) => {
    try {
        const category = req.params.category;

        const quizzes = await Quiz.find({ category })
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });

        res.json({
            message: "Category quizzes fetched successfully!",
            quizzes
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch category quizzes.",
            error: error.message
        });
    }
});


// ==========================================
// SAVE QUIZ ATTEMPT API
// ==========================================

app.post("/api/quiz-attempts", async (req, res) => {
    try {
        const { userId, quizId, answers } = req.body;

        if (!userId || !quizId || !Array.isArray(answers)) {
            return res.status(400).json({
                message: "User ID, Quiz ID and answers are required."
            });
        }

        if (!mongoose.isValidObjectId(userId) ||
            !mongoose.isValidObjectId(quizId)) {

            return res.status(400).json({
                message: "Invalid user ID or quiz ID."
            });
        }

        const user = await User.findById(userId);
        const quiz = await Quiz.findById(quizId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found."
            });
        }

        if (answers.length !== quiz.questions.length) {
            return res.status(400).json({
                message: "Please submit answers to all questions."
            });
        }

        // Calculate score on the server
        let correctAnswers = 0;

        quiz.questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                correctAnswers++;
            }
        });

        const totalQuestions = quiz.questions.length;
        const incorrectAnswers = totalQuestions - correctAnswers;

        const percentage = totalQuestions > 0
            ? (correctAnswers / totalQuestions) * 100
            : 0;

        const newAttempt = new QuizAttempt({
            userId,
            quizId,
            quizTitle: quiz.title,
            category: quiz.category,
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            score: correctAnswers,
            percentage
        });

        await newAttempt.save();

        res.status(201).json({
            message: "Quiz attempt saved successfully!",
            attempt: newAttempt
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to save quiz attempt.",
            error: error.message
        });
    }
});


// ==========================================
// GET USER QUIZ PROGRESS API
// ==========================================

app.get("/api/progress/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID."
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        const attempts = await QuizAttempt.find({ userId })
            .sort({ createdAt: 1 });

        res.json({
            message: "Progress fetched successfully!",
            attempts
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch progress.",
            error: error.message
        });
    }
});


// ==========================================
// BACKEND HEALTH CHECK API
// ==========================================

app.get("/api/health", (req, res) => {
    res.json({
        message: "Quizora backend is working successfully!"
    });
});


// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Quizora server running at http://localhost:${PORT}`);
});