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
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON', details: err.message })
    };
  }

  try {
    // Send full affiliate context
    const res = await fetch('https://api.myfreescorenow.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sponsorCode: process.env.MFSN_SPONSOR_CODE,
        aid:         process.env.MFSN_AID,
        pid:         process.env.MFSN_PID,
        email,
        password
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Login failed');

    const token = json.data.token;
    if (!token) throw new Error('No token returned');

    // decode sub claim for memberId
    const [, payloadB64] = token.split('.');
    const { sub: memberId } =
      JSON.parse(Buffer.from(payloadB64, 'base64').toString());

    return {
      statusCode: 200,
      body: JSON.stringify({ token, memberId })
    };
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: err.message })
    };
  }
};
