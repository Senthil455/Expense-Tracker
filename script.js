(function () {
  "use strict";

    var STORAGE_KEY = "expense_tracker_data";
  var THEME_KEY = "expense_theme";

    var CATEGORY_ICONS = {
    Food: "🍔", Transport: "🚗", Entertainment: "🎬",
    Utilities: "💡", Health: "🏥", Shopping: "🛒", Other: "📋"
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var expenses = [];
  var editId = null;
  var currentFilter = "all";
  var searchQuery = "";
  var searchTimeout = null;
  function formatCurrency(amount) { return "$" + amount.toFixed(2); }

  // negative values blocked
  function validateAmount(amount) {
    var val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return "Please enter a valid positive amount.";
    if (val > 999999.99) return "Amount is too large.";
    return null;
  }

  function createExpense(name, amount, category, date) {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: name.trim(), amount: parseFloat(amount), category: category,
      date: date || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    };
  }

  function addExpense(name, amount, category, date) {
    if (!name || !name.trim()) { alert("Please enter an expense name."); return false; }
    if (!category) { alert("Please select a category."); return false; }
    var err = validateAmount(amount);
    if (err) { alert(err); return false; }
    expenses.push(createExpense(name, amount, category, date));
    saveExpenses(); return true;
  }
  function loadExpenses() {
    try { var data = localStorage.getItem(STORAGE_KEY); if (data) expenses = JSON.parse(data); } catch (e) { expenses = []; }
  }

  function saveExpenses() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)); } catch (e) {}
  }

  // en-US locale used
  function formatDate(dateStr) {
    try { var d = new Date(dateStr + "T00:00:00"); return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
    catch (e) { return dateStr; }
  }

  function getCategoryIcon(category) { return CATEGORY_ICONS[category] || CATEGORY_ICONS.Other; }
  function deleteExpense(id) {
    if (!confirm("Delete this expense?")) return;
    expenses = expenses.filter(function (exp) { return exp.id !== id; });
    saveExpenses(); renderExpenses(); updateTotal();
  }

  function getFilteredExpenses() {
    var filtered = expenses;
    if (currentFilter !== "all") filtered = filtered.filter(function (exp) { return exp.category === currentFilter; });
    if (searchQuery) {
      var q = searchQuery.toLowerCase();
      filtered = filtered.filter(function (exp) { return exp.name.toLowerCase().includes(q); });
    }
    return filtered;
  }

  function renderExpenses() {
    var container = $("#expensesContainer");
    var list = getFilteredExpenses();
    if (!list.length) {
      container.innerHTML = "<p class=\"empty-state\">No expenses yet. Add your first expense above!</p>";
      return;
    }
    var html = "";
    for (var i = 0; i < list.length; i++) {
      var exp = list[i];
      html += "<div class=\"expense-card\" data-id=\"" + exp.id + "\">" +
        "<div class=\"expense-info\">" +
          "<span class=\"expense-name\">" + exp.name + "</span>" +
          "<div class=\"expense-meta\">" +
            "<span class=\"expense-category\"><span class=\"category-icon\">" + getCategoryIcon(exp.category) + "</span> " + exp.category + "</span>" +
            "<span class=\"expense-date\">" + formatDate(exp.date) + "</span>" +
          "</div>" +
        "</div>" +
        "<div class=\"expense-actions\">" +
          "<span class=\"expense-amount\">" + formatCurrency(exp.amount) + "</span>" +
          "<button class=\"btn btn-sm btn-edit\" data-action=\"edit\">Edit</button>" +
          "<button class=\"btn btn-sm btn-danger\" data-action=\"delete\">Delete</button>" +
        "</div>" +
      "</div>";
    }
    container.innerHTML = html;
  }
  function exportToCSV() {
    if (!expenses.length) { alert("No expenses to export."); return; }
    var rows = [["Name","Amount","Category","Date","Created"]];
    for (var i = 0; i < expenses.length; i++) {
      var e = expenses[i];
      rows.push([e.name, e.amount, e.category, e.date, e.createdAt]);
    }
    var csv = rows.map(function (r) { return r.join(","); }).join("\n");
    var blob = new Blob([csv], { type: "text/csv" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "expenses.csv";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  function toggleTheme() {
    var body = document.body;
    body.classList.toggle("dark-theme");
    var isDark = body.classList.contains("dark-theme");
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    $("#themeToggle").textContent = isDark ? "☀️" : "Moon";
  }

  function loadTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark") {
      document.body.classList.add("dark-theme");
      $("#themeToggle").textContent = "☀️";
    }
  }
  function openEditModal(id) {
    var exp = expenses.find(function (e) { return e.id === id; });
    if (!exp) return;
    editId = id;
    $("#editId").value = id; $("#editName").value = exp.name;
    $("#editAmount").value = exp.amount; $("#editCategory").value = exp.category;
    $("#editDate").value = exp.date;
    $("#editModal").classList.add("open");
  }

  function closeEditModal() { editId = null; $("#editModal").classList.remove("open"); }

  function handleEditSubmit(e) {
    e.preventDefault();
    var id = $("#editId").value, name = $("#editName").value.trim();
    var amount = $("#editAmount").value, category = $("#editCategory").value, date = $("#editDate").value;
    var err = validateAmount(amount);
    if (!name) { alert("Please enter an expense name."); return; }
    if (err) { alert(err); return; }
    for (var i = 0; i < expenses.length; i++) {
      if (expenses[i].id === id) {
        expenses[i].name = name; expenses[i].amount = parseFloat(amount);
        expenses[i].category = category; expenses[i].date = date;
        break;
      }
    }
    saveExpenses(); closeEditModal(); renderExpenses(); updateTotal();
  }
  function handleFormSubmit(e) {
    e.preventDefault();
    if (addExpense($("#name").value, $("#amount").value, $("#category").value, $("#date").value)) {
      $("#expenseForm").reset();
      $("#date").value = new Date().toISOString().split("T")[0];
      renderExpenses(); updateTotal();
    }
  }

  function handleContainerClick(e) {
    var target = e.target.closest("[data-action]");
    if (!target) return;
    var card = target.closest(".expense-card");
    var id = card ? card.dataset.id : null;
    if (!id) return;
    if (target.dataset.action === "delete") deleteExpense(id);
    else if (target.dataset.action === "edit") openEditModal(id);
  }

  function handleFilterChange(e) { currentFilter = e.target.value; renderExpenses(); updateTotal(); }

  function debouncedSearch(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () {
      searchQuery = e.target.value;
      renderExpenses(); updateTotal();
    }, 250);
  }

  function updateTotal() {
    var filtered = getFilteredExpenses();
    var total = 0;
    for (var i = 0; i < filtered.length; i++) total += filtered[i].amount;
    var el = $("#totalExpenses");
    var countEl = $("#expenseCount");
    if (el) el.textContent = "Total: " + formatCurrency(total);
    if (countEl) countEl.textContent = "(" + filtered.length + " items)";
  }

  function init() {
    loadExpenses(); loadTheme();
    renderExpenses(); updateTotal();
    $("#date").value = new Date().toISOString().split("T")[0];
    $("#expenseForm").addEventListener("submit", handleFormSubmit);
    $("#expensesContainer").addEventListener("click", handleContainerClick);
    $("#filterCategory").addEventListener("change", handleFilterChange);
    $("#search").addEventListener("input", debouncedSearch);
    $("#editForm").addEventListener("submit", handleEditSubmit);
    $("#cancelEdit").addEventListener("click", closeEditModal);
    var closeBtn = $("#editModal .modal-close");
    if (closeBtn) closeBtn.addEventListener("click", closeEditModal);
    $("#editModal").addEventListener("click", function (e) { if (e.target === this) closeEditModal(); });
    $("#themeToggle").addEventListener("click", toggleTheme);
    $("#exportBtn").addEventListener("click", exportToCSV);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
