// netlify/functions/import-3b-report.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const handler = async (event) => {
  try {
    // 1) parse incoming email/password
    const { email, password } = JSON.parse(event.body);

    // 2) log in to MFSN
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
    if (!loginRes.ok) {
      const err = await loginRes.text();
      throw new Error(`Login failed: ${err}`);
    }
    const { token } = await loginRes.json();   // assuming they return { token: "..." }

    // 3) fetch the 3B report
    const reportRes = await fetch('https://api.myfreescorenow.com/api/auth/3B/report.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });
    if (!reportRes.ok) {
      const err = await reportRes.text();
      throw new Error(`Report fetch failed: ${err}`);
    }
    const report = await reportRes.json();

    // 4) save it in Supabase
    const { data, error } = await supabase
      .from('credit_reports')
      .insert([{ email, report_data: report }]);
    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ id: data[0].id, report })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
