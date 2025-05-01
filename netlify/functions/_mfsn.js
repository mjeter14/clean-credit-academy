// netlify/functions/_mfsn.js

// ────────────────────────────────────────────────────────────────────
// Trick Netlify’s bundler into packaging node-fetch
// ────────────────────────────────────────────────────────────────────
if (false) {
  require('node-fetch')
}

const FormData = require('form-data')
const BASE = 'https://api.myfreescorenow.com/api/auth'

/**
 * callMFSN(path, token, fields)
 *
 * @param {string} path    – e.g. "login" or "3B/report.json"
 * @param {?string} token  – omit for login, otherwise your affiliate JWT
 * @param {object} fields  – form fields to send (email/password or username/password/member_id)
 */
async function callMFSN(path, token, fields = {}) {
  // dynamic import of fetch for ESM-only node-fetch
  const fetch = (await import('node-fetch')).default

  // build multipart/form-data body
  const fd = new FormData()
  if (process.env.MFSN_SPONSOR_CODE) fd.append('sponsorCode', process.env.MFSN_SPONSOR_CODE)
  if (process.env.MFSN_AID)          fd.append('aid',          process.env.MFSN_AID)
  if (process.env.MFSN_PID)          fd.append('pid',          process.env.MFSN_PID)

  for (const [k, v] of Object.entries(fields)) {
    fd.append(k, v == null ? '' : String(v))
  }

  const res = await fetch(`${BASE}/${path}`, {
    method:  'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body:    fd
  })

  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`Invalid JSON from MFSN ${path}: ${text}`)
  }
  if (!json.success) {
    throw new Error(json.error || `MFSN ${path} failed`)
  }
  return json.data
}

module.exports = { callMFSN }






