// api.js — API calls proxied through Flask backend (Groq)

/**
 * Generate a 7-day meal plan via Flask /api/plan route
 * @param {object} profile  from VerdishCalc.readProfile()
 * @param {number} targetKcal
 * @param {object} macros  { protein, carbs, fat }
 * @returns {Promise<Array>} array of day objects
 */
async function generateMealPlan(profile, targetKcal, macros) {
  const dietStr = profile.dietChips.length
    ? profile.dietChips.join(', ')
    : 'balanced';

  const res = await fetch('/api/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      age:        profile.age,
      weight:     profile.weight,
      height:     profile.height,
      sex:        profile.sex,
      activity:   profile.activity,
      goal:       profile.goal,
      diet:       dietStr,
      cuisine:    'any',
      targetCals: targetKcal,
      protein:    macros.protein,
      carbs:      macros.carbs,
      fat:        macros.fat,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error ${res.status}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to generate plan');

  // data.result is already a parsed JSON array from the backend
  return data.result;
}

/**
 * Send a chat message to Nouri via Flask /api/chat route
 * @param {Array} history  Array of { role, content } messages
 * @returns {Promise<string>} Nouri's reply text
 */
async function askNouri(history) {
  // Send the last user message
  const lastUserMsg = [...history].reverse().find(m => m.role === 'user');
  const message = lastUserMsg?.content ?? '';

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error ${res.status}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to get response');
  return data.result;
}

// Expose
window.VerdishAPI = { generateMealPlan, askNouri };