let round = 0;
let selectedModel = null;

const NEXT_DELAY_MS = 600;

// ---------- MODEL RANDOMIZATION (ONCE PER PARTICIPANT) ----------

// Assign model IDs to color-coded labels
const MODEL_IDS = ["Gab", "Grok", "ChatGPT", "Claude"];
const MODEL_COLORS = {
  "Gab": "purple",
  "Grok": "blue",
  "ChatGPT": "orange",
  "Claude": "green"
};

// Randomize the order once per participant
const modelOrder = [...MODEL_IDS].sort(() => Math.random() - 0.5);

// ---------- DOM REFERENCES ----------

const promptEl = document.getElementById("prompt");
const generateBtn = document.getElementById("generateBtn");
const loadingEl = document.getElementById("loading");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const instructionEl = document.getElementById("selectionInstruction");

// ---------- UTIL ----------

function timestamp() {
  return Date.now();
}

// ---------- LOG MODEL ORDER ONCE ----------

window.parent.postMessage(
  {
    type: "model_order",
    value: modelOrder.join(","), // e.g. "Gab,Grok,ChatGPT,Claude"
    timestamp: timestamp()
  },
  "*"
);

// ---------- LOAD ROUND ----------

function loadRound() {
  const q = window.LLM_DATA[round];
  promptEl.textContent = q.prompt;

  answersEl.classList.add("hidden");
  loadingEl.classList.add("hidden");
  nextBtn.classList.add("hidden");
  instructionEl.classList.add("hidden");

  selectedModel = null;
  generateBtn.disabled = false;

  const wrappers = document.querySelectorAll(".answer-wrapper");

  modelOrder.forEach((modelName, i) => {
    const wrapper = wrappers[i];
    const card = wrapper.querySelector(".answer-card");
    const label = wrapper.querySelector(".model-label");

    const colorClass = MODEL_COLORS[modelName];

    // Remove previous color classes
    wrapper.classList.remove("purple","blue","orange","green");
    label.classList.remove("purple","blue","orange","green");

    // Assign current color
    wrapper.classList.add(colorClass);
    label.classList.add(colorClass);

    wrapper.dataset.model = modelName;
    label.textContent = modelName;
    card.textContent = q.answers[modelName];
    card.classList.remove("selected");
  });

  window.parent.postMessage(
    {
      type: "round_loaded",
      round: round + 1,
      timestamp: timestamp()
    },
    "*"
  );
}

// ---------- SEND CHOICE ----------

function sendChoiceToQualtrics(model) {
  window.parent.postMessage(
    {
      type: "choiceMade",
      fieldName: `choice_round_${round + 1}`,
      value: model,
      timestamp: timestamp()
    },
    "*"
  );
}

// ---------- GENERATE RESPONSES ----------

generateBtn.addEventListener("click", () => {
  generateBtn.disabled = true;

  window.parent.postMessage(
    {
      type: "generate_clicked",
      round: round + 1,
      timestamp: timestamp()
    },
    "*"
  );

  loadingEl.classList.remove("hidden");

  setTimeout(() => {
    loadingEl.classList.add("hidden");
    answersEl.classList.remove("hidden");
    instructionEl.classList.remove("hidden");

    window.parent.postMessage(
      {
        type: "responses_shown",
        round: round + 1,
        timestamp: timestamp()
      },
      "*"
    );
  }, 700);
});

// ---------- SELECT ANSWER ----------

document.querySelectorAll(".answer-wrapper").forEach(wrapper => {
  wrapper.addEventListener("click", () => {
    const model = wrapper.dataset.model;

    document
      .querySelectorAll(".answer-card")
      .forEach(c => c.classList.remove("selected"));

    wrapper.querySelector(".answer-card").classList.add("selected");

    selectedModel = model;
    sendChoiceToQualtrics(selectedModel);

    setTimeout(() => {
      nextBtn.classList.remove("hidden");
      nextBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    }, NEXT_DELAY_MS);
  });
});

// ---------- NEXT QUESTION ----------

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
    window.parent.postMessage(
      {
        type: "finishedAllRounds",
        timestamp: timestamp()
      },
      "*"
    );

    document.getElementById("app").innerHTML =
      "<h2>Thank you, you may now proceed to the next task.</h2>";
    return;
  }

  loadRound();
});

// ---------- INIT ----------

loadRound();
