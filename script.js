const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const totalEl = document.getElementById("total");
const historyList = document.getElementById("history-list");
const analyticsList = document.getElementById("analytics-list");
const warningEl = document.getElementById("budget-warning");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let budget = JSON.parse(localStorage.getItem("budget")) || 0;
let budgetStart = localStorage.getItem("budgetStart");

document.getElementById("current-budget").textContent = budget;

/* SECTION SWITCH */
function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* BUDGET */
function setBudget() {
  budget = Number(document.getElementById("budget-input").value);
  budgetStart = Date.now();
  localStorage.setItem("budget", budget);
  localStorage.setItem("budgetStart", budgetStart);
  document.getElementById("current-budget").textContent = budget;
}

/* RESET WEEKLY */
if (budgetStart && Date.now() - budgetStart > 7 * 86400000) {
  expenses = [];
  localStorage.removeItem("expenses");
}

/* RENDER */
function render() {
  list.innerHTML = "";
  historyList.innerHTML = "";
  analyticsList.innerHTML = "";

  let total = 0;
  let categories = {};

  expenses.forEach((e, i) => {
    total += e.amount;
    categories[e.category] = (categories[e.category] || 0) + e.amount;

    list.innerHTML += `
      <li>${e.title} ₹${e.amount}
        <button onclick="removeExpense(${i})">X</button>
      </li>`;
  });

  history.forEach(e => {
    historyList.innerHTML += `<li>${e.title} ₹${e.amount}</li>`;
  });

  for (let c in categories) {
    analyticsList.innerHTML += `<li>${c}: ₹${categories[c]}</li>`;
  }

  totalEl.textContent = total;

  warningEl.textContent =
    budget && total > budget
      ? "⚠ Budget exceeded!"
      : "";
}

function removeExpense(i) {
  history.push(expenses[i]);
  expenses.splice(i, 1);
  save();
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const exp = {
    title: title.value,
    amount: Number(amount.value),
    category: category.value,
    date: date.value
  };
  expenses.push(exp);
  history.push(exp);
  save();
  form.reset();
});

function save() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("history", JSON.stringify(history));
  render();
}

/* EXPORT */
function exportData() {
  const blob = new Blob([JSON.stringify(history)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "expenses.json";
  a.click();
}

render();
