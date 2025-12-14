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
})();
