// netlify/functions/_mfsn.js
const fetch = require('node-fetch');

async function callMFSN(path, token, body) {
  const url = `https://api.myfreescorenow.com${path}`;
  const opts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(body)
  };
  const res = await fetch(url, opts);
  const text = await res.text();
  if (!res.ok) throw new Error(`MFSN ${path} failed ${res.status}: ${text}`);
  return JSON.parse(text);
}

module.exports = { callMFSN };
