// netlify/functions/mfsn-login.js
const { callMFSN } = require('./_mfsn');

exports.handler = async (event) => {
  console.log('⚡️ mfsn-login invoked');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Raw body:', event.body);
  console.log('ENV AID/PID:', process.env.MFSN_AID, process.env.MFSN_PID);

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Only POST allowed' };
  }

  let email, password;
  try {
    ({ email, password } = JSON.parse(event.body));
    console.log('Parsed email/password:', email, password ? '••••••••' : '<no password>');
  } catch (err) {
    console.error('❌ JSON parse error:', err.message);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON', details: err.message }) };
  }

  try {
    const { token, userId } = await callMFSN(
      '/api/auth/login',
      null,
      {
        aid: process.env.MFSN_AID,
        pid: process.env.MFSN_PID,
        email,
        password
      }
    );
    console.log('✅ Login succeeded, token length:', token.length, 'userId:', userId);
    return {
      statusCode: 200,
      body: JSON.stringify({ token, userId })
    };
  } catch (err) {
    console.error('❌ Login failed:', err.message);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: err.message })
    };
  }
};

