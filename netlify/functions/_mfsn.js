// netlify/functions/_mfsn.js
const fetch = require('node-fetch');

const BASE = 'https://api.myfreescorenow.com';

async function callMFSN(path, token, extra = {}) {
  // Always include the affiliate context
  const body = {
    sponsorCode: process.env.MFSN_SPONSOR_CODE,
    aid:         process.env.MFSN_AID,
    pid:         process.env.MFSN_PID,
    ...extra
  };

  const res = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON from MFSN: ${text}`);
  }

  if (!json.success) {
    throw new Error(json.error || `MFSN ${path} failed`);
  }

  return json.data;
}

module.exports = { callMFSN };
