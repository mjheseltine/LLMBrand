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

    answersEl.classList.add("hidden");
    loadingEl.classList.add("hidden");
    nextBtn.classList.add("hidden");
    selectedModel = null;

    document.querySelectorAll(".answer-wrapper").forEach(wrapper => {
        const model = wrapper.dataset.model;
        const card = wrapper.querySelector(".answer-card");

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
    }, 700);
});

document.querySelectorAll(".answer-wrapper").forEach(wrapper => {
    wrapper.addEventListener("click", () => {
        const model = wrapper.dataset.model;

        document.querySelectorAll(".answer-card")
            .forEach(c => c.classList.remove("selected"));

        wrapper.querySelector(".answer-card")
            .classList.add("selected");

        selectedModel = model;
        sendChoiceToQualtrics(selectedModel);
        nextBtn.classList.remove("hidden");
    });
});

nextBtn.addEventListener("click", () => {
    round++;

    if (round >= window.LLM_DATA.length) {
        window.parent.postMessage({ type: "finishedAllRounds" }, "*");
        document.getElementById("app").innerHTML =
            "<h2>Thank you! You've completed the task.</h2>";
        return;
    }

    loadRound();
});

loadRound();
