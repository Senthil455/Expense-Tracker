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

  function formatDate(dateStr) {
    try { var d = new Date(dateStr + "T00:00:00"); return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
    catch (e) { return dateStr; }
  }

  function getCategoryIcon(category) { return CATEGORY_ICONS[category] || CATEGORY_ICONS.Other; }
})();
