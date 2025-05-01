// netlify/functions/_mfsn.js

// ───────────────────────────────────────────────────────────
// Trick Netlify’s bundler into packaging node-fetch
// ───────────────────────────────────────────────────────────
if (false) {
  // this will never run, but ensures node-fetch ends up
  // in the zip so dynamic import() works at runtime
  require('node-fetch');
}

// pull in FormData for multipart bodies
const FormData = require('form-data');

// Point this at MFSN’s auth root
const BASE = 'https://api.myfreescorenow.com/api/auth';

/**
 * callMFSN(path, token, extra)
 *
 * @param {string} path    — e.g. "login" or "3B/report.json"
 * @param {string} token   — affiliate JWT (omit for login)
 * @param {object} extra   — additional form fields (username, password, member_id, etc)
 *
 * @returns {Promise<any>} — the `data` payload from the MFSN response
 */
async function callMFSN(path, token, extra = {}) {
  // dynamic import of the ESM-only node-fetch
  const fetch = (await import('node-fetch')).default;

  // build a multipart/form-data body
  const fd = new FormData();
  if (process.env.MFSN_SPONSOR_CODE) fd.append('sponsorCode', process.env.MFSN_SPONSOR_CODE);
  if (process.env.MFSN_AID)          fd.append('aid',          process.env.MFSN_AID);
  if (process.env.MFSN_PID)          fd.append('pid',          process.env.MFSN_PID);

  // append any extra fields (email/password or member_id)
  for (const [k, v] of Object.entries(extra)) {
    fd.append(k, v == null ? '' : v.toString());
  }

  // do the POST
  const res = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
      // note: we DO NOT set Content-Type here; form-data will do it for us
    },
    body: fd
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON from MFSN (${path}): ${text}`);
  }

  if (!json.success) {
    throw new Error(json.error || `MFSN ${path} failed`);
  }

  return json.data;
}

module.exports = { callMFSN };



