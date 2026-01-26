let round = 0;
let selectedModel = null;

// Randomized, persistent model order
let modelOrder = ["A", "B", "C", "D"].sort(() => Math.random() - 0.5);

const MODEL_NAMES = {
  A: "Blue Model",
  B: "Green Model",
  C: "Orange Model",
  D: "Purple Model"
};

const MODEL_COLORS = {
  A: "#eaf2ff",
  B: "#eaf7ee",
  C: "#fff1e6",
  D: "#f2ecff"
};

const NEXT_DELAY_MS = 600;

const promptEl = document.getElementById("prompt");
const generateBtn = document.getElementById("generateBtn");
const loadingEl = document.getElementById("loading");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const instructionEl = document.getElementById("selectionInstruction");

function timestamp() {
  return Date.now();
}

function loadRound() {
  const q = window.LLM_DATA[round];
  promptEl.textContent = q.prompt;

  answersEl.classList.add("hidden");
  loadingEl.classList.add("hidden");
  nextBtn.classList.add("hidden");
  instructionEl.classList.add("hidden");

  selectedModel = null;
  generateBtn.disabled = false;

  answersEl.innerHTML = "";

  modelOrder.forEach(model => {
    const wrapper = document.createElement("div");
    wrapper.className = "answer-wrapper";
    wrapper.dataset.model = model;
    wrapper.style.background = MODEL_COLORS[model];

    wrapper.innerHTML = `
      <div class="model-label">${MODEL_NAMES[model]}</div>
      <div class="answer-card">${q.answers[model]}</div>
    `;

    wrapper.addEventListener("click", () => {
      document.querySelectorAll(".answer-card")
        .forEach(c => c.classList.remove("selected"));

      wrapper.querySelector(".answer-card").classList.add("selected");
      selectedModel = model;

      window.parent.postMessage(
        {
          type: "choiceMade",
          fieldName: `choice_round_${round + 1}`,
          value: model,
          timestamp: timestamp()
        },
        "*"
      );

      setTimeout(() => {
        nextBtn.classList.remove("hidden");
      }, NEXT_DELAY_MS);
    });

    answersEl.appendChild(wrapper);
  });
}

generateBtn.addEventListener("click", () => {
  generateBtn.disabled = true;
  loadingEl.classList.remove("hidden");

  window.parent.postMessage(
    {
      type: "generate_clicked",
      round: round + 1,
      timestamp: timestamp()
    },
    "*"
  );

  setTimeout(() => {
    loadingEl.classList.add("hidden");
    answersEl.classList.remove("hidden");
    instructionEl.classList.remove("hidden");
  }, 700);
});

nextBtn.addEventListener("click", () => {
  window.parent.postMessage(
    {
      type: "next_clicked",
      round: round + 1,
      selectedModel,
      timestamp: timestamp()
    },
    "*"
  );

  round++;

  if (round >= window.LLM_DATA.length) {
    document.getElementById("app").innerHTML =
      "<h2>Thank you, you may now proceed to the next task.</h2>";
    return;
  }

  loadRound();
});

loadRound();
