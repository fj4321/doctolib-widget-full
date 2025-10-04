const cheerio = require('cheerio');

// Simple in-memory cache to avoid frequent scraping
let cache = {
  ts: 0,
  data: null
};

module.exports = async (req, res) => {
  const PRACTICE_URL = "https://www.doctolib.de/plastische-und-asthetische-chirurgie/bremen/amir-farhang-gharagozlou";
  const CACHE_TTL_MS = 60 * 1000; // cache for 60 seconds

  try {
    const now = Date.now();
    if (cache.data && (now - cache.ts) < CACHE_TTL_MS) {
      res.setHeader("Content-Type", "application/json");
      return res.status(200).send(cache.data);
    }

    // Use global fetch (Node 18+ / Vercel environment)
    const response = await fetch(PRACTICE_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DoctolibWidget/1.0; +https://sbs-bremen.de)"
      }
    });

    if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    const html = await response.text();

    // Load into cheerio
    const $ = cheerio.load(html);

    // Heuristics to find available datetimes
    const candidates = [];

    // 1) <time datetime="...">
    $('time[datetime]').each((i, el) => {
      const dt = $(el).attr('datetime');
      if (dt) candidates.push(dt);
    });

    // 2) JSON-LD scripts
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const txt = $(el).contents().text();
        if (!txt) return;
        const j = JSON.parse(txt);
        const findDates = (obj) => {
          if (!obj) return;
          if (typeof obj === 'string') {
            // ISO datetime in string?
            const iso = obj.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
            if (iso) candidates.push(iso[0]);
          } else if (Array.isArray(obj)) {
            obj.forEach(findDates);
          } else if (typeof obj === 'object') {
            Object.values(obj).forEach(findDates);
          }
        };
        findDates(j);
      } catch (e) {
        // ignore JSON parse errors
      }
    });

    // 3) Regex over HTML for ISO datetimes
    const isoRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g;
    let m;
    while ((m = isoRegex.exec(html)) !== null) {
      candidates.push(m[0]);
    }

    // Normalize and pick next future date
    const nowISO = new Date();
    const parsed = candidates
      .map(s => {
        // ensure seconds exist
        let t = s;
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) t = s + ":00";
        return new Date(t);
      })
      .filter(d => d.toString() !== 'Invalid Date')
      .filter(d => d > nowISO)
      .sort((a,b) => a - b);

    let nextAppointment = null;
    if (parsed.length > 0) {
      nextAppointment = parsed[0].toISOString();
    }

    const result = {
      ok: true,
      nextAppointment,
      link: PRACTICE_URL,
      scrapedAt: new Date().toISOString()
    };

    cache = { ts: Date.now(), data: JSON.stringify(result) };

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(result);
  } catch (err) {
    const errorPayload = { ok: false, error: err.message };
    res.setHeader("Content-Type", "application/json");
    return res.status(500).send(errorPayload);
  }
};
