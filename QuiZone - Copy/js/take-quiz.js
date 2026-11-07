// ==========================================
// QUIZONE - TAKE QUIZ JAVASCRIPT
// ==========================================


// DOM ELEMENTS

const questionsArea = document.getElementById("questionsArea");
const quizTitle = document.getElementById("quizTitle");
const quizDescription = document.getElementById("quizDescription");
const takeQuizForm = document.getElementById("takeQuizForm");
const resultArea = document.getElementById("resultArea");


// GET QUIZ ID FROM URL

const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get("id");

let currentQuiz = null;
let quizSubmitted = false;


// ==========================================
// HELPER FUNCTION: GET LOGGED-IN USER
// ==========================================

function getLoggedInUser() {

    try {

        return JSON.parse(localStorage.getItem("quizoraUser"));

    } catch (error) {

        console.error("User data error:", error);

        return null;

    }

}


// ==========================================
// LOAD SELECTED QUIZ
// ==========================================

async function loadQuiz() {

    try {

        if (!quizId) {

            quizTitle.textContent = "Quiz Not Found";

            questionsArea.textContent =
                "No quiz ID was provided.";

            return;

        }

        quizTitle.textContent = "Loading Quiz...";

        const response = await fetch("/api/quizzes");

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Unable to load quizzes."
            );

        }

        currentQuiz = data.quizzes.find(
            quiz => quiz._id === quizId
        );

        if (!currentQuiz) {

            quizTitle.textContent = "Quiz Not Found";

            questionsArea.textContent =
                "The selected quiz does not exist.";

            return;

        }

        // Display quiz details

        quizTitle.textContent = currentQuiz.title;

        quizDescription.textContent =
            currentQuiz.description || "Test your knowledge!";

        questionsArea.innerHTML = "";


        // Display questions

        currentQuiz.questions.forEach((question, index) => {

            const questionCard = document.createElement("div");

            questionCard.className = "question-card";


            const questionHeading = document.createElement("h3");

            questionHeading.textContent =
                `${index + 1}. ${question.questionText}`;


            questionCard.appendChild(questionHeading);


            // Display options

            question.options.forEach(option => {

                const label = document.createElement("label");

                label.className = "answer-option";


                const radio = document.createElement("input");

                radio.type = "radio";

                radio.name = `question${index}`;

                radio.value = option;

                radio.required = true;


                label.appendChild(radio);

                label.appendChild(
                    document.createTextNode(" " + option)
                );


                questionCard.appendChild(label);

            });


            questionsArea.appendChild(questionCard);

        });


        console.log("Quiz loaded successfully!");


    } catch (error) {

        console.error("Quiz loading error:", error);

        quizTitle.textContent = "Unable to Load Quiz";

        questionsArea.textContent =
            "Something went wrong. Please refresh the page.";

    }

}


// ==========================================
// SAVE QUIZ ATTEMPT IN MONGODB
// ==========================================

async function saveQuizAttempt(answers) {

    const user = getLoggedInUser();

    if (!user || !user.id) {

        throw new Error(
            "Please login before saving your quiz performance."
        );

    }

    const response = await fetch("/api/quiz-attempts", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            userId: user.id,

            quizId: currentQuiz._id,

            answers: answers

        })

    });


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data.message || "Unable to save quiz performance."
        );

    }


    console.log("Quiz performance saved:", data.attempt);

    return data.attempt;

}


// ==========================================
// DISPLAY QUIZ RESULTS
// ==========================================

