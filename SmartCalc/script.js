// =====================================
// SMARTCALC - ELEMENTS
// =====================================

const currentOperandElement = document.getElementById("currentOperand");
const previousOperandElement = document.getElementById("previousOperand");

const numberButtons = document.querySelectorAll("[data-number]");
const operatorButtons = document.querySelectorAll("[data-operator]");
const actionButtons = document.querySelectorAll("[data-action]");

const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistory");

// =====================================
// CALCULATOR VARIABLES
// =====================================

let currentOperand = "0";
let previousOperand = "";
let operation = undefined;
let shouldResetScreen = false;

// =====================================
// UPDATE DISPLAY
// =====================================

function updateDisplay() {


currentOperandElement.innerText = currentOperand;

if (operation != null) {
    previousOperandElement.innerText =
        `${previousOperand} ${operation}`;
} else {
    previousOperandElement.innerText = "";
}


}

// =====================================
// ADD NUMBERS
// =====================================

function appendNumber(number) {


if (currentOperand === "Error") {
    currentOperand = "0";
}

if (shouldResetScreen) {

    currentOperand = number;
    shouldResetScreen = false;

} else {

    if (number === "0" && currentOperand === "0") return;

    currentOperand =
        currentOperand === "0"
            ? number
            : currentOperand + number;

}

updateDisplay();


}

// =====================================
// ADD DECIMAL
// =====================================

function addDecimal() {


if (shouldResetScreen) {

    currentOperand = "0";
    shouldResetScreen = false;

}

if (currentOperand.includes(".")) return;

currentOperand += ".";

updateDisplay();


}

// =====================================
// CHOOSE OPERATOR
// =====================================

function chooseOperator(selectedOperator) {


if (currentOperand === "Error") return;

if (operation !== undefined && !shouldResetScreen) {
    calculate();
}

previousOperand = currentOperand;
operation = selectedOperator;
shouldResetScreen = true;

updateDisplay();


}

// =====================================
// CALCULATION HISTORY
// =====================================

function addToHistory(expression, result) {


let history =
    JSON.parse(localStorage.getItem("smartCalcHistory")) || [];

history.unshift({
    expression: expression,
    result: result
});

// Keep only the latest 20 calculations
history = history.slice(0, 20);

localStorage.setItem(
    "smartCalcHistory",
    JSON.stringify(history)
);

displayHistory();


}

// =====================================
// DISPLAY SAVED HISTORY
// =====================================

function displayHistory() {


const history =
    JSON.parse(localStorage.getItem("smartCalcHistory")) || [];

historyList.innerHTML = "";

if (history.length === 0) {

    historyList.innerHTML =
        '<li class="empty-history">No calculations yet</li>';

    return;

}

history.forEach(item => {

    const li = document.createElement("li");

    const expression = document.createElement("span");
    expression.textContent = item.expression;

    const result = document.createElement("strong");
    result.textContent = item.result;

    li.appendChild(expression);
    li.appendChild(result);

    historyList.appendChild(li);

});


}

// =====================================
// CALCULATE RESULT
// =====================================

function calculate() {


if (operation === undefined || shouldResetScreen) return;

const firstNumber = parseFloat(previousOperand);
const secondNumber = parseFloat(currentOperand);

const expression =
    `${previousOperand} ${operation} ${currentOperand}`;

let result;

switch (operation) {

    case "+":
        result = firstNumber + secondNumber;
        break;

    case "-":
        result = firstNumber - secondNumber;
        break;

    case "×":
        result = firstNumber * secondNumber;
        break;

    case "÷":

        if (secondNumber === 0) {

            currentOperand = "Error";
            previousOperand = "";
            operation = undefined;
            shouldResetScreen = true;

            updateDisplay();

            return;

        }

        result = firstNumber / secondNumber;
        break;

}

if (!Number.isFinite(result)) {

    currentOperand = "Error";
    previousOperand = "";
    operation = undefined;
    shouldResetScreen = true;

    updateDisplay();

    return;

}

currentOperand = String(
    parseFloat(result.toPrecision(12))
);

// Save calculation in history
addToHistory(expression, currentOperand);

previousOperand = "";
operation = undefined;
shouldResetScreen = true;

updateDisplay();


}

// =====================================
// CLEAR CALCULATOR
// =====================================

function clearCalculator() {


currentOperand = "0";
previousOperand = "";
operation = undefined;
shouldResetScreen = false;

updateDisplay();


}

// =====================================
// DELETE LAST DIGIT
// =====================================

function deleteNumber() {


if (currentOperand === "Error" || shouldResetScreen) {

    currentOperand = "0";
    shouldResetScreen = false;

} else {

    currentOperand =
        currentOperand.length > 1
            ? currentOperand.slice(0, -1)
            : "0";

}

updateDisplay();


}

// =====================================
// PERCENTAGE
// =====================================

function calculatePercentage() {


if (currentOperand === "Error") return;

currentOperand = String(
    parseFloat(
        (parseFloat(currentOperand) / 100).toPrecision(12)
    )
);

shouldResetScreen = true;

updateDisplay();


}

// =====================================
// POSITIVE / NEGATIVE
// =====================================

function changeSign() {


if (currentOperand === "Error" || currentOperand === "0") return;

currentOperand = String(
    parseFloat(currentOperand) * -1
);

updateDisplay();


}

// =====================================
// CLEAR CALCULATION HISTORY
// =====================================

clearHistoryButton.addEventListener("click", () => {


localStorage.removeItem("smartCalcHistory");

displayHistory();


});

// =====================================
// NUMBER BUTTON EVENTS
// =====================================

numberButtons.forEach(button => {


button.addEventListener("click", () => {

    appendNumber(button.dataset.number);

});


});

// =====================================
// OPERATOR BUTTON EVENTS
// =====================================

operatorButtons.forEach(button => {


button.addEventListener("click", () => {

    chooseOperator(button.dataset.operator);

});


});

// =====================================
// ACTION BUTTON EVENTS
// =====================================

actionButtons.forEach(button => {


button.addEventListener("click", () => {

    const action = button.dataset.action;

    switch (action) {

        case "clear":
            clearCalculator();
            break;

        case "delete":
            deleteNumber();
            break;

        case "percent":
            calculatePercentage();
            break;

        case "decimal":
            addDecimal();
            break;

        case "sign":
            changeSign();
            break;

        case "calculate":
            calculate();
            break;

    }

});


});

// =====================================
// KEYBOARD SUPPORT
// =====================================

document.addEventListener("keydown", event => {


if (event.key >= "0" && event.key <= "9") {
    appendNumber(event.key);
}

if (event.key === ".") {
    addDecimal();
}

if (event.key === "+") {
    chooseOperator("+");
}

if (event.key === "-") {
    chooseOperator("-");
}

if (event.key === "*") {
    chooseOperator("×");
}

if (event.key === "/") {
    event.preventDefault();
    chooseOperator("÷");
}

if (event.key === "Enter" || event.key === "=") {
    calculate();
}

if (event.key === "Backspace") {
    deleteNumber();
}

if (event.key === "Escape") {
    clearCalculator();
}

if (event.key === "%") {
    calculatePercentage();
}


});

// =====================================
// INITIALIZE SMARTCALC
// =====================================

updateDisplay();
displayHistory();


