// netlify/functions/mfsn-login.js
const fetch = require('node-fetch');

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

  // Build the payload
  const payload = {
    aid: process.env.MFSN_AID,
    pid: process.env.MFSN_PID,
    email,
    password
  };
  console.log('Calling raw login with payload:', payload);

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
    console.log('📥 FULL login response from MFSN:', JSON.stringify(json));

    // For now, just return it so we can inspect
    return {
      statusCode: 200,
      body: JSON.stringify({ json })
    };
  } catch (err) {
    console.error('Fetch error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
