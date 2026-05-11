/* =============================================================================
   PLANETWINE IPAD OFFLINE — DATA ENGINE
============================================================================= */

const DataEngine = (() => {

  const AREE_ITALIA = [
    "Trentino", "Alto Adige", "Piemonte", "Valle d'Aosta", "Lombardia",
    "Veneto", "Friuli-Venezia Giulia", "Liguria", "Emilia-Romagna",
    "Toscana", "Umbria", "Marche", "Lazio", "Abruzzo", "Molise",
    "Campania", "Basilicata", "Puglia", "Calabria", "Sicilia", "Sardegna"
  ];

  const PAESI_MONDO = [
    "Francia", "Spagna", "Portogallo",
    "Austria", "Germania", "Libano"
  ];

  const cache = {};

  function normalizzaMillesimo(val) {
    if (!val) return "";
    const n = parseFloat(String(val).replace(",", "."));
    if (!isNaN(n) && Number.isInteger(n)) {
      return String(n);
    }
    return String(val).trim();
  }

function prezzoConfronto(vino) {
    if (typeof vino.prezzo !== "number") return null;
    if (vino.prezzo_cassa === true) {
      return +(vino.prezzo / 6).toFixed(2);
    }
    return vino.prezzo;
  }

  function prezzoOk(vino, filtro) {
    if (!filtro || (filtro.min === null && filtro.max === null)) return true;
    const p = prezzoConfronto(vino);
    if (p === null) return true;
    const minVal = filtro.min !== null ? parseFloat(filtro.min) : null;
    const maxVal = filtro.max !== null ? parseFloat(filtro.max) : null;
    if (minVal !== null && p < minVal) return false;
    if (maxVal !== null && p > maxVal) return false;
    return true;
  }

  function tipiValidi(tipo) {

    if (tipo === "Spumante") {
      return ["Spumante", "Spumante Rosé"];
    }

    if (tipo === "Champagne") {
      return ["Champagne", "Champagne Rosé"];
    }

    if (tipo === "Vino Rosato") {
      return ["Vino Rosato", "Rosato", "Vino Rosé", "Rosé"];
    }

    if (tipo === "Vino Dolce/Passito") {
      return ["Vino Dolce/Passito", "Vino Dolce"];
    }

    return [tipo];
  }

  async function loadItalia(area) {

    if (cache[area]) return cache[area];

    try {

      const FILE_MAP = {
        "Valle d'Aosta":        "ValleDAosta",
        "Friuli-Venezia Giulia": "FriuliVeneziaGiulia",
        "Emilia-Romagna":        "EmiliaRomagna",
        "Alto Adige":            "AltoAdige"
      };

      const fileName = FILE_MAP[area] ||
        area.replace(/ /g, "")
            .replace(/'/g, "")
            .replace(/-/g, "");

      const response =
        await fetch(`/planet-wine/data/json/${fileName}.json`);

      if (!response.ok) {
        cache[area] = [];
        return [];
      }

      const data = await response.json();

      cache[area] =
        data
          .filter(v => v.attivo !== false)
          .map(v => ({
            ...v,
            millesimo: normalizzaMillesimo(v.millesimo)
          }));

      return cache[area];

    } catch (e) {

      cache[area] = [];
      return [];
    }
  }

async function loadRestoDelMondo() {

    try {

      const response =
        await fetch(`/planet-wine/data/json/RestoDelMondo.json`);

      if (!response.ok) {
        cache["RestoDelMondo"] = [];
        return [];
      }

      const data = await response.json();

      cache["RestoDelMondo"] =
        data
          .filter(v => v.attivo !== false)
          .map(v => ({
            ...v,
            millesimo: normalizzaMillesimo(v.millesimo)
          }));

      return cache["RestoDelMondo"];

    } catch (e) {

      cache["RestoDelMondo"] = [];
      return [];
    }
  }

async function calcolaDisponibilita(tipo, filtro) {

    const risultato = {};

    const validi = tipiValidi(tipo);

    for (const area of AREE_ITALIA) {

      const vini = await loadItalia(area);

      risultato[area] =
        vini.some(v => validi.includes(v.tipo) && prezzoOk(v, filtro));
    }

    const viniMondo =
      await loadRestoDelMondo();

    risultato["RestoDelMondo"] =
      viniMondo.some(v => validi.includes(v.tipo) && prezzoOk(v, filtro));

    return risultato;
  }

async function disponibilitaPerPaese(tipo, filtro) {

    const validi = tipiValidi(tipo);
    const viniMondo =
      await loadRestoDelMondo();

    const risultato = {};

    for (const paese of PAESI_MONDO) {

      risultato[paese] =
        viniMondo.some(v =>
          v.paese === paese &&
          validi.includes(v.tipo) &&
          prezzoOk(v, filtro)
        );
    }

    return risultato;
  }

  async function loadJSON(fileName) {
    if (cache[fileName]) return cache[fileName];
    try {
      const response = await fetch(`/planet-wine/data/json/${fileName}.json`);
      if (!response.ok) { cache[fileName] = []; return []; }
      const data = await response.json();
      cache[fileName] = data
        .filter(v => v.attivo !== false)
        .map(v => ({ ...v, millesimo: normalizzaMillesimo(v.millesimo) }));
      return cache[fileName];
    } catch (e) {
      cache[fileName] = [];
      return [];
    }
  }

  async function getLista(area, tipo) {

    const AREE_ITALIA_SET = new Set(AREE_ITALIA);

    let vini;

    if (area === "Champagne") {
      vini = await loadJSON("Champagne");
    } else if (area === "Analcolici") {
      vini = await loadJSON("Analcolici");
    } else if (AREE_ITALIA_SET.has(area)) {
      vini = await loadItalia(area);
    } else {
      vini = await loadRestoDelMondo();
      vini = vini.filter(v => v.paese === area || v.area === area);
    }

    if (tipo && area !== "Analcolici") {
      const validi = tipiValidi(tipo);
      vini = vini.filter(v => validi.includes(v.tipo));
    }

    return vini;
  }

return {
    calcolaDisponibilita,
    disponibilitaPerPaese,
    getLista,
    prezzoOk,
    AREE_ITALIA,
    PAESI_MONDO
  };

})();
