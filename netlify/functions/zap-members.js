// netlify/functions/zap-members.js
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    const payload = JSON.parse(event.body);
    // Zapier passed through your JSON, so the array lives under `payload.data`
    const members = payload.data;

    // Upsert into your `members` table
    const { data, error } = await supabase
      .from('members')
      .upsert(members, { onConflict: 'member_id' }); // or 'id' if you named it that

    if (error) throw error;
    return { statusCode: 200, body: JSON.stringify({ inserted: data.length }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
