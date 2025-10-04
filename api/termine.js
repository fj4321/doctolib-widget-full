import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'cache', 'termine.json');

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(data);
    res.status(200).json(json);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
