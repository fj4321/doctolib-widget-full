import fetch from 'node-fetch';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const url = "https://www.doctolib.de/plastische-und-asthetische-chirurgie/bremen/amir-farhang-gharagozlou/booking/new-patient?specialityId=1297&bookingFunnelSource=profile";

    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    let nextAppointment = null;

    // Prüft, ob ein Datum im HTML vorhanden ist
    $('time').each((i, el) => {
      const date = $(el).attr('datetime');
      if (date) {
        nextAppointment = date;
        return false; // Stop bei erstem Treffer
      }
    });

    const result = {
      ok: true,
      nextAppointment,
      link: url,
      scrapedAt: new Date().toISOString()
    };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
