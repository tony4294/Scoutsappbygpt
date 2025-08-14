// Ultimate Scouters Guide - app.js
// Data content (expand later as needed)
const DATA = {
  knots: [
    {id:'bowline', title:'Bowline', summary:'Fixed loop; back up for life-safety.', steps:['Form small loop','End up through loop','Around standing part','Back through loop','Dress and set']},
    {id:'square', title:'Square Knot', summary:'Join two ends; not for critical loads', steps:['Right over left','Left over right','Dress flat']},
    {id:'clove', title:'Clove Hitch', summary:'Quick hitch for posts; add backup', steps:['Wrap post','Cross over','Tuck under']}
  ],
  lashings: [
    {id:'square-lash', title:'Square Lashing', summary:'Bind two spars at right angle', steps:['Cross spars at 90°','Make 3–4 wrapping turns','Make frapping turns between spars','Finish with clove hitch']},
    {id:'diagonal-lash', title:'Diagonal Lashing', summary:'Close gap between crossing spars', steps:['Cross spars','Make diagonal wraps','Frap tight','Finish neat']},
    {id:'shear-lash', title:'Shear Lashing', summary:'Join parallel poles for handles', steps:['Overlap ends','Wrap several turns','Finish with reef knot']}
  ],
  fire: [
    {id:'triangle', title:'Fire Triangle', summary:'Heat + Fuel + Oxygen', bullets:['Clear site 3m','Keep water and shovel','Extinguish fully: drown, stir, feel cold']},
    {id:'teepee', title:'Teepee Fire', summary:'Good for starting quickly', bullets:['Tinder center','Kindling cone','Light through doorway']}
  ],
  nav: [
    {id:'utm-guide', title:'UTM Guide', summary:'UTM = zone easting northing. Example: 11S 430000 3762000', bullets:['Zone number + hemisphere','Use proj4 for conversions']},
    {id:'compass', title:'Compass Basics', summary:'Hold flat; set bearing; red in shed = aligned'}
  ],
  tracking: [
    {id:'paw', title:'Paw Tracking', summary:'Measure width, length, stride. Include scale (coin or ruler) in photo.'}
  ],
  songs: [
    {id:'boom', title:'Boom Chicka Boom', summary:'Call & response warm-up.'},
    {id:'quarter', title:"The Quartermaster's Store", summary:'Silly verses, add items.'}
  ]
};

// Utilities
function el(id){ return document.getElementById(id); }
function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

// App init
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tabs button').forEach(btn=>{
    btn.addEventListener('click', ()=>{ setActive(btn.dataset.tab); });
  });
  el('search').addEventListener('input', e=>renderSearch(e.target.value));
  setActive('home');
  registerSW();
  setupMap();
  setupInstallPrompt();
});

// Tab rendering
function setActive(tab){
  document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));
  const b = document.querySelector(`.tabs button[data-tab="${tab}"]`);
  if(b) b.classList.add('active');
  renderTab(tab);
}

function renderTab(tab){
  const content = el('content');
  if(tab === 'home'){ content.innerHTML = homeHTML(); if(window._map) setTimeout(()=>window._map.invalidateSize(),300); return; }
  if(tab === 'notes'){ renderNotes(); return; }
  if(tab === 'tools'){ renderTools(); return; }
  const items = DATA[tab] || [];
  let html = `<div class="card"><h2>${capitalize(tab)}</h2></div>`;
  if(items.length){
    html += '<div class="grid">';
    for(const it of items){
      html += `<div class="card"><h3>${it.title}</h3><p class="small">${it.summary||''}</p>`;
      if(it.steps) html += `<p class="small"><strong>Steps</strong></p><ol class="small">`+it.steps.map(s=>`<li>${s}</li>`).join('')+`</ol>`;
      if(it.bullets) html += `<ul class="small">`+it.bullets.map(b=>`<li>${b}</li>`).join('')+`</ul>`;
      html += `<div style="margin-top:8px"><button class="btn" onclick="saveFav('${it.id}','${it.title}')">☆ Favorite</button></div>`;
      html += `</div>`;
    }
    html += '</div>';
  } else html += `<div class="card"><p class="small">Content coming soon.</p></div>`;
  content.innerHTML = html;
}

