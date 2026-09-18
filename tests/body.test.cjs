const test=require('node:test');
const assert=require('node:assert/strict');
const {empty,clean,merge,same,create}=require('../public/body/store.js');
const paths=require('../public/body/data.js');
const media=require('../public/body/media.js');
const fs=require('node:fs');
const path=require('node:path');
test('every variation has an explicit visual match or labelled family reference with local images and attribution',()=>{
  const ids=new Set(paths.flatMap(p=>p.stages.flat().map(n=>n.id)));
  for(const id of Object.keys(media.matches))assert(ids.has(id),id);
  for(const p of paths)for(const n of p.stages.flat()){
    const key=media.matches[n.id]||media.related[n.id]||media.references[p.id];
    const a=media.assets[key];assert(a,n.id);assert(a.name&&a.author&&a.provider&&a.license&&a.licenseUrl&&a.source,key);
    assert(a.frames.length>0);for(const f of a.frames){assert(f.src.startsWith('./media/'));const file=path.resolve(__dirname,'../public/body',f.src);assert(fs.existsSync(file),file);assert(fs.statSync(file).size>1000,file);}
  }
});
test('visually different source poses are not labelled exact matches',()=>{
  for(const id of ['pistol:split','pistol:bulgarian','shrimp:step','leg-raise:straight','l-sit:v','front-lever:tuck'])assert(!media.matches[id],id);
  assert.equal(media.assets[media.matches['handstand:free']].frames.length,1);
});
test('catalog: unique stable IDs, complete instructions and valid related paths',()=>{
  const ids=new Set(),pathIds=new Set(paths.map(p=>p.id));
  for(const p of paths){assert(p.stages.length>1);for(const s of p.stages){assert(s.length<=2);for(const n of s){assert(!ids.has(n.id),n.id);ids.add(n.id);assert(n.name&&n.cue,n.id);}}for(const r of p.related)assert(pathIds.has(r));}
  assert.equal(ids.size,134);
});
test('per-exercise merge retains edits from two devices and newer unmarks',()=>{
  const a=empty(),b=empty();a.skills.a={status:'achieved',updatedAt:10};a.skills.b={status:'working',updatedAt:11};b.skills.a={status:'unmarked',updatedAt:12};b.skills.c={status:'achieved',updatedAt:9};
  const c=merge(a,b);assert.equal(c.skills.a.status,'unmarked');assert.equal(c.skills.b.status,'working');assert.equal(c.skills.c.status,'achieved');assert(same(merge(a,b),merge(b,a)));
});
test('import rejects unrelated or malformed records and preserves valid statuses',()=>{
  assert.throws(()=>clean({saved:{}}));assert.throws(()=>clean({app:'body',schema:2}));
  const d=clean({...empty(),skills:{bad:{status:'whatever',updatedAt:2},valid:{status:'working',updatedAt:3}}});assert.deepEqual(Object.keys(d.skills),['valid']);
});
test('sync loads other-device progress, writes local edits, and does not auto-complete ancestors',async()=>{
  let remote=empty(),disk={},puts=0;remote.skills.other={status:'achieved',updatedAt:1};
  const fetcher=async(url,opts)=>{if(opts.method==='PUT'){remote=JSON.parse(opts.body);puts++;}return{ok:true,json:async()=>({record:structuredClone(remote)})};};
  const s=create({storage:{getItem:k=>disk[k],setItem:(k,v)=>disk[k]=v},config:{url:'test',key:'test'},fetcher,clock:()=>10});
  s.setSkill('front-lever:full','working');await s.sync();assert.equal(s.get().skills.other.status,'achieved');assert.equal(remote.skills['front-lever:full'].status,'working');assert.equal(Object.keys(s.get().skills).length,2);assert.equal(puts,1);
  const again=create({storage:{getItem:k=>disk[k],setItem:(k,v)=>disk[k]=v},fetcher});assert.equal(again.get().skills['front-lever:full'].status,'working');
  await s.sync();assert.equal(puts,1,'unchanged state must not consume a write');
});
test('offline changes persist and later retry merges remote changes',async()=>{
  let online=false,remote=empty(),disk={},message='';
  const fetcher=async(url,opts)=>{if(!online)throw Error('offline');if(opts.method==='PUT')remote=JSON.parse(opts.body);return{ok:true,json:async()=>({record:structuredClone(remote)})};};
  const s=create({storage:{getItem:k=>disk[k],setItem:(k,v)=>disk[k]=v},config:{url:'test',key:'test'},fetcher,onSync:m=>message=m,clock:()=>20});
  s.setSkill('x','working');await s.sync();assert.match(message,/Saved on device/);assert.equal(JSON.parse(disk['body-progress-v1']).skills.x.status,'working');remote.skills.y={status:'achieved',updatedAt:10};online=true;await s.sync();assert.equal(remote.skills.x.status,'working');assert.equal(remote.skills.y.status,'achieved');
});
test('failed cloud reads never overwrite an unknown remote record',async()=>{
  let calls=0;const s=create({storage:{getItem:()=>null,setItem:()=>{}},config:{url:'test'},fetcher:async()=>{calls++;return{ok:false,status:403};}});s.setSkill('x','working');await s.sync();assert.equal(calls,1);
});
