// netlify/functions/zap-members.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event, context) => {
  // Debug logs
  console.log('ENV VARS:', {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SERVICE_KEY: Boolean(process.env.SUPABASE_SERVICE_KEY),
  });
  console.log('HTTP Method:', event.httpMethod);
  console.log('Request body:', event.body);

  // If someone hits this URL in a browser or via GET, respond politely
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'This endpoint only accepts POST with JSON { members: [...] }',
      }),
    };
  }

  // Parse the JSON body safely
  let parsed;
  try {
    parsed = JSON.parse(event.body || '');
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body', details: err.message }),
    };
  }

  const { members } = parsed;
  if (!Array.isArray(members)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing or invalid "members" array' }),
    };
  }

  // Upsert into Supabase
  try {
    const { data, error } = await supabase
      .from('members')
      .upsert(members, { onConflict: 'member_id' });

    if (error) throw error;

    const inserted = Array.isArray(data) ? data.length : 0;
    return {
      statusCode: 200,
      body: JSON.stringify({ inserted }),
    };
  } catch (err) {
    console.error('Supabase error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};


