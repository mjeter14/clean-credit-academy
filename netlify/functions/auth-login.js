// /netlify/functions/auth-login.js
const axios = require('axios');

exports.handler = async (event) => {
  const { username, password } = JSON.parse(event.body);
  
  try {
    const response = await axios.post(
      'https://api.myfreescorenow.com/api/auth/login',
      { username, password },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        token: response.data.token,
        userId: response.data.userId
      })
    };
  } catch (error) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Login failed' }) };
  }
};
