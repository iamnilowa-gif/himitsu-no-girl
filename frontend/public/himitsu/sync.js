const SUPABASE_URL = 'https://vrywwsuvlyqkxpdhryyt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_tFbOLzXh9exc7NjsbkaIOA_9IGFhB1o';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function cloudGet(key, defaut) {
  try {
    const { data } = await sb.from('kv_store').select('value').eq('key', key).maybeSingle();
    if (data) return data.value;
  } catch (e) {}
  try {
    const r = localStorage.getItem(key);
    if (r) return JSON.parse(r);
  } catch (e) {}
  return defaut;
}

async function cloudSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  try { await sb.from('kv_store').upsert({ key, value: val, updated_at: new Date() }); } catch (e) {}
}

async function cloudUpload(file) {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await sb.storage.from('covers').upload(path, file, { contentType: file.type });
  if (error) throw error;
  return sb.storage.from('covers').getPublicUrl(path).data.publicUrl;
}