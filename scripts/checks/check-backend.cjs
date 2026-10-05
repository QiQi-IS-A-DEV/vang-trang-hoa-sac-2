/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const { loadEnvConfig } = require('@next/env');
const { createClient } = require('@supabase/supabase-js');
loadEnvConfig(process.cwd());
const origin = process.env.TEST_BASE_URL || 'http://localhost:3000';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const adminKey = process.env.SUPABASE_SECRET_KEY;
const ids = new Set();
const options = { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) }) } };
const writer = createClient(url, publicKey, options);
const admin = adminKey ? createClient(url, adminKey, options) : null;
const marker = 'backend-check-' + crypto.randomUUID();
let channel=null;
let realtimeResolve;
const realtimeEvent=new Promise(resolve=>{realtimeResolve=resolve;});
const base = { author_name: '  [Kiểm tra backend]  ', message: '  ' + marker + '  ', role_team: '  ', leaf_type: 'lantern' };
async function call(path, body) {
  const response = await fetch(origin + path, body === undefined ? { signal: AbortSignal.timeout(20000) } : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(20000),
  });
  return { status: response.status, body: await response.json() };
}
async function main() {
  if (!admin) throw new Error('SUPABASE_SECRET_KEY is required to clean up temporary test rows.');
  assert.equal((await call('/api/messages?limit=0')).status, 400);
  assert.equal((await call('/api/messages?after=-1')).status, 400);
  assert.equal((await call('/api/gallery?limit=101')).status, 400);
  for (const invalid of [null, [], { ...base, author_name: 42 }, { ...base, message: '\n\t' }, { ...base, leaf_type: 'leaf' }, { ...base, id: crypto.randomUUID() }, { ...base, message: 'x'.repeat(1001) }]) assert.equal((await call('/api/messages', invalid)).status, 400);
  const oversized = await fetch(origin + '/api/messages', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...base, message:'x'.repeat(17000) }) });
  assert.equal(oversized.status,413);
  const malformed = await fetch(origin + '/api/messages', { method:'POST', headers:{'Content-Type':'application/json'}, body:'{' });
  assert.equal(malformed.status,400);
  const wrongType = await fetch(origin + '/api/messages', { method:'POST', headers:{'Content-Type':'text/plain'}, body:'test' });
  assert.equal(wrongType.status,415);
  console.log('PASS: malformed, oversized and forbidden API inputs rejected.');

  channel=writer.channel(marker,{config:{postgres_changes_options:{wait:true}}}).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},event=>{if(event.new.message===marker)realtimeResolve(event.new);});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Realtime subscription timeout')),15000);channel.subscribe(status=>{if(status==='SUBSCRIBED'){clearTimeout(timer);resolve();}else if(status==='CHANNEL_ERROR'){clearTimeout(timer);reject(new Error('Realtime connection failed'));}});});

  const saved = await call('/api/messages', base);
  if (saved.body.item?.id) ids.add(saved.body.item.id);
  assert.equal(saved.status, 201);
  assert.equal(saved.body.item.author_name, '[Kiểm tra backend]');
  assert.equal(saved.body.item.message, marker);
  assert.equal(saved.body.item.role_team, null);
  const received=await Promise.race([realtimeEvent,new Promise((_,reject)=>{const t=setTimeout(()=>reject(new Error('Realtime insert timeout')),15000);t.unref();})]);
  assert.equal(received.id,saved.body.item.id);
  console.log('PASS: second realtime client received saved message.');
  const simultaneous = await Promise.all(['star', 'lantern'].map(leaf_type => call('/api/messages', { ...base, leaf_type })));
  simultaneous.forEach(r => { if(r.body.item?.id) ids.add(r.body.item.id); });
  simultaneous.forEach(r => assert.equal(r.status,201));
  assert.equal(new Set([saved,...simultaneous].map(r=>r.body.item.slot_index)).size,3);
  const page1 = await call('/api/messages?limit=1&after=' + saved.body.item.slot_index);
  assert.equal(page1.status,200);
  assert.equal(page1.body.items.length,1);
  assert.ok(page1.body.next_cursor > saved.body.item.slot_index);
  const page2 = await call('/api/messages?limit=1&after=' + page1.body.next_cursor);
  assert.equal(page2.status,200);
  assert.ok(page2.body.items[0].slot_index > page1.body.items[0].slot_index);
  console.log('PASS: persistence, normalization, simultaneous slots and cursor pagination.');
  const overflow=[];
  for(let batch=0;batch<6;batch++){
    const results=await Promise.all(Array.from({length:12},()=>call('/api/messages',{...base,leaf_type:'star'})));
    results.forEach(r=>{if(r.body.item?.id){ids.add(r.body.item.id);overflow.push(r.body.item);}});
    results.forEach(r=>assert.equal(r.status,201));
  }
  assert.equal(new Set(overflow.map(m=>m.slot_index)).size,72);
  assert.ok(new Set(overflow.map(m=>Math.floor(m.slot_index/70))).size>1);
  const paged=[];let cursor=saved.body.item.slot_index;
  do{const page=await call('/api/messages?limit=7&after='+cursor);paged.push(...page.body.items);cursor=page.body.next_cursor;}while(cursor!==null);
  assert.ok(overflow.every(m=>paged.some(p=>p.id===m.id)));
  console.log('PASS: 72 concurrent-batch messages cross canopy capacity and remain readable through pagination.');

  const direct = await writer.from('messages').insert({ ...base, author_name:'\n\t', message:marker }).select('id');
  direct.data?.forEach(row=>ids.add(row.id));
  assert.ok(direct.error, 'DB must reject whitespace-only names');
  const leaf = await writer.from('messages').insert({...base,leaf_type:'leaf'}).select('id');
  leaf.data?.forEach(row=>ids.add(row.id));
  assert.ok(leaf.error, 'DB must reject new leaf records');
  assert.ok((await writer.from('messages').update({message:'Blocked'}).eq('id',saved.body.item.id)).error);
  assert.ok((await writer.from('messages').delete().eq('id',saved.body.item.id)).error);
  assert.ok((await writer.from('gallery_images').insert({image_url:'https://example.com/blocked.png'})).error);
  assert.equal((await call('/api/gallery')).status,200);
  console.log('PASS: database rules, public write restrictions and gallery read API.');
}
main().catch(error=>{ console.error('FAIL:',error.message);process.exitCode=1; }).finally(async()=>{
  if(channel)await writer.removeChannel(channel);
  if(admin && ids.size) {
    const {error}=await admin.from('messages').delete().in('id',[...ids]).eq('message',marker);
    // Whitespace-only failing test inputs would retain the marker after normalization too.
    if(error) {console.error('Test cleanup failed:',error.code);process.exitCode=1;}
    else console.log('Temporary test rows removed.');
  }
});