function displayResults(answers, score) {

    resultArea.innerHTML = "";

    const totalQuestions = currentQuiz.questions.length;

    const percentage = totalQuestions > 0
        ? (score / totalQuestions) * 100
        : 0;


    // RESULT SUMMARY

    const summaryCard = document.createElement("div");

    summaryCard.className = "result-summary";


    const scoreHeading = document.createElement("h2");

    scoreHeading.textContent =
        `Your Score: ${score} / ${totalQuestions}`;


    const percentageHeading = document.createElement("h3");

    percentageHeading.textContent =
        `Your Performance: ${percentage.toFixed(1)}%`;


    const feedback = document.createElement("p");

    if (percentage >= 80) {

        feedback.textContent = "Excellent Work! Keep it up!";

    } else if (percentage >= 50) {

        feedback.textContent = "Good Job! Keep Practicing!";

    } else {

        feedback.textContent = "Keep Learning. You can improve!";

    }


    summaryCard.appendChild(scoreHeading);

    summaryCard.appendChild(percentageHeading);

    summaryCard.appendChild(feedback);


    resultArea.appendChild(summaryCard);


    // INDIVIDUAL QUESTION RESULTS

    const reviewHeading = document.createElement("h2");

    reviewHeading.textContent = "Answer Review";

    reviewHeading.style.marginTop = "25px";

    resultArea.appendChild(reviewHeading);


    currentQuiz.questions.forEach((question, index) => {

        const resultCard = document.createElement("div");

        resultCard.className = "question-card";


        const heading = document.createElement("h3");

        heading.textContent =
            `${index + 1}. ${question.questionText}`;


        const answerText = document.createElement("p");

        const correctAnswer = question.correctAnswer.trim();

        const userAnswer = answers[index].trim();


        if (userAnswer === correctAnswer) {

            answerText.textContent = "✓ Correct Answer";

            answerText.style.color = "green";

        } else {

            answerText.textContent = "✗ Incorrect Answer";

            answerText.style.color = "red";

        }


        const selectedText = document.createElement("p");

        selectedText.textContent =
            `Your Answer: ${answers[index]}`;


        const correctText = document.createElement("p");

        correctText.textContent =
            `Correct Answer: ${correctAnswer}`;


        resultCard.appendChild(heading);

        resultCard.appendChild(answerText);

        resultCard.appendChild(selectedText);

        resultCard.appendChild(correctText);


        resultArea.appendChild(resultCard);

    });

}


// ==========================================
// CREATE VIEW MY PROGRESS BUTTON
// ==========================================

function createProgressButton() {

    const button = document.createElement("button");

    button.type = "button";

    button.textContent = "📊 View My Progress";

    button.className = "progress-button";


    button.addEventListener("click", function () {

        window.location.href = "progress.html";

    });


    resultArea.appendChild(button);

}


// ==========================================
// DISPLAY SAVE STATUS
// ==========================================

function displaySaveStatus(saved) {

    const message = document.createElement("p");

    message.className = "save-status";


    if (saved) {

        message.textContent =
            "✓ Your quiz performance has been saved successfully!";

        message.style.color = "green";

    } else {

        message.textContent =
            "Your result is displayed, but saving your performance failed.";

        message.style.color = "red";

    }


    resultArea.appendChild(message);

}


// ==========================================
// SUBMIT QUIZ
// ==========================================

takeQuizForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    // Prevent multiple submissions

    if (quizSubmitted) {

        return;

    }


    if (!currentQuiz) {

        alert("Please wait until the quiz loads.");

        return;

    }


    const submitButton = takeQuizForm.querySelector(
        "button[type='submit']"
    );


    // Validate all answers

    const answers = [];

    let score = 0;


    for (let index = 0; index < currentQuiz.questions.length; index++) {

        const selectedAnswer = document.querySelector(
            `input[name="question${index}"]:checked`
        );


        if (!selectedAnswer) {

            alert(
                `Please answer Question ${index + 1} before submitting.`
            );

            return;

        }


        const userAnswer = selectedAnswer.value;

        answers.push(userAnswer);


        const correctAnswer =
            currentQuiz.questions[index].correctAnswer;


        if (
            userAnswer.trim() === correctAnswer.trim()
        ) {

            score++;

        }

    }


    // Lock submission

    quizSubmitted = true;

    submitButton.disabled = true;

    submitButton.textContent = "Submitting...";


    // Disable all answer options

    document.querySelectorAll(
        "#questionsArea input[type='radio']"
    ).forEach(input => {

        input.disabled = true;

    });


    // Display instant results

    displayResults(answers, score);


    // Save performance

    try {

        await saveQuizAttempt(answers);


        // Display success message

        displaySaveStatus(true);


        // Add progress dashboard button

        createProgressButton();


    } catch (error) {

        console.error("Saving error:", error);

        displaySaveStatus(false);


        // Allow retry if saving failed

        quizSubmitted = false;

        submitButton.disabled = false;

        submitButton.textContent = "Retry Saving";

    }


    if (quizSubmitted) {

        submitButton.textContent = "Quiz Submitted";

    }

});


// ==========================================
// INITIALIZE PAGE
// ==========================================

loadQuiz();