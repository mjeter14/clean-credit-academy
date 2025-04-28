// netlify/functions/mfsn-login.js
const { callMFSN } = require('./_mfsn');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Only POST allowed' };
  }

  let email, password;
  try {
    ({ email, password } = JSON.parse(event.body));
  } catch (err) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  try {
    // Call the MFSN login endpoint:
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

    // *** DEBUG: return raw payload verbatim ***
    return {
      statusCode: 200,
      body: JSON.stringify({ raw })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

