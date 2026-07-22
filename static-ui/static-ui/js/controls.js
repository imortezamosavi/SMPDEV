/* ==========================================================================
   Controls Module
   Handles date picker, basemap selector, layer toggles, generate button
   ========================================================================== */

const ControlsModule = (() => {
  let state = {
    currentDate: MOCK_DATA.currentDate,
    selectedBaseMap: MOCK_DATA.selectedBaseMap,
    layers: JSON.parse(JSON.stringify(MOCK_DATA.layers)),
    isGenerating: false,
  };

  /* -----------------------------------------------------------------------
     Date Picker
     ----------------------------------------------------------------------- */

  function initDatePicker() {
    const dateInput = document.getElementById("date-input");
    const popover = document.getElementById("calendar-popover");
    const calendarDays = document.getElementById("calendar-days");
    const monthYearEl = document.getElementById("calendar-month-year");
    const prevBtn = document.getElementById("calendar-prev");
    const nextBtn = document.getElementById("calendar-next");

    if (!dateInput || !popover) return;

    let currentDate = new Date(state.currentDate);
    let viewMonth = currentDate.getMonth();
    let viewYear = currentDate.getFullYear();

    function renderCalendar() {
      if (!calendarDays || !monthYearEl) return;

      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];

      monthYearEl.textContent = `${monthNames[viewMonth]} ${viewYear}`;

      const firstDay = new Date(viewYear, viewMonth, 1).getDay();
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

      const today = new Date();
      const selectedDate = new Date(state.currentDate);

      let html = "";

      // Previous month days
      for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        html += `<button type="button" class="calendar-day calendar-day--other-month" disabled>${day}</button>`;
      }

      // Current month days
      for (let d = 1; d <= daysInMonth; d++) {
        const isSelected =
          d === selectedDate.getDate() &&
          viewMonth === selectedDate.getMonth() &&
          viewYear === selectedDate.getFullYear();

        const isToday =
          d === today.getDate() &&
          viewMonth === today.getMonth() &&
          viewYear === today.getFullYear();

        html += `<button type="button" class="calendar-day${isSelected ? " calendar-day--selected" : ""}" data-day="${d}">${d}</button>`;
      }

      // Next month days
      const totalCells = firstDay + daysInMonth;
      const remaining = Math.ceil(totalCells / 7) * 7 - totalCells;
      for (let d = 1; d <= remaining; d++) {
        html += `<button type="button" class="calendar-day calendar-day--other-month" disabled>${d}</button>`;
      }

      calendarDays.innerHTML = html;

      // Attach click handlers to day buttons
      calendarDays.querySelectorAll("[data-day]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const day = parseInt(btn.dataset.day, 10);
          const month = String(viewMonth + 1).padStart(2, "0");
          const dayStr = String(day).padStart(2, "0");
          const newDate = `${viewYear}-${month}-${dayStr}`;

          state.currentDate = newDate;
          dateInput.value = formatDateDisplay(newDate);
          popover.classList.remove("calendar-popover--open");
          renderCalendar();
          updateInfoCards();
        });
      });
    }

    function formatDateDisplay(isoDate) {
      const d = new Date(isoDate + "T00:00:00");
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // Set initial value
    dateInput.value = formatDateDisplay(state.currentDate);

    // Toggle popover on input click
    dateInput.addEventListener("click", (e) => {
      e.stopPropagation();
      popover.classList.toggle("calendar-popover--open");
      renderCalendar();
    });

    // Close popover when clicking outside
    document.addEventListener("click", (e) => {
      if (!popover.contains(e.target) && e.target !== dateInput) {
        popover.classList.remove("calendar-popover--open");
      }
    });

    // Month navigation
    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        viewMonth--;
        if (viewMonth < 0) {
          viewMonth = 11;
          viewYear--;
        }
        renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        viewMonth++;
        if (viewMonth > 11) {
          viewMonth = 0;
          viewYear++;
        }
        renderCalendar();
      });
    }
  }

  /* -----------------------------------------------------------------------
     Basemap Switcher
     ----------------------------------------------------------------------- */

  function initBasemapSwitcher() {
    const buttons = document.querySelectorAll("[data-basemap]");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const baseMapId = btn.dataset.basemap;
        if (baseMapId === state.selectedBaseMap) return;

        state.selectedBaseMap = baseMapId;

        buttons.forEach((b) => b.classList.remove("basemap-btn--active"));
        btn.classList.add("basemap-btn--active");
      });
    });
  }

  /* -----------------------------------------------------------------------
     Layer Toggles
     ----------------------------------------------------------------------- */

  function initLayerToggles() {
    const toggles = document.querySelectorAll("[data-layer-toggle]");

    toggles.forEach((toggle) => {
      toggle.addEventListener("change", (e) => {
        const layerId = toggle.dataset.layerToggle;
        const layer = state.layers.find((l) => l.id === layerId);
        if (layer) {
          layer.visible = toggle.checked;
        }
      });
    });
  }

  /* -----------------------------------------------------------------------
     Generate Button
     ----------------------------------------------------------------------- */

  function initGenerateButton() {
    const btn = document.getElementById("btn-generate");

    if (!btn) return;

    btn.addEventListener("click", () => {
      if (state.isGenerating) return;

      state.isGenerating = true;
      btn.classList.add("btn-generate--loading");

      const originalText = btn.innerHTML;
      btn.innerHTML =
        '<svg class="btn-generate-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Generating...';

      // Mock loading delay
      setTimeout(() => {
        state.isGenerating = false;
        btn.classList.remove("btn-generate--loading");
        btn.innerHTML = originalText;
      }, 2000);
    });
  }

  /* -----------------------------------------------------------------------
     Info Cards Update (when date changes)
     ----------------------------------------------------------------------- */

  function updateInfoCards() {
    const dateCard = document.querySelector("#info-card-date .info-card-title");
    if (dateCard) {
      const d = new Date(state.currentDate + "T00:00:00");
      dateCard.textContent = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  /* -----------------------------------------------------------------------
     Init
     ----------------------------------------------------------------------- */

  function init() {
    initDatePicker();
    initBasemapSwitcher();
    initLayerToggles();
    initGenerateButton();
  }

  return { init };
})();
