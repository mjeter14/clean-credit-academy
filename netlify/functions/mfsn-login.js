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
    const js = await resp.json();
    const token = js.data?.token;
    if (!token) throw new Error('No token returned');

    // Decode the JWT payload to grab `sub` as memberId:
    const [, b64] = token.split('.');
    const { sub: memberId } = JSON.parse(Buffer.from(b64, 'base64').toString());

    return {
      statusCode: 200,
      body: JSON.stringify({ token, memberId })
    };
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ error: err.message }) };
  }
};
