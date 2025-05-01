// netlify/functions/mfsn-fetch-report-json.js
const FormData = require('form-data');
const { createClient } = require('@supabase/supabase-js');

// ESM‐friendly shim for node‐fetch@3
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const supabase = createClient(
  process.env.SUPABASE_URL,          // your private Supabase URL
  process.env.SUPABASE_SERVICE_KEY   // your service_role key
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Only POST allowed' };
  }

  let token, username, password, userId;
  try {
    ({ token, username, password, userId } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  if (!token || !username || !password || !userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing token, username, password or userId' })
    };
  }

  console.log('➡️  Fetching 3B report for', username, '→ user_id:', userId);

  // Build the multipart/form-data body for MFSN
  const fd = new FormData();
  fd.append('username', username);
  fd.append('password', password);

  try {
    // 1) Call the 3-bureau JSON endpoint
    const apiResp = await fetch(
      'https://api.myfreescorenow.com/api/auth/3B/report.json',
      {
        method : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body   : fd
      }
    );

    const text = await apiResp.text();
    console.log(`⬇️  MFSN response ${apiResp.status}:`, text.slice(0,200), '…');

    if (!apiResp.ok) {
      throw new Error(`Report fetch failed: ${apiResp.status} ${text}`);
    }

    const report = JSON.parse(text);

    // 2) Persist into `credit_reports`
    //    only user_id, imported_at and report_data are required;
    //    you can extract scores into separate columns if desired.
    const { error } = await supabase
      .from('credit_reports')
      .insert([{
        user_id:     userId,
        imported_at: new Date().toISOString(),
        report_data: report
      }]);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ inserted: 1 })
    };
  } catch (err) {
    console.error('mfsn-fetch-report-json error', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};




