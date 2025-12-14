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
