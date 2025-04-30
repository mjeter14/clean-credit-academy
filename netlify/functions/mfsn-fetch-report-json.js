// netlify/functions/mfsn-fetch-report-json.js
// -------------------------------------------
const FormData = require('form-data');
const { createClient } = require('@supabase/supabase-js');

// ESM-aware shim for node-fetch v3
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const supabase = createClient(
  process.env.SUPABASE_URL,          // private URL
  process.env.SUPABASE_SERVICE_KEY   // service key (full-access)
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST')
    return { statusCode: 405, body: 'Only POST allowed' };

  let token, username, password;
  try { ({ token, username, password } = JSON.parse(event.body)); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  console.log('➡️  Fetching 3B report for', username);

  // multipart/form-data as required by MFSN
  const fd = new FormData();
  fd.append('username', username);
  fd.append('password', password);

  try {
    const res  = await fetch(
      'https://api.myfreescorenow.com/api/auth/3B/report.json',
      {
        method : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body   : fd
      }
    );

    const text = await res.text();
    console.log(`⬇️  Response ${res.status}: ${text.slice(0,200)}…`);

    if (!res.ok)
      throw new Error(`Report fetch failed: ${res.status} ${text}`);

    const report = JSON.parse(text);

    // insert into Supabase
    const { error } = await supabase
      .from('credit_reports')
      .insert([{ email: username, report_data: report }]);  // email now provided

    if (error) throw error;

    return { statusCode: 200, body: JSON.stringify({ inserted: 1 }) };
  } catch (err) {
    console.error('mfsn-fetch-report-json error', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};



