const quizList = document.getElementById("quizList");

// Get category from the page URL
const params = new URLSearchParams(window.location.search);
const category = params.get("category");

// Fetch quizzes
async function loadQuizzes() {
    try {
        let apiURL = "/api/quizzes";

        // Fetch only the selected category
        if (category) {
            apiURL = `/api/quizzes/category/${encodeURIComponent(category)}`;
        }

        const response = await fetch(apiURL);
        const data = await response.json();

        if (!response.ok) {
            quizList.innerHTML = "<p>Unable to load quizzes.</p>";
            return;
        }

        const quizzes = data.quizzes || [];

        if (quizzes.length === 0) {
            quizList.innerHTML = `
                <p class="no-quizzes">
                    No quizzes available in this category yet.
                </p>
            `;
            return;
        }

        quizList.innerHTML = "";

        quizzes.forEach(quiz => {
            const quizCard = document.createElement("div");
            quizCard.className = "quiz-card";

            const creatorName = quiz.createdBy
                ? quiz.createdBy.name
                : "Unknown";

            quizCard.innerHTML = `
                <h3>${escapeHTML(quiz.title)}</h3>
                <p>${escapeHTML(quiz.description || "No description available.")}</p>
                <p>Category: ${escapeHTML(quiz.category || "Other")}</p>
                <p>Questions: ${quiz.questions.length}</p>
                <p>Created by: ${escapeHTML(creatorName)}</p>

                <button onclick="window.location.href='take-quiz.html?id=${quiz._id}'">
                    Take Quiz
                </button>
            `;

            quizList.appendChild(quizCard);
        });

    } catch (error) {
        console.error(error);
        quizList.innerHTML = "<p>Server connection failed.</p>";
    }
}

// Prevent HTML from being interpreted as markup
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// Load quizzes when page opens
loadQuizzes();