// chat.js — Ask Nouri AI chat logic

document.addEventListener('DOMContentLoaded', () => {
  const messagesEl = document.getElementById('chat-messages');
  const inputEl    = document.getElementById('chat-input');
  const sendBtn    = document.getElementById('chat-send');

  if (!messagesEl || !inputEl || !sendBtn) return;

  // Conversation history sent to the API
  const history = [];

  // ── Auto-resize textarea ──────────────────────────────────
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + 'px';
  });

  // ── Send on Enter (Shift+Enter = newline) ─────────────────
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  // ── Core send function ────────────────────────────────────
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    // Append user message
    appendMsg('user', text);
    history.push({ role: 'user', content: text });

    // Clear input
    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;

    // Show typing indicator
    const typingEl = appendTyping();

    try {
      // Optionally inject profile context into history once
      const fullHistory = injectProfileContext(history);
      const reply = await VerdishAPI.askNouri(fullHistory); // ✅ Fixed: was NouriAPI

      typingEl.remove();
      appendMsg('nouri', reply);
      history.push({ role: 'assistant', content: reply });

    } catch (err) {
      typingEl.remove();
      appendMsg('nouri', `Sorry, I couldn't connect right now. Please try again in a moment.`);
      console.error('Nouri API error:', err);
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  // ── DOM helpers ───────────────────────────────────────────
  function appendMsg(role, text) {
    const isUser = role === 'user';
    const div = document.createElement('div');
    div.className = `msg ${isUser ? 'msg--user' : 'msg--nouri'}`;

    div.innerHTML = `
      <div class="msg-avatar">${isUser ? '✦' : 'N'}</div>
      <div class="msg-bubble">${formatText(text)}</div>
    `;

    messagesEl.appendChild(div);
    scrollToBottom();
    return div;
  }

  function appendTyping() {
    const div = document.createElement('div');
    div.className = 'msg msg--nouri';
    div.innerHTML = `
      <div class="msg-avatar">N</div>
      <div class="msg-bubble typing">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    messagesEl.appendChild(div);
    scrollToBottom();
    return div;
  }

  function scrollToBottom() {
    messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
  }

  /**
   * Convert newlines to <br> and bold **text**
   */
  function formatText(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  /**
   * Prepend a one-time system context message with the user's profile data
   * so Nouri can give personalised advice without re-asking.
   */
  function injectProfileContext(msgs) {
    if (typeof VerdishCalc === 'undefined') return msgs; // ✅ Fixed: was NouriCalc

    const profile = VerdishCalc.readProfile(); // ✅ Fixed: was NouriCalc
    if (!profile) return msgs;

    const { targetKcal } = VerdishCalc.calcTDEE(profile); // ✅ Fixed: was NouriCalc
    const macros = VerdishCalc.calcMacros(targetKcal, profile.weight); // ✅ Fixed: was NouriCalc

    const contextNote = `[User profile — use this to personalise your response:
Age ${profile.age}, ${profile.sex}, ${profile.height}cm, ${profile.weight}kg.
Activity: ${profile.activity}. Goal: ${profile.goal}.
Target: ${targetKcal} kcal/day — P${macros.protein}g C${macros.carbs}g F${macros.fat}g.
${profile.dietChips.length ? 'Diet: ' + profile.dietChips.join(', ') + '.' : ''}]`;

    // Inject as a hidden user prefix on the first message only
    const clone = [...msgs];
    if (clone.length > 0 && clone[0].role === 'user') {
      clone[0] = {
        role: 'user',
        content: `${contextNote}\n\n${clone[0].content}`,
      };
    }
    return clone;
  }

});