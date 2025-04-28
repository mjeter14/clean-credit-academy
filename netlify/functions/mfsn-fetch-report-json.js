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

  let token, memberId;
  try {
    ({ token, memberId } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // Debug: show what env vars we’re using
  console.log('ENV VARS:', {
    sponsorCode: process.env.MFSN_SPONSOR_CODE,
    aid:         process.env.MFSN_AID,
    pid:         process.env.MFSN_PID
  });

  const body = {
    sponsorCode: process.env.MFSN_SPONSOR_CODE,
    aid:         process.env.MFSN_AID,
    pid:         process.env.MFSN_PID,
    member_id:   Number(memberId)
  };
  console.log('➡️  Request body to /3B/report.json:', JSON.stringify(body));

  try {
    const resp = await fetch(
      'https://api.myfreescorenow.com/api/auth/3B/report.json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      }
    );

    const text = await resp.text();
    console.log(`⬇️  Response ${resp.status} ${resp.statusText}:`, text);

    if (!resp.ok) {
      throw new Error(`Report fetch failed: ${resp.status} ${text}`);
    }

    const report = JSON.parse(text);

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
