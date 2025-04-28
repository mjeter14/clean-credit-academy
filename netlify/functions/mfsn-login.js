// netlify/functions/mfsn-login.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Only POST allowed' };
  }

  let email, password;
  try {
    ({ email, password } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const payload = {
    aid: process.env.MFSN_AID,
    pid: process.env.MFSN_PID,
    email,
    password
  };

  try {
    const resp = await fetch(
      'https://api.myfreescorenow.com/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );
    const json = await resp.json();

    // pull the token out of json.data
    const token = json.data?.token;
    if (!token) {
      throw new Error('No token in login response');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ token })
    };
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: err.message })
    };
  }
};

