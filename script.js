let round = 0;
let selectedModel = null;

const promptEl = document.getElementById("prompt");
const generateBtn = document.getElementById("generateBtn");
const loadingEl = document.getElementById("loading");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");

function loadRound() {
    const q = window.LLM_DATA[round];
    promptEl.textContent = q.prompt;

    // Hide elements
    answersEl.classList.add("hidden");
    nextBtn.classList.add("hidden");
    loadingEl.classList.add("hidden");

    selectedModel = null;

    // Clear answer cards
    document.querySelectorAll(".answer-card").forEach(card => {
        const model = card.dataset.model;
        card.textContent = q.answers[model];
        card.classList.remove("selected");
    });
}

function sendChoiceToQualtrics(model) {
    window.parent.postMessage(
        {
            type: "choiceMade",
            fieldName: `choice_round_${round + 1}`,
            value: model
        },
        "*"
    );
}

generateBtn.addEventListener("click", () => {
    loadingEl.classList.remove("hidden");

    setTimeout(() => {
        loadingEl.classList.add("hidden");
        answersEl.classList.remove("hidden");
    }, 600); // Slight delay for “generate” effect
});

document.querySelectorAll(".answer-card").forEach(card => {
    card.addEventListener("click", () => {
        document.querySelectorAll(".answer-card").forEach(c => {
            c.classList.remove("selected");
        });

        card.classList.add("selected");
        selectedModel = card.dataset.model;

        // Send selection to Qualtrics immediately
        sendChoiceToQualtrics(selectedModel);

        nextBtn.classList.remove("hidden");
    });
});

nextBtn.addEventListener("click", () => {
    round++;

    if (round >= window.LLM_DATA.length) {
        // Send completion signal
        window.parent.postMessage(
            { type: "finishedAllRounds" },
            "*"
        );
        // Optionally show a thank-you screen
        document.getElementById("app").innerHTML = "<h2>Thank you!</h2>";
        return;
    }

    loadRound();
});

// Initialize
loadRound();
