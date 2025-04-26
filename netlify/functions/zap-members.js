// netlify/functions/zap-members.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  try {
    const { members } = JSON.parse(event.body);
    if (!Array.isArray(members)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid members array' }) };
    }

    const { data, error } = await supabase
      .from('members')
      .upsert(members, { onConflict: 'member_id' });

    if (error) {
      throw error;
    }

    const inserted = Array.isArray(data) ? data.length : 0;
    return { statusCode: 200, body: JSON.stringify({ inserted }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
