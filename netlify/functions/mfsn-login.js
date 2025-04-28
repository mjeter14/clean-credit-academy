// netlify/functions/mfsn-login.js
const { callMFSN } = require('./_mfsn');

exports.handler = async (event) => {
  console.log('⚡️ mfsn-login invoked');
  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return { statusCode: 405, body: 'Only POST allowed' };
  }

  let email, password;
  try {
    ({ email, password } = JSON.parse(event.body));
  } catch (err) {
    console.error('JSON parse error:', err.message);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  try {
    // callMFSN returns the parsed JSON from the API
    const raw = await callMFSN(
      '/api/auth/login',
      null,
      {
        aid: process.env.MFSN_AID,
        pid: process.env.MFSN_PID,
        email,
        password
      }
    );
    console.log('📥 Raw login response:', JSON.stringify(raw));

    // Adjust this destructuring to match the actual shape
    // (most likely it's raw.data.token and raw.data.userId)
    const token   = raw.data?.token   ?? raw.token;
    const userId  = raw.data?.userId  ?? raw.userId;

    if (!token || !userId) {
      throw new Error('Missing token or userId in login response');
    }

    console.log('✅ Login succeeded, token length:', token.length, ' userId:', userId);
    return {
      statusCode: 200,
      body: JSON.stringify({ token, userId })
    };
  } catch (err) {
    console.error('Login failed:', err.message);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: err.message })
    };
  }
};
