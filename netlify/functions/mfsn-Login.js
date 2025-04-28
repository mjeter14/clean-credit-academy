// netlify/functions/mfsn-login.js
const { callMFSN } = require('./_mfsn');

exports.handler = async ({ body }) => {
  const { email, password } = JSON.parse(body);
  const { token } = await callMFSN(
    '/api/auth/login',
    null,
    {
      aid: process.env.MFSN_AID,
      pid: process.env.MFSN_PID,
      email, password
    }
  );
  return { statusCode: 200, body: JSON.stringify({ token }) };
};
