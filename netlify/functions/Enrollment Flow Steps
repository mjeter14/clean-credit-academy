// netlify/functions/mfsn-enroll-start.js
const { callMFSN } = require('./_mfsn');

exports.handler = async ({ body }) => {
  const { email, token } = JSON.parse(body);
  const result = await callMFSN(
    '/api/auth/enroll/start',
    token,
    { email }
  );
  return { statusCode: 200, body: JSON.stringify(result) };
};
