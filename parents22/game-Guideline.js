const cardsData = [
  {
    title: "Color Quest",
    category: "creative",
    desc: "Pick 3 sunny colors and paint a happy scene. Say the color names aloud together.",
    icon: "🎨",
    color: "#ffd9e6",
    status: "open",
    progress: 35,
    tags: ["Colors", "Creativity", "Fine motor"],
    rules: [
      "Use washable paints/markers only.",
      "Cheer effort, not perfection.",
      "Pause if frustrated; sip water and try again."
    ],
    steps: [
      "Lay out 3 safe, washable colors.",
      "Paint a sun, a cloud, and a smile.",
      "Name each color every time it’s used."
    ],
    materials: "Big paper, 3 bright colors, apron/old shirt.",
    reward: "Sticker + 1 streak point.",
    tips: "Ask: “What should we add next?” and mirror their excitement."
  },
  {
    title: "Puzzle Pals",
    category: "games",
    desc: "Solve a 10–20 piece puzzle together. Celebrate each piece placed.",
    icon: "🧩",
    color: "#d9f3ff",
    status: "open",
    progress: 50,
    tags: ["Teamwork", "Problem solving", "Focus"],
    rules: [
      "Let the child lead; you guide gently.",
      "High-five every 5 pieces.",
      "Keep it to ~10 minutes to stay fun."
    ],
    steps: [
      "Sort edge vs center pieces together.",
      "Build the border, then fill inside.",
      "Show the picture to spot matches."
    ],
    materials: "10–20 piece puzzle, clear table space.",
    reward: "Family cheer + 1 streak point.",
    tips: "Offer hints, not answers; praise persistence."
  },
  {
    title: "Kind Coins",
    category: "kindness",
    desc: "Pick a toy or food can to donate. Add a kind note or drawing.",
    icon: "🤝",
    color: "#fff5d9",
    status: "in-progress",
    progress: 60,
    tags: ["Empathy", "Generosity", "Family task"],
    rules: [
      "Child chooses the item.",
      "Explain who may smile because of it.",
      "Model gratitude and kindness words."
    ],
    steps: [
      "Invite your child to pick one item to share.",
      "Write/draw a short thank-you card together.",
      "Place it in a donation bag with care."
    ],
    materials: "Toy/food item, paper, crayons/markers, bag.",
    reward: "Heart badge + 2 streak points.",
    tips: "Say: “Sharing makes hearts happy.”"
  },
  {
    title: "Helper Star",
    category: "helping",
    desc: "Help for 5 minutes: tidy toys or fold two shirts. Celebrate the try.",
    icon: "🌟",
    color: "#e5ffe7",
    status: "open",
    progress: 20,
    tags: ["Responsibility", "Independence", "Movement"],
    rules: [
      "Keep tasks tiny (2–3 steps).",
      "Use a playful timer (song).",
      "Praise the trying, not perfection."
    ],
    steps: [
      "Start a 3–5 minute timer (song).",
      "Pick one mini-task: tidy, fold, or fetch.",
      "Finish with a hug or dance move."
    ],
    materials: "Basket for toys, small laundry pile, music.",
    reward: "Helper badge + 1 streak point.",
    tips: "Let them choose the task for ownership."
  },
  {
    title: "Story Shapes",
    category: "creative",
    desc: "Draw 3 shapes, give names, and tell a 1-minute story.",
    icon: "📖",
    color: "#f1e4ff",
    status: "open",
    progress: 40,
    tags: ["Imagination", "Speech", "Drawing"],
    rules: [
      "Any shapes are welcome.",
      "Voices and sound effects encouraged.",
      "End with a cheerful “The End!”"
    ],
    steps: [
      "Draw a circle, square, triangle.",
      "Name each character and pick a color.",
      "Act a tiny adventure together."
    ],
    materials: "Paper, crayons/markers.",
    reward: "Story badge + 1 streak point.",
    tips: "Ask open questions: “Where do they travel next?”"
  },
  {
    title: "Balance Walk",
    category: "games",
    desc: "Tape a line on the floor; walk heel-to-toe like a tightrope.",
    icon: "🤸",
    color: "#dfffea",
    status: "completed",
    progress: 100,
    tags: ["Gross motor", "Body control", "Confidence"],
    rules: [
      "Clear floor space first.",
      "Arms wide for balance.",
      "Go slow; safety first."
    ],
    steps: [
      "Make a 3–4m tape line.",
      "Walk heel-to-toe, cheering each step.",
      "Try backwards or animal walks."
    ],
    materials: "Painter’s tape, open floor.",
    reward: "Balance badge + 2 streak points.",
    tips: "Keep it silly; celebrate wobbling too."
  },
  {
    title: "Rainbow Chef",
    category: "creative",
    desc: "Build a fruit/veg rainbow plate together; name each color.",
    icon: "🥗",
    color: "#ffe6d9",
    status: "open",
    progress: 25,
    tags: ["Colors", "Healthy choice", "Sensory"],
    rules: [
      "Wash hands first.",
      "Safe, soft foods for kids to handle.",
      "Celebrate tasting; never force."
    ],
    steps: [
      "Pick 3–5 colorful fruits/veggies.",
      "Arrange in rainbow order on a plate.",
      "Name each color and crunch together."
    ],
    materials: "Colorful fruits/veggies, plate, wet wipes.",
    reward: "Rainbow badge + 1 streak point.",
    tips: "Tiny bites; let them design the plate."
  },
  {
    title: "Kind Notes Wall",
    category: "kindness",
    desc: "Write or draw tiny kindness notes for family and stick them up.",
    icon: "💌",
    color: "#ffe9ff",
    status: "open",
    progress: 30,
    tags: ["Kind words", "Creativity", "Family bonding"],
    rules: [
      "Positive words only.",
      "One short note per person.",
      "Place notes at eye-level for kids."
    ],
    steps: [
      "Cut small papers; add names/hearts.",
      "Write/draw 1 sweet thing per person.",
      "Stick them on a “kind wall.”"
    ],
    materials: "Small papers, crayons/markers, tape.",
    reward: "Kindness badge + 2 streak points.",
    tips: "Model with your own note first."
  },
  {
    title: "Rhythm Parade",
    category: "games",
    desc: "Create a 2-minute home parade with claps, taps, and silly steps.",
    icon: "🥁",
    color: "#e2f3ff",
    status: "open",
    progress: 15,
    tags: ["Music", "Movement", "Joy"],
    rules: [
      "Keep volume safe for ears.",
      "March in clear pathways.",
      "Switch leaders every 30 seconds."
    ],
    steps: [
      "Pick a beat (clap-tap-clap).",
      "Walk a loop through the room.",
      "Swap leaders and repeat."
    ],
    materials: "Hands, light shakers (rice in jar), open path.",
    reward: "Parade badge + 1 streak point.",
    tips: "Try whisper-parade then loud-parade for contrast."
  }
];

