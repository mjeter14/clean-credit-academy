// netlify/functions/mfsn-fetch-report-json.js
const { callMFSN } = require('./_mfsn');
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
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  try {
    // path is relative to BASE inside _mfsn.js
    const report = await callMFSN(
      'api/auth/3B/report.json',
      token,
      { member_id: Number(memberId) }
    );

    // insert into Supabase
    const { data, error } = await supabase
      .from('credit_reports')
      .insert([{ report_data: report }]);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ inserted: data.length })
    };

  } catch (err) {
    console.error('fetch-report-json error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
