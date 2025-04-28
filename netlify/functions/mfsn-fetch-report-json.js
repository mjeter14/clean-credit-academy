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

  let token, username, password;
  try {
    ({ token, username, password } = JSON.parse(event.body));
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  console.log('➡️  Fetching 3B report for', username);

  try {
    const resp = await fetch(
      'https://api.myfreescorenow.com/api/auth/3B/report.json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, password })
      }
    );

    const text = await resp.text();
    console.log(`⬇️  Response ${resp.status}:`, text);

    if (!resp.ok) {
      throw new Error(`Report fetch failed: ${resp.status} ${text}`);
    }

    const report = JSON.parse(text);

    // store in Supabase
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
