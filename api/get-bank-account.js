import { getBankAccountByPhone } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const phone = (url.searchParams.get('phone') || '').trim();

    if (!phone) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'phone query parameter is required' }));
    }

    const bankAccountId = await getBankAccountByPhone(phone);

    if (!bankAccountId) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Not Found' }));
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ phone, bank_account_id: bankAccountId }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error', details: err?.message || String(err) }));
  }
}