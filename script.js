const startBtn = document.getElementById('startBtn');
const timeRemainingElement = document.getElementById('timeRemaining');
const questionContainer = document.getElementById('questionContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const reviewBtn = document.getElementById('reviewBtn');
const quickLinks = document.getElementById('quickLinks');
quickLinks.style.display = 'none';
const submitBtn = document.getElementById('submitBtn');

let questions = [];
let currentQuestionIndex = 0;
let timer;
let testDuration = 240;


/**
 * Adds event listeners to various buttons for user interaction.
 * - startBtn: Begins the test when clicked.
 * - prevBtn: Displays the previous question when clicked.
 * - nextBtn: Displays the next question when clicked.
 * - reviewBtn: Marks the current question for review when clicked.
 * - submitBtn: Submits the test for evaluation when clicked.
 */
startBtn.addEventListener('click', startTest);
prevBtn.addEventListener('click', showPreviousQuestion);
nextBtn.addEventListener('click', showNextQuestion);
reviewBtn.addEventListener('click', markQuestionForReview);
submitBtn.addEventListener('click', submitTest);

const timerContainer = document.getElementById('timerContainer');

const navigation = document.getElementById('navigation');

let testStarted = false;




/**
 * Starts the test when the start button is clicked.
 * Loads questions, starts the timer, and displays the first question.
 */
async function startTest() {
    startBtn.style.display = 'none';
    timerContainer.style.display = 'block';
    questionContainer.style.display = 'block';
    navigation.style.display = 'block';
    quickLinks.style.display = 'flex';
    submitBtn.style.display = 'block';

    await loadQuestions();
    startTimer();
    showQuestion();

    testStarted = true;
}

/**
 * Loads questions from the 'questions.json' file asynchronously.
 */
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        questions = await response.json();
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

/**
 * Starts the timer countdown for the test duration.
 */
function startTimer() {
    timer = setInterval(() => {
        testDuration--;
        updateTimerDisplay();

        if (testDuration <= 0) {
            submitTest();
        }
    }, 1000);
}

/**
 * Updates the displayed timer with the remaining time.
 */
function updateTimerDisplay() {
    const minutes = Math.floor(testDuration / 60);
    const seconds = testDuration % 60;
    timeRemainingElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}


/**
 * Displays the current question with options.
 */
function showQuestion() {
    const question = questions[currentQuestionIndex];
    questionContainer.innerHTML = `
        <h3>${question.question}</h3>
        <ul>
            ${question.options.map((option, index) => `
                <li>
                    <input type="radio" name="answer" value="${option}" id="option${index}" ${question.selectedOption === option ? 'checked' : ''} onchange="saveAnswer()">
                    <label for="option${index}">${option}</label>
                </li>
            `).join('')}
        </ul>
    `;
    updateQuickLinks();
}



/**
 * Displays the previous question when the previous button is clicked.
 */
function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}


/**
 * Displays the next question when the next button is clicked.
 */
function showNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    }
}

/**
 * Saves the selected answer for the current question.
 * Updates question status (answered/unanswered) accordingly.
 */
function saveAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (selectedOption) {
        questions[currentQuestionIndex].selectedOption = selectedOption.value;
        questions[currentQuestionIndex].status = 'answered';
    } else {
        questions[currentQuestionIndex].selectedOption = undefined;
        questions[currentQuestionIndex].status = 'unanswered';
    }
    updateQuickLinks();
}



/**
 * Marks the current question for review.
 */
function markQuestionForReview() {
    questions[currentQuestionIndex].status = 'review';
    updateQuickLinks();
}


/**
 * Updates the quick links for easy navigation to questions.
 */
function updateQuickLinks() {
    quickLinks.innerHTML = questions.map((question, index) => `
        <a href="#" class="${question.status}" onclick="jumpToQuestion(${index})">${index + 1}</a>
    `).join('');
}


/**
 * Jumps to a specific question when a quick link is clicked.
 * @param {number} index - Index of the question to jump to.
 */
function jumpToQuestion(index) {
    currentQuestionIndex = index;
    showQuestion();
}

/**
 * Submits the test, stops the timer, evaluates answers, and displays the score.
 * Hides unnecessary elements after test submission.
 */
function submitTest() {
    clearInterval(timer);
    evaluateAnswers();

    timerContainer.style.display = 'none';
    navigation.style.display = 'none';
    quickLinks.style.display = 'none';
    submitBtn.style.display = 'none';

    displayScore();

    testStarted = false;
}


/**
 * Registers an event listener for beforeunload event on the window.
 * If the test has started, prompts the user with a confirmation message
 * when they attempt to refresh the page to prevent test cancellation.
 * @param {Event} event - The beforeunload event object.
 */
window.addEventListener('beforeunload', function (event) {
    if (testStarted) {
        event.preventDefault();
        event.returnValue = '';
        return 'Test will be canceled if you refresh the page. Are you sure you want to refresh?';
    }
});





/**
 * Evaluates answers and marks questions as answered and correct/incorrect.
 */
function evaluateAnswers() {
    questions.forEach(question => {
        if (question.selectedOption) {
            question.status = 'answered';
            if (question.selectedOption === question.answer) {
                question.correct = true;
            } else {
                question.correct = false;
            }
        }
    });
    updateQuickLinks();
}

/**
 * Displays the test score after submission.
 */
function displayScore() {
    const totalQuestions = questions.length;
    const correctAnswers = questions.filter(question => question.correct).length;
    const score = (correctAnswers / totalQuestions) * 100;

    questionContainer.innerHTML = `
        <h2>Test Result</h2>
        <p>Total Questions: ${totalQuestions}</p>
        <p>Correct Answers: ${correctAnswers}</p>
        <div id="scoreContainer">
            <p>Score: <span id="score">${score.toFixed(2)}%</span></p>
        </div>
    `;

    questionContainer.style.display = 'block';
}
