const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

export default async function handler(req, res) {
  try {
    const url =
      "https://www.doctolib.de/plastische-und-asthetische-chirurgie/bremen/amir-farhang-gharagozlou/booking/new-patient?specialityId=1297&bookingFunnelSource=profile";

    console.log("Starte Fetch:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0 Safari/537.36",
      },
    });

    console.log("Fetch abgeschlossen, Status:", response.status);

    if (!response.ok) {
      throw new Error(`Fetch fehlgeschlagen mit Status ${response.status}`);
    }

    const html = await response.text();
    console.log("HTML-Länge:", html.length);

    const cheerio = await import("cheerio");
    const $ = cheerio.load(html);

    let nextAppointment = null;
    $("time").each((i, el) => {
      const date = $(el).attr("datetime");
      console.log("Gefundenes Datum:", date);
      if (date) {
        nextAppointment = date;
        return false; // Stoppe nach erstem Termin
      }
    });

    res.status(200).json({
      ok: true,
      nextAppointment,
      link: url,
      scrapedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fehler im Scraper:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}
