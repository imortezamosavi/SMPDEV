/* ==========================================================================
   Sidebar Module
   Handles panel collapse/expand toggles
   ========================================================================== */

const SidebarModule = (() => {
  function init() {
    const panelHeaders = document.querySelectorAll("[data-panel-toggle]");

    panelHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const panelId = header.dataset.panelToggle;
        const body = document.querySelector(`[data-panel-body="${panelId}"]`);
        const chevron = header.querySelector("[data-panel-chevron]");

        if (!body || !chevron) return;

        const isHidden = body.classList.toggle("panel-body--hidden");
        chevron.classList.toggle("panel-chevron--collapsed", isHidden);
      });
    });
  }

  return { init };
})();
