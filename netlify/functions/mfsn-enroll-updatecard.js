// netlify/functions/mfsn-enroll-updatecard.js
const { callMFSN } = require('./_mfsn');

exports.handler = async ({ body }) => {
  const payload = JSON.parse(body);
  const result = await callMFSN(
    '/api/auth/enroll/updatecard',
    payload.token,
    payload
  );
  return { statusCode: 200, body: JSON.stringify(result) };
};
