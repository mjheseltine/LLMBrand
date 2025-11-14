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
document.querySelectorAll(".answer-wrapper").forEach(wrapper => {
    const model = wrapper.dataset.model;
    const card = wrapper.querySelector(".answer-card");

    card.textContent = q.answers[model];
    card.classList.remove("selected");
});


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

document.querySelectorAll(".answer-wrapper").forEach(wrapper => {
    wrapper.addEventListener("click", () => {
        const model = wrapper.dataset.model;

        // reset selections
        document.querySelectorAll(".answer-card").forEach(c =>
            c.classList.remove("selected")
        );

        // select this one
        wrapper.querySelector(".answer-card").classList.add("selected");

        selectedModel = model;

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
