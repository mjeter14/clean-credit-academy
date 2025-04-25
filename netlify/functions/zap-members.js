// netlify/functions/zap-members.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
exports.handler = async (event) => {
  try {
    const { members } = JSON.parse(event.body);
    const { data, error } = await supabase
      .from('members')
      .upsert(members, { onConflict: 'id' });
    if (error) throw error;
    return { statusCode: 200, body: JSON.stringify({ inserted: data.length }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