const statusColor = {
  open: "#77c693",
  "in-progress": "#f8c14b",
  completed: "#7ab8ff",
};

const cardsContainer = document.getElementById("cards");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");
const modalOk = document.getElementById("modal-ok");
const modalComplete = document.getElementById("modal-mark-complete");
const chips = document.querySelectorAll(".chip");
const toast = document.getElementById("toast");

function renderCards(filter = "all") {
  cardsContainer.innerHTML = "";
  cardsData
    .filter((c) => filter === "all" || c.category === filter)
    .forEach((card, idx) => {
      const cardEl = document.createElement("article");
      cardEl.className = "card";
      cardEl.innerHTML = `
        <div class="card-header">
          <div class="card-icon" style="background:${card.color}">${card.icon}</div>
          <div>
            <h3>${card.title}</h3>
            <p>${card.desc}</p>
          </div>
        </div>
        <div class="badges">
          ${card.tags.map((t) => `<span class="badge-pill">${t}</span>`).join("")}
        </div>
        <div class="progress">
          <div class="progress-inner" style="width:${card.progress}%; background:${statusColor[card.status]}"></div>
        </div>
        <div class="card-actions">
          <button class="view" data-idx="${idx}">View</button>
          <button class="celebrate" data-idx="${idx}">Celebrate</button>
          <button class="complete" data-idx="${idx}">Complete</button>
          <button data-idx="${idx}">Details</button>
        </div>
      `;
      cardsContainer.appendChild(cardEl);
    });
}

function openModal(card) {
  modalTitle.textContent = card.title;
  modalBody.innerHTML = `
    <p><strong>Category:</strong> ${card.category}</p>
    <p><strong>Status:</strong> ${card.status}</p>
    <p><strong>Rules:</strong></p>
    <ul>${card.rules.map((r) => `<li>${r}</li>`).join("")}</ul>
    <p><strong>How to play:</strong></p>
    <ol>${card.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
    <p><strong>Materials:</strong> ${card.materials}</p>
    <p><strong>Parent tip:</strong> ${card.tips}</p>
    <p><strong>Reward & streak:</strong> ${card.reward}</p>
    <p><strong>Show Rules button:</strong> Use “Details” or “View” to revisit anytime.</p>
  `;
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() { modal.setAttribute("aria-hidden", "true"); }

function markComplete(idx) {
  cardsData[idx].status = "completed";
  cardsData[idx].progress = 100;
  renderCards(getActiveFilter());
  modalBody.insertAdjacentHTML("beforeend", `<p style="color:#14532d;font-weight:850;">Marked as completed. 🎉</p>`);
  showToast("✅ Marked as completed! Streak updated.");
}

function getActiveFilter() {
  const active = document.querySelector(".chip.active");
  return active ? active.dataset.filter : "all";
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

cardsContainer.addEventListener("click", (e) => {
  const idx = e.target.dataset.idx;
  if (idx === undefined) return;
  const card = cardsData[idx];

  if (e.target.classList.contains("view") || e.target.textContent === "Details") {
    openModal(card);
  } else if (e.target.classList.contains("complete")) {
    markComplete(idx);
  } else if (e.target.classList.contains("celebrate")) {
    showToast("🎉 Great effort! Give a high-five.");
  }
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    renderCards(chip.dataset.filter);
  });
});

modalClose.addEventListener("click", closeModal);
modalOk.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
modalComplete.addEventListener("click", () => {
  const title = modalTitle.textContent;
  const idx = cardsData.findIndex((c) => c.title === title);
  if (idx > -1) markComplete(idx);
});

document.getElementById("btn-back").addEventListener("click", () => alert("Back to dashboard"));
document.getElementById("btn-subscribe").addEventListener("click", () => alert("Subscription flow placeholder"));

renderCards();