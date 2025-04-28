// netlify/functions/mfsn-enroll-idverification.js
const { callMFSN } = require('./_mfsn');

exports.handler = async ({ body }) => {
  const payload = JSON.parse(body);
  const result = await callMFSN(
    '/api/auth/enroll/idverification',
    payload.token,
    payload  // must include whatever fields MFSN expects
  );
  return { statusCode: 200, body: JSON.stringify(result) };
};
