const questionsContainer = document.getElementById("questionsContainer");
const addQuestionBtn = document.getElementById("addQuestion");

let questionCount = 0;

// Add a new question
addQuestionBtn.addEventListener("click", function () {

    questionCount++;

    const questionDiv = document.createElement("div");
    questionDiv.className = "question-card";

    questionDiv.innerHTML = `
        <h3>Question ${questionCount}</h3>

        <label>Enter Question</label>
        <input type="text" class="question-text"
            placeholder="Enter your question" required>

        <label>Options</label>

        <div class="option-group">
            <input type="radio" name="correct${questionCount}" value="0" required>
            <input type="text" class="option"
                placeholder="Option 1" required>
        </div>

        <div class="option-group">
            <input type="radio" name="correct${questionCount}" value="1">
            <input type="text" class="option"
                placeholder="Option 2" required>
        </div>

        <div class="option-group">
            <input type="radio" name="correct${questionCount}" value="2">
            <input type="text" class="option"
                placeholder="Option 3" required>
        </div>

        <div class="option-group">
            <input type="radio" name="correct${questionCount}" value="3">
            <input type="text" class="option"
                placeholder="Option 4" required>
        </div>

        <p>Select the radio button beside the correct answer.</p>
    `;

    questionsContainer.appendChild(questionDiv);
});
// Save Quiz
const quizForm = document.getElementById("quizForm");

quizForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const user = JSON.parse(localStorage.getItem("quizoraUser"));

    if (!user || !user.id) {
        alert("Please login before creating a quiz.");
        window.location.href = "login.html";
        return;
    }

    const title = document.getElementById("quizTitle").value;
    const description = document.getElementById("quizDescription").value;
    const category = document.getElementById("quizCategory").value;

    const questionCards = document.querySelectorAll(".question-card");

    if (questionCards.length === 0) {
        alert("Please add at least one question.");
        return;
    }

    const questions = [];

    for (const card of questionCards) {
        const questionText = card.querySelector(".question-text").value;

        const options = Array.from(card.querySelectorAll(".option"))
            .map(input => input.value);

        const selectedAnswer = card.querySelector('input[type="radio"]:checked');

        if (!selectedAnswer) {
            alert("Please select the correct answer for every question.");
            return;
        }

        const correctAnswer = options[Number(selectedAnswer.value)];

        questions.push({
            questionText,
            options,
            correctAnswer
        });
    }

    try {
        const response = await fetch("/api/quizzes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                description,
                category,
                questions,
                userId: user.id
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Quiz created successfully!");
            quizForm.reset();
            questionsContainer.innerHTML = "";
            questionCount = 0;
        } else {
            alert(data.message || "Unable to create quiz.");
        }

    } catch (error) {
        alert("Server connection failed. Please try again.");
        console.error(error);
    }
});