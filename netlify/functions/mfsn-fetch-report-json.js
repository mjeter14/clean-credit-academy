// netlify/functions/mfsn-fetch-report-json.js
const { callMFSN }      = require('./_mfsn');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Only POST allowed' };
  }

  let token, username, password, memberId;
  try {
    ({ token, username, password, memberId } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  try {
    // fetch the 3B report
    const report = await callMFSN(
      '3B/report.json',
      token,
      { username, password, member_id: memberId }
    );

    // store it in Supabase
    const { error } = await supabase
      .from('credit_reports')
      .insert([{ report_data: report }]);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ inserted: 1 })
    };
  } catch (err) {
    console.error('fetch-report-json error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};





