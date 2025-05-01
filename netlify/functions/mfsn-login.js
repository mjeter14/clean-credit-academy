const { callMFSN } = require('./_mfsn');

exports.handler = async ({ httpMethod, body }) => {
  if (httpMethod !== 'POST') return { statusCode: 405, body: 'Only POST' };
  const { email, password } = JSON.parse(body);

  try {
    const data = await callMFSN('login', null, { email, password });
    return {
      statusCode: 200,
      body: JSON.stringify({ token: data.token, userId: data.userId })
    };
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ error: err.message }) };
  }
};


