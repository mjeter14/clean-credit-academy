// netlify/functions/zap-members.js
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    const { members } = JSON.parse(event.body);
    // upsert into your “members” table
    const { data, error } = await supabase
      .from('members')
      .upsert(members, { onConflict: 'id' });
    if (error) throw error;
    return { statusCode: 200, body: JSON.stringify({ inserted: data.length }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
