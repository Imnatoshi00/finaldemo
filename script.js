let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let historyExpenses = JSON.parse(localStorage.getItem("history")) || [];

let weeklyBudget = Number(localStorage.getItem("budget")) || 0;
let budgetStart = localStorage.getItem("budgetStart");

/* NAVIGATION */
function showSection(id) {
  document.querySelectorAll("section").forEach(sec =>
    sec.classList.remove("active")
  );
  document.getElementById(id).classList.add("active");
}

/* ADD EXPENSE */
document.getElementById("expense-form").addEventListener("submit", e => {
  e.preventDefault();

  const expense = {
    title: title.value,
    amount: Number(amount.value),
    category: category.value,
    date: date.value
  };

  expenses.push(expense);
  historyExpenses.push(expense);

  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("history", JSON.stringify(historyExpenses));

  e.target.reset();
  render();
});

/* DELETE FROM HOME */
function deleteExpense(i) {
  expenses.splice(i, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  render();
}

/* RENDER */
function render() {
  const list = document.getElementById("expense-list");
  let total = 0;
  list.innerHTML = "";

  expenses.forEach((e, i) => {
    total += e.amount;
    const li = document.createElement("li");
    li.innerHTML = `${e.title} ₹${e.amount}
      <button onclick="deleteExpense(${i})">X</button>`;
    list.appendChild(li);
  });

  document.getElementById("total").textContent = total;

  renderHistory();
  renderAnalytics();
  updateBudgetStatus();
}

/* HISTORY */
function renderHistory() {
  historyList.innerHTML = "";
  historyExpenses.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.date} - ${e.title} ₹${e.amount}`;
    historyList.appendChild(li);
  });
}

/* ANALYTICS */
function renderAnalytics() {
  if (historyExpenses.length === 0) {
    analyticsData.textContent = "No data yet";
    return;
  }

  const total = historyExpenses.reduce((s,e)=>s+e.amount,0);
  analyticsData.textContent =
    `Total spent: ₹${total} | Purchases: ${historyExpenses.length}`;
}

/* EXPORT */
function exportCSV() {
  let csv = "Title,Amount,Category,Date\n";
  historyExpenses.forEach(e => {
    csv += `${e.title},${e.amount},${e.category},${e.date}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "expenses.csv";
  a.click();
}

/* BUDGET */
function setBudget() {
  weeklyBudget = Number(budgetInput.value);
  if (!weeklyBudget) return;

  localStorage.setItem("budget", weeklyBudget);

  if (!budgetStart) {
    budgetStart = new Date().toISOString();
    localStorage.setItem("budgetStart", budgetStart);
  }

  updateBudgetStatus();
}

function updateBudgetStatus() {
  if (!weeklyBudget || !budgetStart) return;

  const start = new Date(budgetStart);
  const now = new Date();
  const days = Math.floor((now - start)/(1000*60*60*24));

  if (days >= 7) {
    budgetStart = now.toISOString();
    localStorage.setItem("budgetStart", budgetStart);
  }

  const spent = historyExpenses
    .filter(e => new Date(e.date) >= new Date(budgetStart))
    .reduce((s,e)=>s+e.amount,0);

  if (spent > weeklyBudget) {
    budgetStatus.textContent = "⚠️ Budget exceeded!";
    budgetStatus.className = "warning";
  } else {
    budgetStatus.textContent =
      `Remaining: ₹${weeklyBudget - spent}`;
    budgetStatus.className = "safe";
  }
}

/* INIT */
showSection("home");
render();
