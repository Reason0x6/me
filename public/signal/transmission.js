(() => {
  'use strict';
  const storageKey = 'reason6.transmissions';
  let progress = [];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) progress = saved.filter(n => Number.isInteger(n) && n >= 1 && n <= 6);
    if (localStorage.getItem('reason6.signal.acknowledged') === '006') progress.push(1);
  } catch { /* Solving also works without persistent storage. */ }
  const paint = () => {
    const el = document.querySelector('.progress');
    el.replaceChildren(...Array.from({length: 6}, (_, i) => {
      const mark = document.createElement('i');
      mark.classList.toggle('lit', progress.includes(i + 1));
      mark.setAttribute('aria-hidden', 'true');
      return mark;
    }));
    el.setAttribute('aria-label', new Set(progress).size + ' of 6 transmissions received');
  };
  const receive = n => {
    if (n >= 1 && n <= 6) {
      progress = [...new Set([...progress, n])];
      try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch { /* Optional persistence. */ }
    }
    paint();
  };
  receive(Number(document.body.dataset.received));
  const slider = document.querySelector('#alignment');
  if (slider) slider.addEventListener('input', () => {
    const offset = 1 - Number(slider.value) / 100;
    document.querySelector('.moving-plate').style.transform = 'translate(' + offset * 40 + 'px,' + offset * 12 + 'px)';
    document.querySelector('.text-equivalent').hidden = Number(slider.value) !== 100;
    document.querySelector('#alignment-status').textContent = offset === 0 ? 'Witnesses aligned. Read the inscription, or its text equivalent.' : 'Two incomplete plates. One inscription.';
  });
  const routeForm = document.querySelector('.route-form');
  if (routeForm) routeForm.addEventListener('submit', async event => {
    event.preventDefault();
    const status = document.querySelector('#route-status');
    const button = routeForm.querySelector('button');
    const raw = routeForm.elements.namedItem('destination').value.trim().toLowerCase();
    const slug = raw.replace(/^\/signal\//, '').replace(/\/$/, '');
    if (!/^[a-z0-9]{3,32}$/.test(slug)) {
      status.textContent = 'Use the recovered name or /signal/name/ path.';
      return;
    }
    status.textContent = 'Following the trace…';
    button.disabled = true;
    try {
      const url = '/signal/' + slug + '/';
      const response = await fetch(url);
      const documentAtPath = new DOMParser().parseFromString(await response.text(), 'text/html');
      if (!response.ok || documentAtPath.querySelector('meta[name="transmission"]')?.content !== routeForm.dataset.next) {
        status.textContent = 'No signal at that destination. Look again.';
        return;
      }
      location.assign(url);
    } catch {
      status.textContent = 'The signal could not be reached. Try again.';
    } finally { button.disabled = false; }
  });
  const decryptForm = document.querySelector('#decrypt-form');
  if (decryptForm) {
    let artifactUrl;
    decryptForm.addEventListener('submit', async event => {
      event.preventDefault();
      const status = document.querySelector('#decrypt-status');
      const button = decryptForm.querySelector('button');
      const words = decryptForm.elements.namedItem('fragments').value.trim().toUpperCase().split(/\s+/);
      if (words.length !== 6 || words.some(word => !/^[A-Z]+$/.test(word))) {
        status.textContent = 'Six fragments, in numbered order. One space between words.';
        return;
      }
      if (!globalThis.crypto?.subtle) {
        status.textContent = 'Browser decryption needs HTTPS or localhost. You can download the envelope to decrypt offline.';
        return;
      }
      status.textContent = 'Testing the key…';
      button.disabled = true;
      try {
        const response = await fetch('envelope.json');
        if (!response.ok) throw new Error('envelope unavailable');
        const envelope = await response.json();
        const bytes = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));
        const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(words.join(' ')));
        const key = await crypto.subtle.importKey('raw', hash, {name:'AES-GCM'}, false, ['decrypt']);
        let plaintext;
        try {
          plaintext = await crypto.subtle.decrypt({name:'AES-GCM', iv:bytes(envelope.iv)}, key, bytes(envelope.ciphertext));
        } catch {
          status.textContent = 'The key does not fit. Check each fragment and its order.';
          return;
        }
        const payload = JSON.parse(new TextDecoder().decode(plaintext));
        if (artifactUrl) URL.revokeObjectURL(artifactUrl);
        artifactUrl = URL.createObjectURL(new Blob([payload.artifact], {type:'image/svg+xml'}));
        document.querySelector('#final-artifact').href = artifactUrl;
        document.querySelector('#unsealed h2').textContent = payload.message;
        document.querySelector('#unsealed h2').style.whiteSpace = 'pre-line';
        document.querySelector('#unsealed').hidden = false;
        status.textContent = 'Signal acknowledged. All six marks received.';
        receive(6);
        document.querySelector('#unsealed').scrollIntoView({block:'start'});
      } catch {
        status.textContent = 'The encrypted transmission could not be read. Try again or download the envelope.';
      } finally { button.disabled = false; }
    });
  }
})();
