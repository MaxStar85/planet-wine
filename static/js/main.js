// ── AUTO-UPDATE ───────────────────────────────────────────────────────────────
fetch("/planet-wine/version.json?t=" + Date.now())
  .then(r => r.json())
  .then(data => {
    const saved = localStorage.getItem("pw_version");
    if (saved && saved !== data.v) {
      localStorage.setItem("pw_version", data.v);
      caches.keys().then(keys =>
        Promise.all(keys.map(k => caches.delete(k)))
      ).then(() => location.reload());
    } else {
      localStorage.setItem("pw_version", data.v);
    }
  })
  .catch(() => {});

// ── CARRELLO (localStorage) ──────────────────────────────────────────────────
function getCarrello() {
  return JSON.parse(localStorage.getItem("carrello") || "[]");
}

function setCarrello(c) {
  localStorage.setItem("carrello", JSON.stringify(c));
  aggiornaBadge();
}

function aggiornaBadge() {
  const c = getCarrello();
  document.querySelectorAll(".carrello-btn .badge").forEach(b => {
    b.textContent = c.length;
  });
}

function aggiungiVino(
  codice,
  nome,
  cantina,
  tipo,
  prezzo,
  cap,
  area = "",
  uvaggio = "",
  millesimo = "",
  mesi = "",
  bio = "",
  newFlag = "",
  anfora = "",
  tripleA = "",
  astucciato = "",
  cassaLegno = "",
  sentore1 = "",
  sentore2 = "",
  sentore3 = ""
) {
  const c = getCarrello();
  const giaPresente = c.find(v => v.codice === codice);

  if (giaPresente) {
    const nuovo = c.filter(v => v.codice !== codice);
    setCarrello(nuovo);

    const btn = document.querySelector(`[data-codice="${codice}"]`);
    if (btn) {
      btn.classList.remove("aggiunto");
      btn.textContent = "+";
    }
    return;
  }

  c.push({
    codice,
    nome,
    cantina,
    tipo,
    prezzo,
    cap,
    area,
    uvaggio,
    millesimo,
    mesi,
    bio,
    new: newFlag,
    anfora,
    tripleA,
    astucciato,
    cassaLegno,
    s1: sentore1,
    s2: sentore2,
    s3: sentore3
  });

  setCarrello(c);

  const btn = document.querySelector(`[data-codice="${codice}"]`);
  if (btn) {
    btn.classList.add("aggiunto");
    btn.textContent = "✓";
  }
}

function rimuoviVino(codice) {
  setCarrello(getCarrello().filter(v => v.codice !== codice));
}

function svuotaCarrello() {
  setCarrello([]);
}

// ── TRANSIZIONI PAGINA ───────────────────────────────────────────────────────
function preloadImages(urls) {
  return Promise.all(urls.map(url => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = url;
    });
  }));
}

function showPage() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add("page-ready");
    });
  });
}

function navigateTo(url) {
  document.body.classList.remove("page-ready");
  document.body.style.opacity = "0";
  setTimeout(() => {
    window.location.href = url;
  }, 350);
}

function goBack() {
  document.body.classList.remove("page-ready");
  document.body.style.opacity = "0";
  setTimeout(() => {
    history.back();
  }, 350);
}

