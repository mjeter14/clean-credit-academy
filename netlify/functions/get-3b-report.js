// /netlify/functions/get-3b-report.js
const axios = require('axios');

exports.handler = async (event) => {
  const { token, memberId } = JSON.parse(event.body);

  try {
    // Fetch JSON report
    const report = await axios.post(
      'https://api.myfreescorenow.com/api/auth/3B/report.json',
      { memberId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Store in Supabase
    const { data, error } = await supabase
      .from('credit_reports')
      .insert([{ user_id: memberId, report_data: report.data }]);

    return { statusCode: 200, body: JSON.stringify(report.data) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Report fetch failed' }) };
  }
};
