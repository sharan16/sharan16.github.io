(() => {
  'use strict';
  const paths=BODY_PATHS, groups=['Pull','Push','Core','Legs','Mobility'];
  const all=paths.flatMap(p=>p.stages.flat()), byId=new Map(all.map(n=>[n.id,n]));
  const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={unmarked:'Unmarked',working:'Working on',achieved:'Can do'};
  const symbols={unmarked:'',working:'◉',achieved:'✓'};
  let state=BodyStore.empty(), ready=false, selected=null, pose=0, camera=null, toastTimer;
  const preview=new URLSearchParams(location.search).get('preview')==='1';
  let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('Storage unavailable');}};}
  if(preview){const mem={};storage={getItem:k=>mem[k],setItem:(k,v)=>mem[k]=v};const banner=document.createElement('div');banner.className='preview';banner.textContent='Preview — changes stay in this tab';document.querySelector('header').after(banner);}
  const store=BodyStore.create({storage,config:preview?null:BODY_SYNC,fetcher:fetch.bind(window),onChange:data=>{
    state=data;if(ready){render(true);if(selected)renderSkill();}
  },onSync:(text,kind)=>{$('#sync-message').textContent=preview?'Preview mode. Your real progress is unchanged.':text;$('#save-label').textContent=kind==='synced'?'Synced':kind==='pending'?'Saving…':kind==='error'?'Check sync':'Saved';$('#save-dot').className=kind;$('#sync-open').title=text;}});
  state=store.get();
  const status=id=>state.skills[id]?.status||'unmarked';
  const stats=ns=>({done:ns.filter(n=>status(n.id)==='achieved').length,working:ns.filter(n=>status(n.id)==='working').length});
  function route(){const parts=location.hash.slice(1).split('/');if(parts[0]==='path'){const p=paths.find(p=>p.id===parts[1]);if(p)return{type:'path',path:p};}if(parts[0]==='group'){const g=groups.find(g=>g.toLowerCase()===parts[1]);if(g)return{type:'group',group:g};}return{type:'all'};}
  const groupUrl=g=>'#group/'+g.toLowerCase();
  function node({id,name,x,y,kind='skill',detail='',value='',href=''}){
    const st=kind==='skill'?status(id):kind;
    return `<button class="node ${st}" ${kind==='skill'?`data-skill="${id}"`:`data-go="${href}"`} style="left:${x}px;top:${y}px" aria-label="${esc(name)}, ${kind==='skill'?labels[st]:esc(detail)}"><span class="orb">${kind==='skill'?(symbols[st]||value):value}</span><strong>${esc(name)}</strong>${detail||kind==='skill'&&st!=='unmarked'?`<small>${esc(detail||(labels[st]))}</small>`:''}</button>`;
  }
  function render(preserve=false){
    const r=route(),key=r.type==='path'?r.path.id:r.type==='group'?r.group:'all';
    const old=preserve&&camera?.key===key?{x:camera.x,y:camera.y,scale:camera.scale}:null;
    if(camera)camera.destroy();
    let buttons=[],edges=[],forks=[],width=400,height,focusY=0;
    if(r.type==='path'){
      const p=r.path,c=stats(p.stages.flat());
      $('#context').innerHTML=`<a class="crumb" href="${groupUrl(p.group)}">← ${p.group} branches</a><select class="path-select" id="path-picker" aria-label="Choose a skill path">${groups.map(g=>`<optgroup label="${g}">${paths.filter(p=>p.group===g).map(q=>`<option value="${q.id}" ${q.id===p.id?'selected':''}>${q.name}</option>`).join('')}</optgroup>`).join('')}</select><p><span class="path-stats">${c.done} can do${c.working?' · '+c.working+' working on':''}</span> · Tap a skill to see it</p>`;
      let previous=[];p.stages.forEach((stage,i)=>{
        const y=28+i*155,current=[];
        if(stage.length>1)forks.push(`<div class="fork-label" style="left:110px;top:${y-25}px">Choose either variation</div>`);
        stage.forEach((n,j)=>{const x=stage.length===1?110:10+j*200;buttons.push(node({id:n.id,name:n.name,x,y,value:String(i+1)}));current.push({n,x,y});previous.forEach(pr=>edges.push(`<path class="edge ${status(pr.n.id)==='achieved'&&status(n.id)==='achieved'?'done':''}" d="M ${pr.x+90} ${pr.y+108} C ${pr.x+90} ${pr.y+128}, ${x+90} ${y-35}, ${x+90} ${y-8}"/>`));});previous=current;
      });
      height=p.stages.length*155+20;
      const working=p.stages.findIndex(s=>s.some(n=>status(n.id)==='working'));
      const achieved=p.stages.map((s,i)=>s.some(n=>status(n.id)==='achieved')?i:-1).filter(i=>i>=0);
      focusY=Math.max(0,(working>=0?working:achieved.length?Math.min(achieved.at(-1)+1,p.stages.length-1):0)-1)*155;
      $('#map-hint').textContent='Drag to explore · pinch to zoom';
    }else{
      const subset=r.type==='group'?paths.filter(p=>p.group===r.group):paths;
      const c=stats(subset.flatMap(p=>p.stages.flat()));
      $('#context').innerHTML=`${r.type==='group'?'<a class="crumb" href="#all">← All skills</a>':''}<h1>${r.type==='all'?'Your skill tree':r.group+' skills'}</h1><p>${c.done} can do${c.working?' · '+c.working+' working on':''} · ${r.type==='all'?'Choose a branch to begin':'Choose a skill to explore'}</p>`;
      const branches=r.type==='all'?groups.map(g=>({id:g,name:g,href:groupUrl(g),items:paths.filter(p=>p.group===g).flatMap(p=>p.stages.flat()),value:{Pull:'↟',Push:'↑',Core:'◎',Legs:'↥',Mobility:'∿'}[g]})):subset.map(p=>({id:p.id,name:p.name,href:'#path/'+p.id,items:p.stages.flat(),value:stats(p.stages.flat()).done?'✓':'○'}));
      const wide=$('#tree').clientWidth>=760,cols=wide?Math.min(branches.length,r.type==='all'?5:4):2;
      width=cols*200;
      buttons.push(node({id:'root',name:r.type==='all'?'Your skills':r.group,kind:'root',x:width/2-90,y:20,value:r.type==='all'?'b.':'↟',href:'#all'}));
      height=(wide?180:140)+Math.ceil(branches.length/cols)*(wide?155:130);
      if(!wide)edges.push(`<path class="edge" d="M200 128 V${140+Math.floor((branches.length-1)/2)*130+28}"/>`);
      branches.forEach((b,i)=>{const y=(wide?180:140)+Math.floor(i/cols)*(wide?155:130),x=(i%cols)*200+10,c=stats(b.items);buttons.push(node({id:b.id,name:b.name,x,y,kind:'branch',detail:c.done+' / '+b.items.length+' can do',value:b.value,href:b.href}));edges.push(wide?`<path class="edge" d="M${width/2} 128 V${y-30} H${x+90} V${y-8}"/>`:`<path class="edge" d="M200 ${y+28} H${i%2===0?x+125:x+55}"/>`);});
      $('#map-hint').textContent=r.type==='all'?'Your progress lives on these branches':'Tap a branch to open its tree';
    }
    $('#world').style.width=width+'px';$('#world').style.height=height+'px';
    $('#world').innerHTML=`<svg width="${width}" height="${height}" aria-hidden="true">${edges.join('')}</svg>${forks.join('')}${buttons.join('')}`;
    document.title=(r.type==='path'?r.path.name:r.type==='group'?r.group:'Skill tree')+' — Body';
    camera=setupCamera(key,width,height,focusY,r.type==='all');
    if(old){Object.assign(camera,old);camera.apply();}
  }
  function setupCamera(key,width,height,focusY,fitInitially){
    const viewport=$('#tree'),world=$('#world'),abort=new AbortController();
    const on=(type,fn,opts={})=>viewport.addEventListener(type,fn,{signal:abort.signal,...opts});
    const c={key,x:0,y:0,scale:1,apply(){world.style.transform=`translate(${this.x}px,${this.y}px) scale(${this.scale})`;},fit(){this.scale=Math.max(.2,Math.min(1,(viewport.clientWidth-24)/width,(viewport.clientHeight-100)/height));this.x=(viewport.clientWidth-width*this.scale)/2;this.y=20;this.apply();},zoom(f,cx=viewport.clientWidth/2,cy=viewport.clientHeight/2){const s=Math.min(1.7,Math.max(.2,this.scale*f));this.x=cx-(cx-this.x)*s/this.scale;this.y=cy-(cy-this.y)*s/this.scale;this.scale=s;this.apply();},destroy(){abort.abort();observer.disconnect();}};
    c.scale=Math.min(1,(viewport.clientWidth-24)/width);c.x=(viewport.clientWidth-width*c.scale)/2;c.y=22-focusY*c.scale;if(fitInitially)c.fit();else c.apply();
    const pointers=new Map();let start=null,down=null,moved=false,lastDistance=0,lastMid=null;
    on('pointerdown',e=>{if(e.target.closest('.map-tools'))return;if(pointers.size===0){start={x:e.clientX,y:e.clientY};moved=false;down=e.target.closest('.node');}pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size>1){moved=true;down=null;const p=[...pointers.values()];lastDistance=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);lastMid={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2};}viewport.setPointerCapture(e.pointerId);});
    on('pointermove',e=>{if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>5)moved=true;
      if(pointers.size===2){const p=[...pointers.values()],dist=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),mid={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2},r=viewport.getBoundingClientRect();if(lastDistance)c.zoom(dist/lastDistance,mid.x-r.left,mid.y-r.top);if(lastMid){c.x+=mid.x-lastMid.x;c.y+=mid.y-lastMid.y;}lastDistance=dist;lastMid=mid;}else if(moved){c.x+=e.clientX-prev.x;c.y+=e.clientY-prev.y;}if(moved)viewport.classList.add('dragging');c.apply();});
    on('pointerup',e=>{if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);if(!pointers.size){viewport.classList.remove('dragging');if(!moved&&down)activateNode(down);down=null;start=null;}lastDistance=0;lastMid=null;});
    on('pointercancel',e=>{pointers.delete(e.pointerId);down=null;moved=true;viewport.classList.remove('dragging');});
    on('click',e=>{if(e.target.closest('.node')&&e.detail!==0){e.stopPropagation();e.preventDefault();}},{capture:true});
    on('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey){const r=viewport.getBoundingClientRect();c.zoom(Math.exp(-e.deltaY*.008),e.clientX-r.left,e.clientY-r.top);}else{c.x-=e.deltaX;c.y-=e.deltaY;c.apply();}},{passive:false});
    on('keydown',e=>{if(e.target!==viewport)return;const dirs={ArrowLeft:[35,0],ArrowRight:[-35,0],ArrowUp:[0,35],ArrowDown:[0,-35]};if(dirs[e.key]){e.preventDefault();c.x+=dirs[e.key][0];c.y+=dirs[e.key][1];c.apply();}else if(['+','=','-','0'].includes(e.key)){e.preventDefault();if(e.key==='0')c.fit();else c.zoom(e.key==='-'?1/1.25:1.25);}});
    on('focusin',e=>{if(!e.target.matches('.node'))return;const a=e.target.getBoundingClientRect(),b=viewport.getBoundingClientRect();if(a.top<b.top||a.bottom>b.bottom||a.left<b.left||a.right>b.right){c.x+=b.left+b.width/2-(a.left+a.width/2);c.y+=b.top+b.height/2-(a.top+a.height/2);c.apply();}});
    let previousWidth=viewport.clientWidth;const observer=new ResizeObserver(()=>{if(previousWidth!==viewport.clientWidth){const crossed=(previousWidth>=760)!==(viewport.clientWidth>=760);previousWidth=viewport.clientWidth;if(crossed&&route().type!=='path'){render();return;}c.fit();}});observer.observe(viewport);return c;
  }
  function activateNode(button){if(button.dataset.skill)openSkill(button.dataset.skill);else if(button.dataset.go)location.hash=button.dataset.go;}
  function mediaFor(n,p){const exact=BODY_MEDIA.matches[n.id],key=exact||BODY_MEDIA.related?.[n.id]||BODY_MEDIA.references[p.id];return {asset:BODY_MEDIA.assets[key],exact:!!exact};}
  function mediaHTML(n,p){const {asset:a,exact}=mediaFor(n,p);if(!a)return '';
    pose=Math.min(pose,a.frames.length-1);const f=a.frames[pose];
    return `<figure class="visual"><button class="visual-image ${a.kind==='photo'?'photo':''}" id="enlarge-image" aria-label="Enlarge ${esc(a.name)} image"><img id="exercise-image" src="${f.src}" alt="${esc(a.name)} — ${esc(f.label)}" width="512" height="512"></button>${a.frames.length>1?`<div class="pose-controls" aria-label="Exercise poses">${a.frames.map((f,i)=>`<button data-pose="${i}" aria-pressed="${pose===i}">Pose ${i+1}</button>`).join('')}</div>`:''}<figcaption class="visual-caption"><strong>${exact?(a.kind==='photo'?'Photo reference':'Exercise illustration'):'Related reference · '+esc(a.name)}</strong>${!exact?`<span class="reference-note">This shows ${esc(a.name.toLowerCase())}, not the exact ${esc(n.name.toLowerCase())} variation.</span>`:''}</figcaption></figure>`;
  }
  function renderSkill(){const n=byId.get(selected);if(!n)return;const p=paths.find(p=>p.stages.flat().some(x=>x.id===n.id));const {asset:a}=mediaFor(n,p),s=status(n.id);
    $('#skill').innerHTML=`<div class="sheet-heading"><div><div class="eyebrow">${p.name} · Stage ${n.stage+1}</div><h2 id="skill-title">${n.name}</h2></div><button class="close" data-close aria-label="Close exercise">×</button></div>${mediaHTML(n,p)}<p class="cue">${n.cue}</p><a class="video-link" href="https://www.youtube.com/results?search_query=${encodeURIComponent(n.name+' calisthenics tutorial')}" target="_blank" rel="noreferrer">Find a video of this variation ↗</a>${a?`<details class="source"><summary>Image source · ${esc(a.provider)}</summary><p>${esc(a.name)} — ${esc(a.author)}. <a href="${a.source}" target="_blank" rel="noreferrer">Original</a> · <a href="${a.licenseUrl}" target="_blank" rel="noreferrer">${esc(a.license)}</a>. ${a.kind==='illustration'?'AI-generated illustration supplied by RepDB.':'Photograph displayed unmodified.'}</p></details>`:''}<div class="status-bar"><div class="status-label">Your progress</div><div class="status-buttons">${Object.entries(labels).map(([k,v])=>`<button data-status="${k}" aria-pressed="${s===k}">${v}${s===k?' ✓':''}</button>`).join('')}</div></div>`;
    $('#exercise-image')?.addEventListener('error',()=>{const frame=$('#enlarge-image');frame.disabled=true;frame.className='image-failed';frame.textContent='Image unavailable offline. The description and video link are still available.';});
  }
  function openSkill(id){if(!byId.has(id))return;selected=id;pose=0;renderSkill();$('#skill').showModal();$('#skill').scrollTop=0;}
  function showToast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,2500);}
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.matches('.node'))activateNode(b);
    else if(b.dataset.map){if(b.dataset.map==='fit')camera.fit();else camera.zoom(b.dataset.map==='in'?1.25:1/1.25);}
    else if(b.hasAttribute('data-close'))b.closest('dialog').close();
    else if(b.dataset.status){store.setSkill(selected,b.dataset.status);$('#skill').querySelector(`[data-status="${b.dataset.status}"]`)?.focus({preventScroll:true});}
    else if(b.dataset.pose!==undefined){pose=Number(b.dataset.pose);const scroll=$('#skill').scrollTop;renderSkill();$('#skill').scrollTop=scroll;$('#skill').querySelector(`[data-pose="${pose}"]`).focus({preventScroll:true});}
    else if(b.id==='enlarge-image'){const img=$('#exercise-image');$('#large-image').src=img.src;$('#large-image').alt=img.alt;$('#large-caption').textContent=img.alt;$('#image-view').showModal();}
    else if(b.id==='sync-open')$('#settings').showModal();
    else if(b.id==='sync-now')store.sync();
    else if(b.id==='export'){const url=URL.createObjectURL(new Blob([store.export()],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='body-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
    else if(b.id==='import')$('#import-file').click();
  });
  document.addEventListener('change',e=>{if(e.target.id==='path-picker')location.hash='path/'+e.target.value;});
  $('#import-file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>1000000)throw Error('Backup is too large.');store.importData(JSON.parse(await f.text()));$('#import-result').textContent='Backup merged.';}catch(err){$('#import-result').textContent='Could not import: '+err.message;}e.target.value='';});
  document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});});
  $('#skill').addEventListener('close',()=>{const id=selected;selected=null;document.querySelector(`[data-skill="${id}"]`)?.focus({preventScroll:true});});
  window.addEventListener('hashchange',()=>{if($('#skill').open)$('#skill').close();render();});
  window.addEventListener('online',()=>store.sync());
  window.addEventListener('storage',e=>{if(!preview&&e.key==='body-progress-v1'&&e.newValue){store.acceptLocal(e.newValue);store.sync();}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)store.sync();});
  ready=true;render();store.sync();
  if('serviceWorker' in navigator&&!preview)navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
