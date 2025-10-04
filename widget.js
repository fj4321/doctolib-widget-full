// Simple embeddable widget script (include via <script src=".../widget.js"></script>)
// It will look for a container with id "doctolib-widget" or create one where the script is placed.
(function(){
  const BASE = (function(){
    // derive base from current script src
    try{
      const scripts = document.getElementsByTagName('script');
      const me = scripts[scripts.length-1].src;
      return me.replace(/\/widget\.js(\?.*)?$/, '');
    }catch(e){ return ''; }
  })();

  const ENDPOINT = BASE + '/api/termine';

  function createContainer(){
    let c = document.getElementById('doctolib-widget');
    if (!c) {
      c = document.createElement('div');
      c.id = 'doctolib-widget';
      // insert where the script tag is
      const scripts = document.getElementsByTagName('script');
      const me = scripts[scripts.length-1];
      me.parentNode.insertBefore(c, me);
    }
    return c;
  }

  async function render(){
    const container = createContainer();
    container.innerHTML = '<div style="padding:20px; text-align:center;">Lade Termine...</div>';

    try {
      const res = await fetch(ENDPOINT, { cache: 'no-store' });
      if (!res.ok) throw new Error('Fehler beim Laden');
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Keine Daten');

      const next = data.nextAppointment ? (new Date(data.nextAppointment)).toLocaleString() : 'Keine freien Termine gefunden';
      const html = `
        <div style="max-width:420px;margin:10px auto;padding:18px;border-radius:10px;border:1px solid #e6e6e6;box-shadow:0 2px 8px rgba(0,0,0,0.04);font-family:Arial, sans-serif;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:16px;font-weight:600;color:#222;">Termine - Dr. Amir F. Gharagozlou</div>
              <div style="font-size:13px;color:#666;margin-top:6px;">Nächster freier Termin</div>
              <div style="font-size:15px;font-weight:700;margin-top:6px;color:#111;">${next}</div>
            </div>
          </div>
          <div style="margin-top:14px;text-align:center;">
            <a href="${data.link}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
              <button style="padding:10px 16px;border-radius:8px;border:none;background:#0077cc;color:#fff;font-weight:600;cursor:pointer;">
                Jetzt bei Doctolib buchen
              </button>
            </a>
          </div>
          <div style="margin-top:10px;font-size:11px;color:#999;text-align:center;">Aktualisiert: ${new Date(data.scrapedAt).toLocaleString()}</div>
        </div>`;
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = '<div style="padding:20px;color:#900;text-align:center;">Termine konnten nicht geladen werden.</div>';
      console.error('Doctolib widget error', err);
    }
  }

  render();
  // Auto-refresh every 2 minutes
  setInterval(render, 120000);
})();