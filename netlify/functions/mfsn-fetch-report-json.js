// netlify/functions/mfsn-fetch-report-json.js
const { callMFSN } = require('./_mfsn');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,         // your private Supabase URL
  process.env.SUPABASE_SERVICE_KEY  // your Supabase service role key
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

  try {
    // callMFSN will multipart-post username/password under your affiliate context
    const reportData = await callMFSN(
      '3B/report.json',
      token,
      { username, password }
    );

    // insert into Supabase (we need email for NOT NULL constraint)
    const { error } = await supabase
      .from('credit_reports')
      .insert([{ email: username, report_data: reportData }]);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ inserted: true })
    };
  } catch (err) {
    const code = err.message.includes('Unauthenticated') ? 401 : 500;
    return {
      statusCode: code,
      body: JSON.stringify({ error: err.message })
    };
  }
};







