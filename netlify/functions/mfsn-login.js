// netlify/functions/mfsn-login.js
// -------------------------------
const FormData   = require('form-data');
const { createClient } = require('@supabase/supabase-js');

// ESM-aware shim for node-fetch v3
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST')
    return { statusCode: 405, body: 'Only POST allowed' };

  let email, password;
  try { ({ email, password } = JSON.parse(event.body)); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  // build multipart/form-data required by MFSN
  const fd = new FormData();
  fd.append('email',    email);
  fd.append('password', password);

  try {
    const res  = await fetch(
      'https://api.myfreescorenow.com/api/auth/login',
      { method: 'POST', body: fd }
    );
    const text = await res.text();
    if (!res.ok) throw new Error(`Login failed: ${res.status} ${text}`);

    const json = JSON.parse(text);
    return { statusCode: 200, body: JSON.stringify(json.data) };
  } catch (err) {
    console.error('mfsn-login error', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

