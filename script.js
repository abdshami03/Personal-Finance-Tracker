// DOM Elements
const transactionForm = document.getElementById("transaction-form");
const transactionList = document.getElementById("transaction-list");
const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");
const filterButtons = document.querySelectorAll(".filter-btn");

// Local Storage
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Calculates the totals from transactions then returns an obj containing total, income, and expense amounts
function calculateTotals() {
  const amounts = transactions.map((transaction) => transaction.amount);
  const total = amounts.reduce((acc, curr) => acc + curr, 0).toFixed(2);
  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, curr) => acc + curr, 0)
    .toFixed(2);
  const expense = (
    amounts.filter((item) => item < 0).reduce((acc, curr) => acc + curr, 0) * -1
  ).toFixed(2);

  return { total, income, expense };
}

// Creates HTML for a transaction item
// returns HTML string for the transaction item
function createTransactionHTML(transaction) {
  return `
    <div class="transaction-info">
      <span class="transaction-description">${transaction.description}</span>
      <span class="transaction-date">${transaction.date}</span>
    </div>
    <span class="transaction-amount ${
      transaction.amount > 0 ? "income" : "expense"
    }">
      ${transaction.amount > 0 ? "+" : ""}$${Math.abs(
    transaction.amount
  ).toFixed(2)}
    </span>
    <button class="delete-btn" onclick="deleteTransaction(${
      transaction.id
    })">×</button>
  `;
}

// Updates the transaction list
function updateTransactionList(transactionsToShow = transactions) {
  transactionList.innerHTML = "";
  transactionsToShow.forEach((transaction) => {
    const li = document.createElement("li");
    li.className = `transaction-item ${
      transaction.amount > 0 ? "income" : "expense"
    }`;
    li.innerHTML = createTransactionHTML(transaction);
    transactionList.appendChild(li);
  });
}

// Updates all UI elements with current transaction data
function updateUI() {
  const { total, income, expense } = calculateTotals();

  // Update balance elements
  balanceElement.textContent = `$${total}`;
  incomeElement.textContent = `$${income}`;
  expenseElement.textContent = `$${expense}`;

  // Update transaction list
  updateTransactionList();

  // Save to localStorage
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// returns a new transaction object
function createTransaction(description, amount) {
  const now = new Date();
  return {
    id: Date.now(),
    description,
    amount,
    date: now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

// Handles form submission for new transactions
function handleTransactionSubmit(e) {
  e.preventDefault(); //stops the page from refreshing
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);

  if (description.trim() === "" || isNaN(amount)) {
    alert("Please enter valid description and amount");
    return;
  }
  const transaction = createTransaction(description, amount);
  transactions.push(transaction);
  updateUI();
  transactionForm.reset();
}

// Deletes a transaction by ID
function deleteTransaction(id) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    transactions = transactions.filter((transaction) => transaction.id !== id);
    updateUI();
  }
}

// Filters transactions based on type (income/expense)
function filterTransactions(filter) {
  if (filter === "income") {
    return transactions.filter((t) => t.amount > 0);
  } else if (filter === "expense") {
    return transactions.filter((t) => t.amount < 0);
  }
  return [...transactions];
}

// Handles filter button clicks
function handleFilterClick(button) {
  // Update button states
  filterButtons.forEach((btn) => btn.classList.remove("active"));
  button.classList.add("active");

  // Filter and update transactions
  const filter = button.dataset.filter;
  const filteredTransactions = filterTransactions(filter);
  updateTransactionList(filteredTransactions);
}

// Event Listeners
transactionForm.addEventListener("submit", handleTransactionSubmit);
filterButtons.forEach((button) => {
  button.addEventListener("click", () => handleFilterClick(button));
});

// Initialize UI
updateUI();
