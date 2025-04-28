// netlify/functions/mfsn-fetch-report-html.js
const { callMFSN } = require('./_mfsn');

exports.handler = async ({ body }) => {
  const { token } = JSON.parse(body);
  const html = await callMFSN(
    '/api/auth/3B/report.html',
    token,
    { sponsorCode: null, aid: process.env.MFSN_AID, pid: process.env.MFSN_PID }
  );
  return { statusCode: 200, body: JSON.stringify({ html }) };
};
