// netlify/functions/mfsn-fetch-report-json.js
const { callMFSN } = require('./_mfsn');

exports.handler = async ({ body }) => {
  const { token } = JSON.parse(body);
  const report = await callMFSN(
    '/api/auth/3B/report.json',
    token,
    { sponsorCode: null, aid: process.env.MFSN_AID, pid: process.env.MFSN_PID }
  );
  return { statusCode: 200, body: JSON.stringify(report) };
};
