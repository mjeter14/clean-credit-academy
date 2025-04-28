// netlify/functions/mfsn-fetch-report-json.js
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Only POST allowed' };
  }

  let token;
  try {
    ({ token } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  try {
    // 1) Fetch the JSON report
    const resp = await fetch(
      'https://api.myfreescorenow.com/api/auth/3B/report.json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        // no request body is needed here unless MFSN docs say otherwise
      }
    );
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Report fetch failed: ${resp.status} ${text}`);
    }
    const report = await resp.json();

    // 2) Insert into Supabase
    const { data, error } = await supabase
      .from('credit_reports')
      .insert([{ report_data: report }]);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ inserted: data.length })
    };
  } catch (err) {
    console.error('❌ fetch-report-json error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

