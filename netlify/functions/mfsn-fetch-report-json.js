// netlify/functions/mfsn-fetch-report-json.js
const { callMFSN } = require('./_mfsn');
const { createClient } = require('@supabase/supabase-js');

// initialize Supabase with your **private** keys:
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async ({ httpMethod, body }) => {
  if (httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Only POST allowed' };
  }

  let token, username, password;
  try {
    ({ token, username, password } = JSON.parse(body));
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  try {
    // fetch member 3B report
    const reportData = await callMFSN('3B/report.json', token, {
      username,
      password
    });

    // store in Supabase
    const { error } = await supabase
      .from('credit_reports')
      .insert([{ user_id: /* your user id logic here */, report_data: reportData }]);

    if (error) throw error;

    return { statusCode: 200, body: JSON.stringify({ inserted: 1 }) };
  } catch (err) {
    console.error('fetch-report-json error', err);
    return {
      statusCode: err.message.includes('Unauthenticated') ? 401 : 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};






