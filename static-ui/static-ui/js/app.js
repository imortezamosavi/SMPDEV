/* ==========================================================================
   App — Main Entry Point
   Initializes all UI modules once the DOM is ready
   ========================================================================== */

(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    console.log("[App] Static UI initialized.");

    // Initialize all modules
    MapModule.init();
    SidebarModule.init();
    ControlsModule.init();
  });
})();