function ensureModalHost() {
  if (document.getElementById("pw-modal-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "pw-modal-overlay";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(44, 40, 37, 0.28);
    display: none;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.18s ease;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  `;

  overlay.innerHTML = `
    <div id="pw-modal-box" style="
      width: min(92vw, 520px);
      background: linear-gradient(180deg, #FBF8F2 0%, #F4EEE4 100%);
      border: 1px solid rgba(200, 169, 110, 0.16);
      border-radius: 18px;
      box-shadow:
        0 18px 40px rgba(120, 98, 64, 0.16),
        0 4px 14px rgba(44, 40, 37, 0.08),
        inset 0 1px 0 rgba(255,255,255,0.72);
      padding: 26px 24px 22px;
      transform: translateY(8px);
      transition: transform 0.18s ease;
    ">
      <div id="pw-modal-title" style="
        font-family: 'Playfair Display', serif;
        font-size: clamp(1.05rem, 1.3vw, 1.35rem);
        font-weight: 600;
        color: var(--text);
        text-align: center;
        margin-bottom: 10px;
      "></div>

      <div id="pw-modal-message" style="
        font-size: clamp(0.82rem, 0.95vw, 0.98rem);
        color: var(--text-light);
        text-align: center;
        line-height: 1.5;
        white-space: pre-line;
      "></div>

      <div id="pw-modal-actions" style="
        display: flex;
        justify-content: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 22px;
      "></div>
    </div>
  `;

  document.body.appendChild(overlay);
}

function closePWModal() {
  const overlay = document.getElementById("pw-modal-overlay");
  const box = document.getElementById("pw-modal-box");
  if (!overlay || !box) return;

  overlay.style.opacity = "0";
  box.style.transform = "translateY(8px)";

  setTimeout(() => {
    overlay.style.display = "none";
  }, 180);
}

function showPWModal({
  title = "",
  message = "",
  actions = [{ label: "Chiudi", primary: true }]
} = {}) {
  ensureModalHost();

  const overlay = document.getElementById("pw-modal-overlay");
  const box = document.getElementById("pw-modal-box");
  const titleEl = document.getElementById("pw-modal-title");
  const messageEl = document.getElementById("pw-modal-message");
  const actionsEl = document.getElementById("pw-modal-actions");

  titleEl.textContent = title;
  messageEl.textContent = message;
  actionsEl.innerHTML = "";

  actions.forEach(action => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = action.label || "Ok";

    const isPrimary = !!action.primary;

    btn.style.cssText = isPrimary
      ? `
        background:
          linear-gradient(rgba(70, 52, 44, 0.18), rgba(70, 52, 44, 0.18)),
          url("/planet-wine/static/img/btn_acquarello.png") center/118% auto no-repeat;
        color: white;
        border: 1px solid rgba(255,255,255,0.10);
        border-radius: 999px;
        padding: 11px 24px;
        font-size: 0.92rem;
        font-weight: 500;
        cursor: pointer;
        letter-spacing: 0.04em;
        box-shadow:
          0 10px 22px rgba(101, 92, 86, 0.22),
          0 2px 8px rgba(44, 40, 37, 0.05),
          inset 0 1px 0 rgba(255,255,255,0.14);
      `
      : `
        background: rgba(255, 252, 246, 0.6);
        color: var(--text-light);
        border: 1px solid var(--gray-light);
        border-radius: 999px;
        padding: 11px 22px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        letter-spacing: 0.04em;
        box-shadow: 0 2px 8px rgba(44, 40, 37, 0.06);
      `;

    btn.addEventListener("click", async () => {
      closePWModal();
      if (typeof action.onClick === "function") {
        await action.onClick();
      }
    });

    actionsEl.appendChild(btn);
  });

  overlay.style.display = "flex";

  requestAnimationFrame(() => {
    overlay.style.opacity = "1";
    box.style.transform = "translateY(0)";
  });
}

// ── INIT ─────────────────────────────────────────────────────────────────────
window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
    document.body.style.opacity = "0";
    showPage();
    aggiornaBadge();
  }
  fixCarrelloHeight();
  fixHomeHeight();
});

function fixCarrelloHeight() {
  const page = document.querySelector(".page-carrello");
  if (!page) return;
  const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  page.style.height = h + "px";
}

function fixHomeHeight() {
  const page = document.querySelector(".home-page");
  if (!page) return;
  const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  page.style.height = h + "px";
}

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", fixCarrelloHeight);
  window.visualViewport.addEventListener("resize", fixHomeHeight);
}

document.addEventListener("DOMContentLoaded", () => {
  aggiornaBadge();

  getCarrello().forEach(v => {
    const btn = document.querySelector(`[data-codice="${v.codice}"]`);
    if (btn) {
      btn.classList.add("aggiunto");
      btn.textContent = "✓";
    }
  });

  // Fade-in automatico solo se la pagina non ha data-wait
  if (!document.body.hasAttribute("data-wait")) {
    showPage();
  }

  // Intercetta TUTTI i link interni (anche dinamici)
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;
    if (!link.href) return;
    if (!link.href.startsWith(window.location.origin)) return;
    if (link.target === "_blank") return;

    e.preventDefault();
    navigateTo(link.href);
  });
});

// ── PROPOSTE SALVATE ──────────────────────────────────────────────────────────
const PROPOSTE_KEY = "proposte_salvate";
const PROPOSTE_MAX = 200;

function getProposteSalvate() {
  try {
    return JSON.parse(localStorage.getItem(PROPOSTE_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function salvaPropostaSnapshot(cliente, sconto, vini) {
  if (!cliente || !vini || vini.length === 0) return;

  let proposte = getProposteSalvate();

  const idx = proposte.findIndex(
    p => p.cliente.trim().toLowerCase() === cliente.trim().toLowerCase()
  );

  const snapshot = {
    cliente: cliente.trim(),
    sconto: sconto || 0,
    vini: vini,
    data: new Date().toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }),
    timestamp: Date.now()
  };

  if (idx !== -1) {
    proposte[idx] = snapshot;
  } else {
    proposte.unshift(snapshot);
    if (proposte.length > PROPOSTE_MAX) {
      proposte = proposte.slice(0, PROPOSTE_MAX);
    }
  }

  proposte.sort((a, b) => b.timestamp - a.timestamp);

  localStorage.setItem(PROPOSTE_KEY, JSON.stringify(proposte));
}

// ── FILTRO PREZZO ─────────────────────────────────────────────────────────────
const FILTRO_KEY = "planetwine_filtro_prezzo";

function getFiltro() {
  try {
    return JSON.parse(sessionStorage.getItem(FILTRO_KEY) || "null");
  } catch (e) {
    return null;
  }
}

function setFiltro(min, max) {
  sessionStorage.setItem(FILTRO_KEY, JSON.stringify({ min, max }));
}

function clearFiltro() {
  sessionStorage.removeItem(FILTRO_KEY);
}

function filtroPrezzoParams() {
  const f = getFiltro();
  if (!f) return "";
  const parts = [];
  if (f.min !== null && f.min !== "") parts.push(`min_prezzo=${encodeURIComponent(f.min)}`);
  if (f.max !== null && f.max !== "") parts.push(`max_prezzo=${encodeURIComponent(f.max)}`);
  return parts.length ? "&" + parts.join("&") : "";
}

function applyFiltroToLinks() {
  const params = filtroPrezzoParams();

  document.querySelectorAll("a[href]").forEach(a => {
    const url = a.getAttribute("href");
    if (!url || url === "#") return;

    const base = url.split("?")[0].split("/").pop();
    if (!["lista.html", "bivio.html", "italia.html", "mondo.html"].includes(base)) return;

    const clean = url.split("&min_prezzo")[0].split("&max_prezzo")[0];
    a.setAttribute("href", clean + params);
  });
}

function apriFiltroModal() {
  const f = getFiltro();

  showPWModal({
    title: "Filtro Prezzo",
    message: "",
    actions: []
  });

  // Sostituisce il message con un form custom
  const msgEl = document.getElementById("pw-modal-message");
  msgEl.innerHTML = `
    <div style="display:flex; gap:12px; align-items:center; justify-content:center; margin-top:8px;">
      <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
        <label style="font-size:0.78rem; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-light);">Min €</label>
        <input id="filtro-min" type="number" min="0" step="0.5" placeholder="es. 5"
          value="${f && f.min !== null ? f.min : ''}"
          style="
            width: 90px;
            padding: 9px 12px;
            border-radius: 10px;
            border: 1px solid var(--gray-light);
            background: rgba(255,252,246,0.8);
            font-size: 1rem;
            font-family: 'Inter', sans-serif;
            color: var(--text);
            text-align: center;
            outline: none;
          ">
      </div>
      <div style="font-size:1.2rem; color:var(--gray); padding-top:18px;">—</div>
      <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
        <label style="font-size:0.78rem; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-light);">Max €</label>
        <input id="filtro-max" type="number" min="0" step="0.5" placeholder="es. 50"
          value="${f && f.max !== null ? f.max : ''}"
          style="
            width: 90px;
            padding: 9px 12px;
            border-radius: 10px;
            border: 1px solid var(--gray-light);
            background: rgba(255,252,246,0.8);
            font-size: 1rem;
            font-family: 'Inter', sans-serif;
            color: var(--text);
            text-align: center;
            outline: none;
          ">
      </div>
    </div>
  `;

  const actionsEl = document.getElementById("pw-modal-actions");
  actionsEl.innerHTML = "";

  // Bottone Applica
  const btnApplica = document.createElement("button");
  btnApplica.type = "button";
  btnApplica.textContent = "Applica";
  btnApplica.style.cssText = `
    background:
      linear-gradient(rgba(70, 52, 44, 0.18), rgba(70, 52, 44, 0.18)),
      url("/planet-wine/static/img/btn_acquarello.png") center/118% auto no-repeat;
    color: white;
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 999px;
    padding: 11px 24px;
    font-size: 0.92rem;
    font-weight: 500;
    cursor: pointer;
    letter-spacing: 0.04em;
    box-shadow: 0 10px 22px rgba(101,92,86,0.22), 0 2px 8px rgba(44,40,37,0.05), inset 0 1px 0 rgba(255,255,255,0.14);
  `;
  btnApplica.addEventListener("click", () => {
    const min = document.getElementById("filtro-min").value.trim();
    const max = document.getElementById("filtro-max").value.trim();
    setFiltro(min || null, max || null);
    closePWModal();
    if (typeof aggiornaStatoFiltroUI === "function") aggiornaStatoFiltroUI();
    applyFiltroToLinks();
  });

  // Bottone Annulla
  const btnAnnulla = document.createElement("button");
  btnAnnulla.type = "button";
  btnAnnulla.textContent = "Annulla";
  btnAnnulla.style.cssText = `
    background: rgba(255,252,246,0.6);
    color: var(--text-light);
    border: 1px solid var(--gray-light);
    border-radius: 999px;
    padding: 11px 22px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    letter-spacing: 0.04em;
    box-shadow: 0 2px 8px rgba(44,40,37,0.06);
  `;
  btnAnnulla.addEventListener("click", () => closePWModal());

  actionsEl.appendChild(btnApplica);
  actionsEl.appendChild(btnAnnulla);
}