// Home
function homeHTML(){
  return `
    <div class="card"><h2>Welcome, Scouter</h2><p class="small">Tap tabs to explore knots, lashings, navigation, tracking, first aid, songs and tools.</p></div>
    <div class="grid">
      <div class="card">
        <h3>Quick Tools</h3>
        <div id="map" style="height:260px" class="card"></div>
        <div style="margin-top:8px"><button class="btn" onclick="locateMe()">Center on me</button></div>
      </div>
      <div class="card">
        <h3>Ten Essentials</h3>
        <ul class="small"><li>Navigation</li><li>Headlamp</li><li>Sun protection</li><li>First aid</li><li>Knife/repair</li><li>Fire</li><li>Shelter</li><li>Extra food</li><li>Extra water</li><li>Extra clothes</li></ul>
      </div>
    </div>
  `;
}

// Search
function renderSearch(q){
  q = q.trim().toLowerCase();
  if(!q){ setActive('home'); return; }
  const results = [];
  for(const key in DATA){
    for(const it of DATA[key]){
      const text = (it.title + ' ' + (it.summary||'') + ' ' + (it.steps||[]).join(' ')).toLowerCase();
      if(text.includes(q)) results.push({...it,section:key});
    }
  }
  let html = `<div class="card"><h2>Search results for "${q}"</h2></div>`;
  if(results.length){
    html += '<div class="grid">';
    for(const r of results){
      html += `<div class="card"><h3>${r.title}</h3><p class="small">${r.summary||''}</p><p class="small">Section: ${r.section}</p><div style="margin-top:8px"><button class="btn" onclick="saveFav('${r.id}','${r.title}')">☆ Favorite</button></div></div>`;
    }
    html += '</div>';
  } else html += `<div class="card"><p class="small">No results</p></div>`;
  el('content').innerHTML = html;
}

// Favorites
function saveFav(id,title){
  const favs = JSON.parse(localStorage.getItem('scout_favs')||'{}');
  favs[id]=title;
  localStorage.setItem('scout_favs',JSON.stringify(favs));
  alert('Saved to favorites');
}

// Notes
function renderNotes(){
  const v = localStorage.getItem('scout_notes')||'';
  el('content').innerHTML = `<div class="card"><h2>Notes</h2><textarea id="notesArea">${v}</textarea><div style="margin-top:8px"><button class="btn" onclick="saveNotes()">Save</button></div></div>`;
}
function saveNotes(){ const v=el('notesArea').value; localStorage.setItem('scout_notes',v); alert('Notes saved'); }

// Tools (back-bearing, UTM conversion)
function renderTools(){
  el('content').innerHTML = `<div class="card"><h2>Tools</h2>
    <div class="card"><h3>Back Bearing</h3><input id="bearing" placeholder="Bearing in degrees"/><button class="btn" onclick="calcBack()">Compute</button><div id="backRes" class="small"></div></div>
    <div class="card"><h3>UTM → Lat/Lon</h3><input id="utmIn" placeholder="e.g. 11S 430000 3762000"/><button class="btn" onclick="utmToLatLon()">Convert</button><div id="utmRes" class="small"></div></div>
    <div class="card"><h3>Capture Track Photo</h3><button class="btn" onclick="captureTrack()">Capture</button></div>
  </div>`;
}
function calcBack(){ const b=Number(el('bearing').value); if(isFinite(b)){ const res = ((b+180)%360+360)%360; el('backRes').innerText = 'Back bearing: '+res+'°'; } }
function utmToLatLon(){
  const v = el('utmIn').value.trim();
  if(!v){ alert('Enter UTM like: 11S 430000 3762000'); return; }
  // parse zone easting northing
  const parts = v.split(/\s+/);
  if(parts.length<3){ alert('Bad format'); return; }
  const zone = parts[0].toUpperCase();
  const zoneNum = parseInt(zone,10);
  const northing = parseFloat(parts[2]);
  const easting = parseFloat(parts[1]);
  // build proj4 def
  const south = zone.endsWith('S');
  const def = `+proj=utm +zone=${zoneNum} +datum=WGS84 +units=m +no_defs ${south?'+south':''}`;
  try{
    const ll = proj4(def, 'EPSG:4326', [easting, northing]);
    el('utmRes').innerText = `Lat: ${ll[1].toFixed(6)}, Lon: ${ll[0].toFixed(6)}`;
  }catch(e){ el('utmRes').innerText = 'Conversion error: '+e.message; }
}

