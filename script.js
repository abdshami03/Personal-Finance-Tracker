// DOM Elements
const transactionForm = document.getElementById("transaction-form");
const transactionList = document.getElementById("transaction-list");
const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("search-transaction");
const themeToggle = document.getElementById("theme-toggle");
const budgetForm = document.getElementById("budget-form");
const monthlyBudgetElement = document.getElementById("monthly-budget");
const budgetProgressBar = document.getElementById("budget-progress-bar");
const budgetRemainingElement = document.getElementById("budget-remaining");
const reportButtons = document.querySelectorAll(".report-btn");
const exportButton = document.getElementById("export-btn");
const incomeExpenseChart = document.getElementById("income-expense-chart");
const categoryChart = document.getElementById("category-chart");

// Sample transactions data
const sampleTransactions = [
  {
    id: 1,
    description: "Monthly Salary",
    amount: 5000,
    category: "salary",
    date: new Date(2024, 2, 1).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  },
  {
    id: 2,
    description: "Freelance Project",
    amount: 1200,
    category: "freelance",
    date: new Date(2024, 2, 5).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  },
  {
    id: 3,
    description: "Rent Payment",
    amount: -1500,
    category: "housing",
    date: new Date(2024, 2, 3).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  },
  {
    id: 4,
    description: "Grocery Shopping",
    amount: -200,
    category: "food",
    date: new Date(2024, 2, 6).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  },
  {
    id: 5,
    description: "Electricity Bill",
    amount: -150,
    category: "utilities",
    date: new Date(2024, 2, 4).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  },
  {
    id: 6,
    description: "Investment Returns",
    amount: 500,
    category: "investments",
    date: new Date(2024, 2, 7).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  },
  {
    id: 7,
    description: "Restaurant Dinner",
    amount: -80,
    category: "food",
    date: new Date(2024, 2, 8).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  },
  {
    id: 8,
    description: "Transportation",
    amount: -120,
    category: "transportation",
    date: new Date(2024, 2, 5).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  },
  {
    id: 9,
    description: "Healthcare Checkup",
    amount: -250,
    category: "healthcare",
    date: new Date(2024, 2, 9).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  },
  {
    id: 10,
    description: "Shopping - Clothes",
    amount: -180,
    category: "shopping",
    date: new Date(2024, 2, 10).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  },
];

// Local Storage
let transactions =
  JSON.parse(localStorage.getItem("transactions")) || sampleTransactions;
let monthlyBudget = parseFloat(localStorage.getItem("monthlyBudget")) || 3000;
let darkMode = localStorage.getItem("darkMode") === "true";

// Initialize theme
if (darkMode) {
  document.documentElement.setAttribute("data-theme", "dark");
  themeToggle.checked = true;
}

// Chart instances
let incomeExpenseChartInstance = null;
let categoryChartInstance = null;

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
      <span class="transaction-category">${transaction.category}</span>
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

  // Update budget elements
  monthlyBudgetElement.textContent = `$${monthlyBudget.toFixed(2)}`;
  const spentAmount = parseFloat(expense);
  const remainingAmount = monthlyBudget - spentAmount;
  budgetRemainingElement.textContent = `Remaining: $${remainingAmount.toFixed(
    2
  )}`;

  // Update budget progress bar
  const progressPercentage =
    monthlyBudget > 0 ? (spentAmount / monthlyBudget) * 100 : 0;
  budgetProgressBar.style.width = `${Math.min(progressPercentage, 100)}%`;

  // Change progress bar color based on spending
  if (progressPercentage > 90) {
    budgetProgressBar.style.background = "var(--expense-color)";
  } else if (progressPercentage > 70) {
    budgetProgressBar.style.background = "var(--primary-color)";
  } else {
    budgetProgressBar.style.background = "var(--income-color)";
  }

  // Update transaction list
  updateTransactionList();

  // Update charts
  updateCharts();

  // Save to localStorage
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("monthlyBudget", monthlyBudget.toString());
}

// returns a new transaction object
function createTransaction(description, amount, category, date) {
  return {
    id: Date.now(),
    description,
    amount,
    category,
    date:
      date ||
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
  };
}

