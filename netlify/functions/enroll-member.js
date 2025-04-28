// /netlify/functions/enroll-member.js
const axios = require('axios');

exports.handler = async (event) => {
  const { token, userId, idVerificationData, cardData, securityQuestions } = JSON.parse(event.body);
  
  try {
    // Step 1: Start Enrollment
    await axios.post(
      'https://api.myfreescorenow.com/api/auth/enroll/start',
      { userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Step 2: ID Verification
    await axios.post(
      'https://api.myfreescorenow.com/api/auth/enroll/idverification',
      idVerificationData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Step 3: Update Card (if needed)
    if (cardData) {
      await axios.post(
        'https://api.myfreescorenow.com/api/auth/enroll/updatecard',
        cardData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Enrollment failed' }) };
  }
};
