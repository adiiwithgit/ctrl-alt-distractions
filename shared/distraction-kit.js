/**
 * DistractionKit — shared helper for every distraction mini-game.
 * Each game include this + styles.css and calls:
 *   DistractionKit.startTimer(el)   -> starts the visible countdown bar
 *   DistractionKit.finish('pass'|'fail')  -> reports result to parent overlay
 *   DistractionKit.setOnTimeout(fn) -> optional: run custom logic when time runs out
 */
(function () {
  const params = new URLSearchParams(window.location.search);
  const DEFAULT_DURATION = 150; // seconds (2.5 min) — overlay passes real value via ?duration=
  const duration = parseInt(params.get('duration'), 10) || DEFAULT_DURATION;

  let startTime = Date.now();
  let finished = false;
  let timerInterval = null;
  let onTimeoutFn = null;

  function finish(status) {
    if (finished) return;
    finished = true;
    if (timerInterval) clearInterval(timerInterval);
    const timeTakenMs = Date.now() - startTime;
    try {
      window.parent.postMessage({ type: 'DISTRACTION_RESULT', status, timeTakenMs }, '*');
    } catch (e) {
      console.error('DistractionKit: postMessage failed', e);
    }
  }

  function startTimer(barFillEl, textEl) {
    let remaining = duration;
    render();
    timerInterval = setInterval(() => {
      remaining -= 1;
      render();
      if (remaining <= 0) {
        clearInterval(timerInterval);
        if (typeof onTimeoutFn === 'function') onTimeoutFn();
        finish('fail');
      }
    }, 1000);

    function render() {
      if (barFillEl) barFillEl.style.width = Math.max(0, (remaining / duration) * 100) + '%';
      if (textEl) textEl.textContent = Math.max(0, remaining) + 's left';
    }
  }

  window.DistractionKit = {
    duration,
    finish,
    startTimer,
    setOnTimeout: (fn) => { onTimeoutFn = fn; },
  };
})();