// Handles form submission for new transactions
function handleTransactionSubmit(e) {
  e.preventDefault();
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  if (description.trim() === "" || isNaN(amount) || !category) {
    alert("Please enter valid description, amount, and category");
    return;
  }

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const transaction = createTransaction(
    description,
    amount,
    category,
    formattedDate
  );
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

// Handles budget form submission
function handleBudgetSubmit(e) {
  e.preventDefault();
  const budgetAmount = parseFloat(
    document.getElementById("budget-amount").value
  );

  if (isNaN(budgetAmount) || budgetAmount < 0) {
    alert("Please enter a valid budget amount");
    return;
  }

  monthlyBudget = budgetAmount;
  updateUI();
  budgetForm.reset();
}

// Handles theme toggle
function handleThemeToggle() {
  darkMode = themeToggle.checked;
  document.documentElement.setAttribute(
    "data-theme",
    darkMode ? "dark" : "light"
  );
  localStorage.setItem("darkMode", darkMode);
}

// Handles report period selection
function handleReportPeriodClick(button) {
  // Update button states
  reportButtons.forEach((btn) => btn.classList.remove("active"));
  button.classList.add("active");

  // Update charts with new period
  updateCharts(button.dataset.period);
}

// Updates the charts with current data
function updateCharts(period = "month") {
  // Filter transactions based on period
  const now = new Date();
  let filteredTransactions = [...transactions];

  if (period === "week") {
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= oneWeekAgo;
    });
  } else if (period === "month") {
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    filteredTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= oneMonthAgo;
    });
  } else if (period === "year") {
    const oneYearAgo = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate()
    );
    filteredTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= oneYearAgo;
    });
  }

  // Prepare data for income vs expense chart
  const incomeData = filteredTransactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const expenseData = filteredTransactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // Set default chart background
  Chart.defaults.color = "#fff";
  Chart.defaults.borderColor = "rgba(255, 255, 255, 0.1)";

  // Update income vs expense chart
  if (incomeExpenseChartInstance) {
    incomeExpenseChartInstance.destroy();
  }

  const incomeExpenseCtx = incomeExpenseChart.getContext("2d");
  incomeExpenseChartInstance = new Chart(incomeExpenseCtx, {
    type: "bar",
    data: {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          label: "Amount ($)",
          data: [incomeData, expenseData],
          backgroundColor: [
            "rgba(46, 204, 113, 0.7)",
            "rgba(231, 76, 60, 0.7)",
          ],
          borderColor: ["rgba(46, 204, 113, 1)", "rgba(231, 76, 60, 1)"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return "$ " + context.raw.toLocaleString();
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "rgb(255, 255, 255)",
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "rgb(255, 255, 255)",
          },
        },
      },
    },
  });

  // Prepare data for category chart
  const categoryData = {};
  filteredTransactions
    .filter((t) => t.amount < 0)
    .forEach((t) => {
      const category = t.category.charAt(0).toUpperCase() + t.category.slice(1);
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      categoryData[category] += Math.abs(t.amount);
    });

  // Update category chart
  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  const categoryCtx = categoryChart.getContext("2d");
  categoryChartInstance = new Chart(categoryCtx, {
    type: "doughnut",
    data: {
      labels: Object.keys(categoryData),
      datasets: [
        {
          data: Object.values(categoryData),
          backgroundColor: [
            "rgba(52, 152, 219, 0.7)",
            "rgba(155, 89, 182, 0.7)",
            "rgba(241, 196, 15, 0.7)",
            "rgba(230, 126, 34, 0.7)",
            "rgba(231, 76, 60, 0.7)",
            "rgba(46, 204, 113, 0.7)",
            "rgba(52, 73, 94, 0.7)",
            "rgba(149, 165, 166, 0.7)",
          ],
          borderColor: [
            "rgba(52, 152, 219, 1)",
            "rgba(155, 89, 182, 1)",
            "rgba(241, 196, 15, 1)",
            "rgba(230, 126, 34, 1)",
            "rgba(231, 76, 60, 1)",
            "rgba(46, 204, 113, 1)",
            "rgba(52, 73, 94, 1)",
            "rgba(149, 165, 166, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "rgb(255, 255, 255)",
            padding: 20,
            font: {
              size: 12,
            },
            generateLabels: function (chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const total = data.datasets[0].data.reduce(
                    (acc, curr) => acc + curr,
                    0
                  );
                  const percentage = ((value / total) * 100).toFixed(1);
                  return {
                    text: `${label} ($${value.toLocaleString()} - ${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    strokeStyle: data.datasets[0].borderColor[i],
                    lineWidth: 1,
                    hidden: false,
                    index: i,
                  };
                });
              }
              return [];
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const total = context.dataset.data.reduce(
                (acc, curr) => acc + curr,
                0
              );
              const percentage = ((value / total) * 100).toFixed(1);
              return `$${value.toLocaleString()} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

// Handles search functionality
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();

  if (!searchTerm) {
    updateTransactionList();
    return;
  }

  const filteredTransactions = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(searchTerm) ||
      t.category.toLowerCase().includes(searchTerm)
  );

  updateTransactionList(filteredTransactions);
}

// Exports transaction data to CSV
function exportTransactions() {
  if (transactions.length === 0) {
    alert("No transactions to export");
    return;
  }

  const headers = ["Date", "Description", "Category", "Amount"];
  const csvContent = [
    headers.join(","),
    ...transactions.map((t) =>
      [t.date, `"${t.description}"`, t.category, t.amount].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `transactions_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Event Listeners
transactionForm.addEventListener("submit", handleTransactionSubmit);
filterButtons.forEach((button) => {
  button.addEventListener("click", () => handleFilterClick(button));
});
budgetForm.addEventListener("submit", handleBudgetSubmit);
themeToggle.addEventListener("change", handleThemeToggle);
reportButtons.forEach((button) => {
  button.addEventListener("click", () => handleReportPeriodClick(button));
});
searchInput.addEventListener("input", handleSearch);
exportButton.addEventListener("click", exportTransactions);

// Initialize UI
updateUI();
