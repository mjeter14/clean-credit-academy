// netlify/functions/_mfsn.js

const FormData = require('form-data');

// Point this at the “/api/auth” root
const BASE = 'https://api.myfreescorenow.com/api/auth';

/**
 * callMFSN(path, token, extra)
 *
 * @param {string} path    — e.g. "login" or "3B/report.json"
 * @param {string} token   — affiliate JWT (omit for login)
 * @param {object} extra   — additional form fields (e.g. { username, password, member_id })
 *
 * @returns {Promise<any>} — the `data` payload from the MFSN response
 */
async function callMFSN(path, token, extra = {}) {
  // dynamic import to work around node-fetch ESM requirement
  const fetch = (await import('node-fetch')).default;

  // build form-data body
  const fd = new FormData();
  // always include sponsorCode, AID, PID
  if (process.env.MFSN_SPONSOR_CODE) fd.append('sponsorCode', process.env.MFSN_SPONSOR_CODE);
  if (process.env.MFSN_AID)          fd.append('aid',          process.env.MFSN_AID);
  if (process.env.MFSN_PID)          fd.append('pid',          process.env.MFSN_PID);

  // append any extra fields
  for (const [key, value] of Object.entries(extra)) {
    fd.append(key, value == null ? '' : value.toString());
  }

  // make the POST
  const res = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    headers: {
      // the form-data lib will set Content-Type and boundary for us
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: fd
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error(`Invalid JSON from MFSN (${path}): ${text}`);
  }

  if (!json.success) {
    throw new Error(json.error || `MFSN ${path} failed`);
  }

  return json.data;
}

module.exports = { callMFSN };

