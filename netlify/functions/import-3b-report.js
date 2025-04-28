// netlify/functions/import-3b-report.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event, context) => {
  console.log('🔥 import-3b-report invoked');
  console.log('HTTP Method:', event.httpMethod);

  let { email, password } = {};
  try {
    ({ email, password } = JSON.parse(event.body));
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body', details: err.message })
    };
  }

  // 1) Login
  console.log('→ POST /api/auth/login', { aid: process.env.MFSN_AID, pid: process.env.MFSN_PID, email });
  const loginRes = await fetch('https://api.myfreescorenow.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      aid: process.env.MFSN_AID,
      pid: process.env.MFSN_PID,
      email,
      password
    })
  });
  const loginText = await loginRes.text();
  console.log('Login status:', loginRes.status, 'body:', loginText);
  if (!loginRes.ok) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Login failed', details: loginText })
    };
  }
  const { token } = JSON.parse(loginText);

  // 2) Fetch the 3B report
  console.log('→ POST /api/auth/3B/report.json (with Bearer token)');
  const reportRes = await fetch('https://api.myfreescorenow.com/api/auth/3B/report.json', {
    method: 'POST',                           // <— must be POST!
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({})                  // send an empty JSON object
  });
  const reportText = await reportRes.text();
  console.log('Report status:', reportRes.status, 'body snippet:', reportText.slice(0,200));
  if (!reportRes.ok) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Report fetch failed', details: reportText })
    };
  }
  const report = JSON.parse(reportText);

  // 3) Store in Supabase
  const { data, error } = await supabase
    .from('credit_reports')
    .insert([{ email, report_data: report }]);
  if (error) {
    console.error('Supabase insert error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ id: data[0].id, report })
  };
};
