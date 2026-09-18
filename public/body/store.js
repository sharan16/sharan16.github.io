(function(root){
  const empty = () => ({ schema:1, app:'body', skills:{}, paths:{} });
  const validStatus = s => ['unmarked','working','achieved'].includes(s);
  function clean(input){
    if (!input || input.app !== 'body' || input.schema !== 1) throw new Error('This is not a Body progress backup.');
    const out=empty();
    for(const type of ['skills','paths']) for(const [id,v] of Object.entries(input[type] || {})) {
      if(id==='__proto__'||id==='constructor'||!v||!Number.isFinite(v.updatedAt)) continue;
      if(type==='skills'&&validStatus(v.status)) out.skills[id]={status:v.status,updatedAt:v.updatedAt};
      if(type==='paths'&&typeof v.following==='boolean') out.paths[id]={following:v.following,updatedAt:v.updatedAt};
    }
    return out;
  }
  function merge(a,b){
    const out=empty();
    for(const type of ['skills','paths']){
      out[type]={...a[type]};
      for(const [id,v] of Object.entries(b[type] || {})) {
        const old=out[type][id];
        if(!old || v.updatedAt>old.updatedAt || (v.updatedAt===old.updatedAt && JSON.stringify(v)>JSON.stringify(old))) out[type][id]=v;
      }
    }
    return out;
  }
  function same(a,b){
    return ['skills','paths'].every(t=>{
      const keys=Object.keys(a[t]);
      return keys.length===Object.keys(b[t]).length&&keys.every(k=>JSON.stringify(a[t][k])===JSON.stringify(b[t][k]));
    });
  }
  function create({storage,config,fetcher,onChange=()=>{},onSync=()=>{},clock=Date.now}){
    const key='body-progress-v1';let data=empty(), timer, busy=false, repeat=false, broken=false;
    try{const raw=storage.getItem(key);if(raw)data=clean(JSON.parse(raw));}catch{broken=true;onSync('Local backup unreadable · export before closing','error');}
    function persist(){try{storage.setItem(key,JSON.stringify(data));broken=false;return true;}catch{broken=true;onSync('Device storage unavailable','error');return false;}}
    function notify(){onChange(data);}
    function stamp(){return Math.max(clock(),...Object.values(data.skills).map(v=>v.updatedAt+1),...Object.values(data.paths).map(v=>v.updatedAt+1));}
    function update(type,id,value){data[type][id]={...value,updatedAt:stamp()};persist();notify();onSync(broken?'Device storage unavailable':'Saved on device · syncing…',broken?'error':'pending');clearTimeout(timer);timer=setTimeout(sync,900);}
    async function request(suffix,options={}){
      const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
      try{
        const res=await fetcher(config.url+suffix,{...options,signal:controller.signal,headers:{'X-Master-Key':config.key,...options.headers}});
        if(!res.ok)throw new Error('Sync request failed ('+res.status+')');
        return await res.json();
      }finally{clearTimeout(timeout);}
    }
    async function sync(){
      clearTimeout(timer);
      if(busy){repeat=true;return;}
      if(!config?.url){onSync(broken?'Device storage unavailable':'Saved on device',broken?'error':'local');return;}
      busy=true;onSync('Syncing…','pending');
      try{
        const remote=clean((await request('/latest')).record);
        const merged=merge(remote,data), changed=!same(data,merged);data=merged;persist();if(changed)notify();
        if(!same(remote,data)){
          const snapshot=JSON.parse(JSON.stringify(data));
          await request('',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(snapshot)});
          // Read after write and merge in case a second device wrote concurrently.
          const confirmed=clean((await request('/latest')).record);
          const mergedAfter=merge(confirmed,data), changedAfter=!same(data,mergedAfter);data=mergedAfter;persist();if(changedAfter)notify();
          if(!same(confirmed,data))repeat=true;
        }
        onSync(broken?'Cloud saved · device storage unavailable':'All changes synced',broken?'error':'synced');
      }catch{onSync(broken?'Not saved · export a backup':'Saved on device · sync paused', 'error');}
      finally{busy=false;if(repeat){repeat=false;clearTimeout(timer);timer=setTimeout(sync,1200);}}
    }
    function importData(input){data=merge(data,clean(input));persist();notify();sync();}
    function acceptLocal(raw){try{data=merge(data,clean(JSON.parse(raw)));notify();}catch{}}
    return {get:()=>data,setSkill:(id,status)=>{if(validStatus(status))update('skills',id,{status});},setPath:(id,following)=>update('paths',id,{following}),sync,importData,acceptLocal,export:()=>JSON.stringify(data,null,2)};
  }
  const api={empty,clean,merge,same,create};root.BodyStore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