// Camera / tracking capture (basic)
async function captureTrack(){
  // open small camera UI in content area
  el('content').innerHTML = `<div class="card"><h2>Capture Track Photo</h2><video id="cam" autoplay playsinline style="width:100%;background:#000"></video><div style="margin-top:8px"><button class="btn" id="snap">Snap</button></div><canvas id="pv" style="display:none"></canvas></div>`;
  const video = el('cam');
  try{
    const s = await navigator.mediaDevices.getUserMedia({ video:{facingMode:'environment'} });
    video.srcObject = s;
    document.getElementById('snap').addEventListener('click', ()=>{
      const canvas = el('pv');
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d'); ctx.drawImage(video,0,0);
      const data = canvas.toDataURL('image/png');
      el('content').innerHTML = `<div class="card"><h3>Captured</h3><img src="${data}" style="width:100%"/><p class="small">Include a coin/ruler for scale. Note measurement in Notes.</p></div>`;
      s.getTracks().forEach(t=>t.stop());
    });
  }catch(e){ alert('Camera access failed: '+(e.message||e)); }
}

// Map setup (Leaflet)
function setupMap(){
  try{
    const mapDiv = document.getElementById('map');
    if(!mapDiv) return;
    const map = L.map('map').setView([33.6846,-117.8265],11);
    window._map = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OSM'}).addTo(map);
    map.on('click', e=>{
      const lat = e.latlng.lat, lon = e.latlng.lng;
      const utm = latlonToUTM([lon,lat]);
      L.popup().setLatLng(e.latlng).setContent(`Lat: ${lat.toFixed(5)}<br/>Lon: ${lon.toFixed(5)}<br/>UTM: ${utm}`).openOn(map);
    });
  }catch(err){ console.warn('Map init failed',err); }
}

// lat/lon -> UTM via proj4
function latlonToUTM(ll){
  try{
    const lon = ll[0], lat = ll[1];
    const zone = Math.floor((lon + 180)/6) + 1;
    const south = lat < 0;
    const def = `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs ${south?'+south':''}`;
    const res = proj4('EPSG:4326', def, [lon,lat]);
    return `${zone}${south?'S':'N'} ${Math.round(res[0])} ${Math.round(res[1])}`;
  }catch(e){ return 'UTM error'; }
}

// locate user
function locateMe(){
  if(navigator.geolocation) navigator.geolocation.getCurrentPosition(p=>{ window._map.setView([p.coords.latitude,p.coords.longitude],14); }, e=>alert('Location failed: '+e.message));
  else alert('Geolocation not supported');
}

// Service worker (register)
function registerSW(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('service-worker.js')
      .then(()=>console.log('SW registered'))
      .catch(e=>console.warn('SW failed',e));
  }
}

// Install prompt (for Android/Chromium); iOS users get instructions
let deferredPrompt;
function setupInstallPrompt(){
  const btn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferredPrompt = e;
    btn.classList.remove('hidden');
    btn.addEventListener('click', async ()=>{
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      btn.classList.add('hidden');
      deferredPrompt = null;
    });
  });
  // iOS hint
  if(/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())){
    const hint = document.createElement('div'); hint.className='card small'; hint.innerHTML = '<strong>iPhone:</strong> Open this site in Safari → Share → Add to Home Screen to install.';
    document.querySelector('.container').prepend(hint);
  }
}
