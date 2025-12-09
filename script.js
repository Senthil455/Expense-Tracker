(function () {
  "use strict";

    var STORAGE_KEY = "expense_tracker_data";
  var THEME_KEY = "expense_theme";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var expenses = [];
  var editId = null;
  var currentFilter = "all";
  var searchQuery = "";
  var searchTimeout = null;
})();
