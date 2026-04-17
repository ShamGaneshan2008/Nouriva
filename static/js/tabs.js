// tabs.js — Tab switching + toggle/chip interactivity for Verdish

document.addEventListener('DOMContentLoaded', () => {

  // ── Tab switching ──────────────────────────────────────────
  const navTabs  = document.querySelectorAll('.nav-tab[data-tab]');
  const panels   = document.querySelectorAll('.tab-panel');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      navTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const panel = document.getElementById(`tab-${target}`);
      if (panel) panel.classList.add('active');
    });
  });

  // ── Toggle buttons (Sex) ────────────────────────────────────
  document.querySelectorAll('.toggle-btn[data-group]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      document.querySelectorAll(`.toggle-btn[data-group="${group}"]`)
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ── Activity buttons ────────────────────────────────────────
  document.querySelectorAll('.activity-btn[data-group]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      document.querySelectorAll(`.activity-btn[data-group="${group}"]`)
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ── Goal buttons ────────────────────────────────────────────
  document.querySelectorAll('.goal-btn[data-group]').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      document.querySelectorAll(`.goal-btn[data-group="${group}"]`)
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ── Diet chips (multi-select) ───────────────────────────────
  document.querySelectorAll('#diet-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
    });
  });

  // ── Calculate button ────────────────────────────────────────
  const calcBtn = document.getElementById('calc-btn');
  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      if (typeof VerdishCalc !== 'undefined') {
        VerdishCalc.updateResultCard();
      }
    });
  }

  // Also recalc on input change for live feedback
  ['age', 'height', 'weight'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        if (typeof VerdishCalc !== 'undefined') {
          VerdishCalc.updateResultCard();
        }
      });
    }
  });

});