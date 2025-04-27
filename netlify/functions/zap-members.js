// netlify/functions/zap-members.js

exports.handler = async (event, context) => {
  // 🔒 Debug your environment variables
  console.log('ENV VARS:', {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SERVICE_KEY: Boolean(process.env.SUPABASE_SERVICE_KEY),
  });

  const { createClient } = require('@supabase/supabase-js');

  // Use the service-role key so RLS won’t block inserts
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    // Expect a JSON body: { members: [ { member_id:…, aid:…, email:…, … }, … ] }
    const { members } = JSON.parse(event.body);

    if (!Array.isArray(members)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid members array' })
      };
    }

    // Upsert into your `members` table using the correct PK column
    const { data, error } = await supabase
      .from('members')
      .upsert(members, { onConflict: 'member_id' });

    if (error) throw error;

    // `data` may be null if nothing was returned, so guard .length
    const inserted = Array.isArray(data) ? data.length : 0;
    return {
      statusCode: 200,
      body: JSON.stringify({ inserted })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

