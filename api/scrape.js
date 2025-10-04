import fetch from 'node-fetch';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const url = "https://www.doctolib.de/plastische-und-asthetische-chirurgie/bremen/amir-farhang-gharagozlou/booking/new-patient?specialityId=1297&bookingFunnelSource=profile";

    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    let nextAppointment = null;

    // Beispiel: Suche nach Datum im HTML (angepasst je nach Struktur von Doctolib)
    $('time').each((i, el) => {
      const date = $(el).attr('datetime');
      if (date) {
        nextAppointment = date;
        return false; // erste finden → abbrechen
      }
    });

    const result = {
      ok: true,
      nextAppointment,
      link: url,
      scrapedAt: new Date().toISOString()
    };

    const cachePath = path.join(process.cwd(), 'cache', 'termine.json');
    fs.writeFileSync(cachePath, JSON.stringify(result, null, 2));

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
