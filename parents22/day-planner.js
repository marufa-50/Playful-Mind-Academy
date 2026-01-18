const weeklyPlans = {
  sunday: [
    {
      title: "Family Nature Walk",
      description: "Explore the park, collect leaves, snap photos of birds.",
      time: "9:00 AM",
      tags: ["Physical", "Social", "Fun"],
      status: "open",
      details: "Bring water and a small snack. Points: +3 for completing as a team."
    },
    {
      title: "Kindness Jar",
      description: "Write 3 kind notes for family members.",
      time: "4:00 PM",
      tags: ["Kindness", "Creativity"],
      status: "completed",
      details: "Streak bonus +1. Place notes in the living room jar."
    }
  ],
  monday: [
    {
      title: "Help Mom: Kitchen Helper",
      description: "Wash veggies, set the table, wipe counters.",
      time: "6:00 PM",
      tags: ["Help Mom", "Life skills"],
      status: "open",
      details: "Points +2. Supervision required."
    },
    {
      title: "Drawing Dash",
      description: "Draw your favorite animal using crayons.",
      time: "5:00 PM",
      tags: ["Drawing", "Creative"],
      status: "open",
      details: "Upload photo to gallery for bonus badge."
    }
  ],
  tuesday: [
    {
      title: "Board Game Buddy",
      description: "Play a board game with sibling or parent.",
      time: "7:00 PM",
      tags: ["Games", "Social"],
      status: "open",
      details: "Win or lose, earn +2 fun points."
    }
  ],
  wednesday: [
    {
      title: "Donation Sort",
      description: "Pick 2 toys to donate and clean them.",
      time: "5:30 PM",
      tags: ["Donation", "Kindness"],
      status: "completed",
      details: "Reward: +4 points and 'Kind Buddy' badge."
    }
  ],
  thursday: [
    {
      title: "Daily Tasks Booster",
      description: "Tidy desk, organize books, water plants.",
      time: "4:00 PM",
      tags: ["Daily tasks", "Care"],
      status: "open",
      details: "Finish all to earn +3 streak points."
    },
    {
      title: "Art & Craft Time",
      description: "Create a collage using magazine cutouts.",
      time: "5:30 PM",
      tags: ["Arts", "Creative"],
      status: "open",
      details: "Share with family. Bonus if you include 5 colors."
    },
    {
      title: "Games & Giggles",
      description: "Play 'Simon Says' and 'Freeze Dance'.",
      time: "6:30 PM",
      tags: ["Games", "Physical"],
      status: "open",
      details: "Earn +2 points for full participation."
    }
  ],
  friday: [
    {
      title: "Movie Night Helper",
      description: "Choose snacks and set up the cozy corner.",
      time: "8:00 PM",
      tags: ["Fun", "Help"],
      status: "open",
      details: "Points +2 and 'Cozy Crew' badge chance."
    }
  ],
  saturday: [
    {
      title: "Park Playdate",
      description: "Meet friends, play tag, share toys.",
      time: "10:00 AM",
      tags: ["Physical", "Social"],
      status: "open",
      details: "Earn +3 points. Bring water and hat."
    }
  ]
};

// Elements
const tabs = document.querySelectorAll(".tab");
const cardsContainer = document.getElementById("cards-container");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");
const modalOk = document.getElementById("modal-ok");

// Render cards for the selected day
function renderDay(dayKey) {
  cardsContainer.innerHTML = "";
  const activities = weeklyPlans[dayKey] || [];
  activities.forEach((item, idx) => {
    const card = document.createElement("article");
    card.className = "card";

    const statusClass = item.status === "completed" ? "completed" : "";
    card.innerHTML = `
      <span class="status-pill ${statusClass}">${item.status === "completed" ? "Done" : "Open"}</span>
      <div>
        <h3>${item.title}</h3>
        <p class="subtitle">${item.description}</p>
        <div class="meta">Time: ${item.time}</div>
      </div>
      <div class="tag-row">
        ${item.tags.map(t => `<span class="tag">${t}</span>`).join("")}
      </div>
      <div class="actions">
        <button class="btn view" data-day="${dayKey}" data-index="${idx}">View</button>
        <button class="btn done" data-day="${dayKey}" data-index="${idx}">Mark Seen</button>
        <button class="btn edit" disabled title="Parents view-only">Edit (locked)</button>
      </div>
    `;
    cardsContainer.appendChild(card);
  });
}

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    renderDay(tab.dataset.day);
  });
});

// Modal behavior
function openModal(title, body) {
  modalTitle.textContent = title;
  modalBody.innerHTML = body;
  modal.classList.remove("hidden");
}
function closeModal() { modal.classList.add("hidden"); }

modalClose.addEventListener("click", closeModal);
modalOk.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

// Handle card button clicks
cardsContainer.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const { day, index } = btn.dataset;
  const activity = weeklyPlans[day]?.[index];
  if (!activity) return;

  if (btn.classList.contains("view")) {
    openModal(activity.title, `
      <p><strong>Description:</strong> ${activity.description}</p>
      <p><strong>Time:</strong> ${activity.time}</p>
      <p><strong>Tags:</strong> ${activity.tags.join(", ")}</p>
      <p><strong>Details:</strong> ${activity.details}</p>
    `);
  }

  if (btn.classList.contains("done")) {
    // Visual-only update (parent view): mark as seen
    btn.textContent = "Seen";
    btn.disabled = true;
    btn.style.opacity = 0.6;
    openModal("Marked as seen", `<p>You acknowledged "${activity.title}".</p><p>Student streak unaffected; view-only mode.</p>`);
  }
});

// Initial render (Sunday as default)
renderDay("sunday");