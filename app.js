const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let data={albums:[],photos:[],videos:[],gaussians:[]};
const fallbackAlbumImages=[
 "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
 "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80",
 "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
 "https://images.unsplash.com/photo-1515542622104-9b7c9c2c3b0f?auto=format&fit=crop&w=800&q=80"
];
const fallbackPhotos=[
 "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=700&q=80",
 "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=700&q=80",
 "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=700&q=80",
 "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=700&q=80",
 "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80",
 "https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&w=700&q=80"
];
async function loadManifest(){try{const r=await fetch('assets.json');if(r.ok)data=await r.json()}catch(e){console.info('Using demo placeholders until assets.json is available.')}}
function photoURL(p){return p.src||p.path||p.file||''}
function renderAlbums(){const grid=$('#album-grid');grid.innerHTML='';
 data.albums.forEach((a,i)=>{let cover=a.cover||fallbackAlbumImages[i%4];const card=document.createElement('article');card.className='album-card';card.innerHTML=`<div class="album-cover"><img loading="lazy" src="${cover}" alt=""></div><div class="album-name">${esc(a.title||a.name||'Album')}</div><div class="album-count">${esc(a.count||`${(a.items||[]).length} items`)}</div>`;card.onclick=()=>openAlbum(a);grid.append(card)});
 const add=document.createElement('div');add.innerHTML='<div class="new-album"><div class="plus">＋</div></div><div class="new-album-caption">New Album</div>';add.onclick=()=>alert('Create an album by adding an entry in assets.json. GitHub Pages is static, so edits are committed to your repository.');grid.append(add);
}
function renderPhotos(){const grid=$('#photo-grid');grid.innerHTML='';let list=data.photos.length?data.photos:fallbackPhotos.map((src,i)=>({src,title:['Paris street','Along the Seine','Eiffel Tower','Parisian balconies','Evening sky','Montmartre'][i]}));list.slice(0,18).forEach((p,i)=>{const src=photoURL(p);const t=document.createElement('div');t.className='photo-tile';t.innerHTML=`<img loading="lazy" src="${src}" alt="${esc(p.title||'Photo')}">`;t.onclick=()=>openMedia(src,'image');grid.append(t)})}
function renderVideos(){const grid=$('#video-grid');grid.innerHTML='';data.videos.slice(0,4).forEach(v=>{const t=document.createElement('div');t.className='photo-tile';t.innerHTML=`<video preload="none" muted playsinline poster="${v.thumbnail||''}"><source src="${photoURL(v)}"></video><span class="tile-label">▶ ${esc(v.title||'Video')}</span>`;t.onclick=()=>openMedia(photoURL(v),'video');grid.append(t)});if(!data.videos.length)grid.innerHTML='<div class="empty">Add video entries to assets.json to display them here.</div>'}
function renderSplats(){const grid=$('#splat-grid');grid.innerHTML='';data.gaussians.forEach((g,i)=>{const c=document.createElement('article');c.className='splat-card';c.innerHTML=`<div class="splat-preview">${g.thumbnail?`<img loading="lazy" src="${g.thumbnail}" alt="">`:''}<div class="splat-overlay">Open spatial viewer</div></div><div class="splat-meta"><div class="splat-title">${esc(g.title||g.name||`Spatial memory ${i+1}`)}</div><div class="splat-sub">${esc(g.location||'Gaussian splat')}</div></div>`;c.onclick=()=>openSplat(g);grid.append(c)});if(!data.gaussians.length)grid.innerHTML='<div class="empty">Place .splat or .ply files in the gaussians folder and add them to assets.json.</div>'}
function renderPlaces(){let places=[...new Set(data.albums.map(a=>a.location||a.title).filter(Boolean))];$('#places').innerHTML=places.map(p=>`<button class="place" data-place="${esc(p)}"><span class="pin">♧</span>${esc(p)}</button>`).join('');$$('.place').forEach(b=>b.onclick=()=>{const place=b.dataset.place;const albums=data.albums.filter(a=>(a.location||a.title)===place);openAlbum(albums[0]||albums[0])})}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function openAlbum(a){const items=a.items||[];let content=`<div style="color:white;max-width:90vw"><h2>${esc(a.title||a.name)}</h2><div class="photo-grid" style="grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">`;items.forEach(it=>content+=`<div class="photo-tile"><img src="${photoURL(it)}" alt="" data-src="${photoURL(it)}"></div>`);content+='</div></div>';showModal(content);$$('#modal-content img').forEach(im=>im.onclick=()=>openMedia(im.dataset.src,'image'))}
function showModal(html){$('#modal-content').innerHTML=html;$('#modal').classList.remove('hidden')}
function closeModal(){$('#modal').classList.add('hidden');$('#modal-content').innerHTML=''}
function openMedia(src,type){showModal(type==='video'?`<video controls autoplay src="${src}"></video>`:`<img src="${src}" alt="">`)}
async function openSplat(g){
 const src=photoURL(g);showModal(`<div class="viewer-shell" id="viewer"><div class="viewer-status" id="viewer-status">Spatial view · Optimize to load</div><div class="viewer-error" id="viewer-welcome"><div><h2>${esc(g.title||'Spatial memory')}</h2><p>Viewer is idle until you choose to load the scene.</p><button class="viewer-toolbar" id="optimize">Optimize &amp; load</button></div></div></div>`);
 $('#optimize').onclick=()=>loadSplatScene(src);
}
async function loadSplatScene(src){
 const welcome=$('#viewer-welcome'), status=$('#viewer-status');if(!src){welcome.innerHTML='<p>No file path is set for this Gaussian splat. Edit assets.json.</p>';return}
 status.textContent='Loading scene…';welcome.innerHTML='<div style="width:100%"><div class="loading-bar"></div><p style="padding:20px">Preparing viewer and scene…</p></div>';
 try{
  const G=await import('https://cdn.jsdelivr.net/npm/@mkkellogg/gaussian-splats-3d@0.4.4/build/gaussian-splats-3d.module.js');
  const shell=$('#viewer'), el=document.createElement('div');el.style.cssText='position:absolute;inset:0';shell.appendChild(el);
  const viewer=new G.Viewer({rootElement:el,renderer:null, cameraUp:[0,1,0],initialCameraPosition:[0,0,4],initialCameraLookAt:[0,0,0],sharedMemoryForWorkers:false,gpuAcceleratedSort:true,ignoreDevicePixelRatio:false,renderMode:G.RenderMode.OnDemand,enableControls:true,antialiased:true});
  status.textContent='Loading splat · first load may take a moment';
  await viewer.addSplatScene(src,{showLoadingUI:false,progressiveLoad:true,splatAlphaRemovalThreshold:5,rotation:[0,0,0],scale:[1,1,1],position:[0,0,0]});
  viewer.start();status.textContent='Drag to orbit · scroll to zoom';
  welcome.remove();
 }catch(err){console.error(err);welcome.innerHTML=`<div class="viewer-error"><div><h3>Could not load scene</h3><p>Check that the file is a supported .splat or .ply and is reachable on GitHub Pages.</p><small>${esc(err.message)}</small></div></div>`;status.textContent='Viewer error'}
}
function renderView(v){if(v==='search'){mainSearch();return}if(v==='albums'){renderAlbums();$('#main').scrollIntoView({behavior:'smooth'});return}if(v==='photos'){renderPhotos();return}if(v==='gaussians'){renderSplats();return}if(v==='videos'){renderVideos();return}}
function mainSearch(){const main=$('#main');main.innerHTML=`<div class="search-view"><h1>Search</h1><input class="search-input" id="searchbox" placeholder="Search photos, albums, places…"><div id="search-results"></div></div>`;$('#searchbox').oninput=e=>{const q=e.target.value.toLowerCase(), results=[...data.albums.map(a=>({title:a.title,kind:'Album',cover:a.cover})),...data.photos.map(p=>({title:p.title,kind:'Photo',cover:photoURL(p)})),...data.gaussians.map(g=>({title:g.title,kind:'Spatial memory',cover:g.thumbnail}))].filter(x=>(x.title||'').toLowerCase().includes(q));$('#search-results').innerHTML=results.map(x=>`<div class="place">${x.kind} · ${esc(x.title)}</div>`).join('')}}
$('#close-modal').onclick=closeModal;$('#modal').onclick=e=>{if(e.target.id==='modal')closeModal()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
$$('.navitem[data-view]').forEach(b=>b.onclick=()=>{ $$('.navitem').forEach(x=>x.classList.remove('active'));b.classList.add('active');if(b.dataset.view==='library'){location.reload()}else renderView(b.dataset.view)});
$$('.seeall').forEach(b=>b.onclick=()=>renderView(b.dataset.view));
(async()=>{await loadManifest();renderAlbums();renderPhotos();renderSplats();renderVideos();renderPlaces();})();
