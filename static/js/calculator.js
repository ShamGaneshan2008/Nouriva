// calculator.js — TDEE & macro calculations for Verdish

/**
 * Mifflin-St Jeor BMR formula
 * @param {number} weight  kg
 * @param {number} height  cm
 * @param {number} age     years
 * @param {'male'|'female'} sex
 * @returns {number} BMR in kcal
 */
function calcBMR(weight, height, age, sex) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light:     1.375,
  moderate:  1.55,
  very:      1.725,
  extra:     1.9,
};

const GOAL_ADJUSTMENTS = {
  lose:     -500,   // ~0.5 kg/week deficit
  maintain: 0,
  gain:     +300,   // lean bulk surplus
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param {object} profile
 * @returns {{ tdee: number, bmr: number, targetKcal: number }}
 */
function calcTDEE({ weight, height, age, sex, activity, goal }) {
  const bmr  = calcBMR(weight, height, age, sex);
  const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[activity] ?? 1.55));
  const targetKcal = tdee + (GOAL_ADJUSTMENTS[goal] ?? 0);
  return { bmr: Math.round(bmr), tdee, targetKcal };
}

/**
 * Calculate macronutrient targets in grams
 * Protein: 2g/kg bodyweight; Fat: 25% kcal; Carbs: remainder
 * @param {number} targetKcal
 * @param {number} weight kg
 * @returns {{ protein: number, carbs: number, fat: number }}
 */
function calcMacros(targetKcal, weight) {
  const protein = Math.round(weight * 2);        // 2 g/kg
  const fat     = Math.round((targetKcal * 0.25) / 9);  // 25% from fat
  const carbs   = Math.round((targetKcal - protein * 4 - fat * 9) / 4);
  return { protein, fat, carbs: Math.max(carbs, 0) };
}

/**
 * Read current profile selections from the DOM
 * @returns {object|null} profile object or null if inputs are invalid
 */
function readProfile() {
  const age    = parseFloat(document.getElementById('age')?.value);
  const height = parseFloat(document.getElementById('height')?.value);
  const weight = parseFloat(document.getElementById('weight')?.value);

  if (!age || !height || !weight || age < 10 || height < 100 || weight < 30) {
    return null;
  }

  const sex      = getActiveToggle('sex')      ?? 'male';
  const activity = getActiveToggle('activity') ?? 'moderate';
  const goal     = getActiveToggle('goal')     ?? 'maintain';

  const dietChips = [...document.querySelectorAll('#diet-chips .chip.active')]
    .map(el => el.dataset.value);

  return { age, height, weight, sex, activity, goal, dietChips };
}

/**
 * Helper: get the active data-value for a group of toggle/activity/goal buttons
 */
function getActiveToggle(group) {
  const el = document.querySelector(`[data-group="${group}"].active`);
  return el ? el.dataset.value : null;
}

/**
 * Update the TDEE result card in the DOM
 */
function updateResultCard() {
  const profile = readProfile();

  const tdeeVal    = document.getElementById('tdee-value');
  const proteinVal = document.getElementById('macro-protein');
  const carbsVal   = document.getElementById('macro-carbs');
  const fatVal     = document.getElementById('macro-fat');

  if (!profile) {
    tdeeVal.textContent    = '—';
    proteinVal.textContent = '—';
    carbsVal.textContent   = '—';
    fatVal.textContent     = '—';
    return;
  }

  const { targetKcal } = calcTDEE(profile);
  const macros = calcMacros(targetKcal, profile.weight);

  // Animate number change
  animateNumber(tdeeVal, targetKcal);
  proteinVal.textContent = `${macros.protein}g`;
  carbsVal.textContent   = `${macros.carbs}g`;
  fatVal.textContent     = `${macros.fat}g`;
}

/**
 * Quick number count-up animation
 */
function animateNumber(el, target, duration = 600) {
  const start     = parseInt(el.textContent) || 0;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    el.textContent = Math.round(start + (target - start) * ease);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// Expose for other modules
window.VerdishCalc = { calcTDEE, calcMacros, readProfile, updateResultCard };