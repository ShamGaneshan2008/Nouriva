// plan.js — Meal plan generation UI logic
// Note: loaded via api.js; make sure api.js is loaded first

document.addEventListener('DOMContentLoaded', () => {
  const genBtn     = document.getElementById('gen-plan-btn');
  const planOutput = document.getElementById('plan-output');
  const planLoading = document.getElementById('plan-loading');
  const planMeta   = document.getElementById('plan-meta');

  if (!genBtn) return;

  genBtn.addEventListener('click', async () => {
    const profile = VerdishCalc.readProfile();

    if (!profile) {
      showToast('Please fill in your profile first (age, height, weight).');
      // Switch to profile tab
      document.querySelector('.nav-tab[data-tab="profile"]')?.click();
      return;
    }

    const { targetKcal } = VerdishCalc.calcTDEE(profile);
    const macros = VerdishCalc.calcMacros(targetKcal, profile.weight);

    // Show loading
    planOutput.innerHTML = '';
    planLoading.classList.remove('hidden');
    genBtn.disabled = true;
    genBtn.style.opacity = '.6';

    try {
      const days = await VerdishAPI.generateMealPlan(profile, targetKcal, macros);
      renderPlan(days, targetKcal);
      planMeta.textContent = `${targetKcal} kcal · P${macros.protein}g  C${macros.carbs}g  F${macros.fat}g`;
    } catch (err) {
      planOutput.innerHTML = `<div class="card" style="grid-column:1/-1;text-align:center;color:var(--muted);">
        <p>Couldn't generate the plan. Check your API connection and try again.</p>
        <p style="font-size:.78rem;margin-top:8px;font-family:var(--font-mono)">${err.message}</p>
      </div>`;
    } finally {
      planLoading.classList.add('hidden');
      genBtn.disabled = false;
      genBtn.style.opacity = '';
    }
  });

  /**
   * Render an array of day objects into the plan grid
   */
  function renderPlan(days, targetKcal) {
    planOutput.innerHTML = '';

    days.forEach(day => {
      const card = document.createElement('div');
      card.className = 'day-card';

      const mealsHTML = day.meals.map((meal, i) => `
        ${i > 0 ? '<div class="meal-divider"></div>' : ''}
        <div class="meal-item">
          <div class="meal-type">${escapeHTML(meal.type)}</div>
          <div class="meal-name">${escapeHTML(meal.name)}</div>
          <div class="meal-macros">${meal.kcal} kcal · P${meal.protein}g  C${meal.carbs}g  F${meal.fat}g</div>
        </div>
      `).join('');

      card.innerHTML = `
        <div class="day-header">
          <span class="day-name">${escapeHTML(day.day)}</span>
          <span class="day-kcal">${day.kcal ?? targetKcal} kcal</span>
        </div>
        <div class="day-meals">${mealsHTML}</div>
      `;

      planOutput.appendChild(card);
    });
  }

  function escapeHTML(str) {
    const d = document.createElement('div');
    d.textContent = String(str ?? '');
    return d.innerHTML;
  }

  function showToast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
      background: 'var(--charcoal)', color: 'var(--white)', padding: '10px 20px',
      borderRadius: '100px', fontSize: '.85rem', zIndex: 999,
      boxShadow: '0 4px 16px rgba(0,0,0,.2)', whiteSpace: 'nowrap',
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
});