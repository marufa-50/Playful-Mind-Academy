// Open all FAQ dropdowns
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("details").forEach(d => d.open = true);
});

// Back button
function goBack() {
  window.history.back();
}

// Special Feature: Parenting Tip
function showTip() {
  const tips = [
    "Spend at least 10 minutes daily talking with your child.",
    "Encourage learning through play.",
    "Limit screen time before bedtime.",
    "Praise effort, not just results."
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  document.getElementById("tipBox").innerText = randomTip;
}
