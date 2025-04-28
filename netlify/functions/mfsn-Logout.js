// netlify/functions/mfsn-logout.js
const { callMFSN } = require('./_mfsn');

exports.handler = async ({ body }) => {
  const { token } = JSON.parse(body);
  await callMFSN('/api/auth/logout', token, {});
  return { statusCode: 200, body: 'Logged out' };
};
