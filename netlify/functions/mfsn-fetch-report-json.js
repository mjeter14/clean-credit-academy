// netlify/functions/mfsn-fetch-report-json.js
const fetch     = require('node-fetch');
const FormData  = require('form-data');
const { createClient } = require('@supabase/supabase-js');

/**
 * Supabase: use your private (server-side) URL + service key
 * Make sure these two env-vars are set in Netlify:
 *   SUPABASE_URL           https://<project>.supabase.co
 *   SUPABASE_SERVICE_KEY   <service_role_key>
 */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Only POST allowed' };
  }

  let token, username, password;
  try {
    ({ token, username, password } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // ── Build multipart/form-data body for MFSN API ──────────────
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

    const raw = await apiResp.text();
    if (!apiResp.ok) {
      throw new Error(`Report fetch failed: ${apiResp.status} ${raw}`);
    }

    const report = JSON.parse(raw);

    // 2) Persist in Supabase (include member email so NOT-NULL passes)
    const { error } = await supabase
      .from('credit_reports')
      .insert([{
        email:       username,   // <= satisfies NOT NULL constraint
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


