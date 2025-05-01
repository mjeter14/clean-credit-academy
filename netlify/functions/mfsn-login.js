// netlify/functions/mfsn-login.js
const { callMFSN } = require('./_mfsn');

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

  try {
    // this POSTS form-data to /api/auth/login
    const data = await callMFSN('login', null, { email, password });

    return {
      statusCode: 200,
      body: JSON.stringify({
        token: data.token,
        memberId: data.memberId  // this is the numeric ID you'll pass back later
      })
    };
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: err.message })
    };
  }
};





