
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

let data = {
  albums: [],
  photos: [],
  videos: [],
  gaussians: []
};

let activeSparkViewer = null;
let sparkImportPromise = null;

const fallbackAlbumImages = [
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515542622104-9b7c9c2c3b0f?auto=format&fit=crop&w=800&q=80"
];

const fallbackPhotos = [
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&w=700&q=80"
];

// Spark imports are configured here so index.html does not need changing.


async function loadSpark() {
  if (sparkImportPromise) return sparkImportPromise;

  sparkImportPromise = (async () => {
    const [THREE, Spark, controls] = await Promise.all([
      import('three'),
      import('@sparkjsdev/spark'),
      import('three/addons/controls/OrbitControls.js')
    ]);

    return {
      THREE,
      Spark,
      OrbitControls: controls.OrbitControls
    };
  })();

  return sparkImportPromise;
}



async function loadManifest() {
  try {
    const r = await fetch('assets.json');
    if (r.ok) data = await r.json();
  } catch (e) {
    console.info('Using demo placeholders until assets.json is available.');
  }
}

function photoURL(p) {
  return p.src || p.path || p.file || '';
}

function renderAlbums() {
  const grid = $('#album-grid');
  grid.innerHTML = '';

  data.albums.forEach((a, i) => {
    let cover = a.cover || fallbackAlbumImages[i % 4];

    const card = document.createElement('article');
    card.className = 'album-card';

    card.innerHTML = `
      <div class="album-cover">
        <img loading="lazy" src="${cover}" alt="">
      </div>
      <div class="album-name">${esc(a.title || a.name || 'Album')}</div>
      <div class="album-count">${esc(a.count || `${(a.items || []).length} items`)}</div>
    `;

    card.onclick = () => openAlbum(a);
    grid.append(card);
  });

  const add = document.createElement('div');

  add.innerHTML = `
    <div class="new-album">
      <div class="plus">＋</div>
    </div>
    <div class="new-album-caption">New Album</div>
  `;

  add.onclick = () => alert(
    'Create an album by adding an entry in assets.json. GitHub Pages is static, so edits are committed to your repository.'
  );

  grid.append(add);
}

function renderPhotos() {
  const grid = $('#photo-grid');
  grid.innerHTML = '';

  let list = data.photos.length
    ? data.photos
    : fallbackPhotos.map((src, i) => ({
        src,
        title: [
          'Paris street',
          'Along the Seine',
          'Eiffel Tower',
          'Parisian balconies',
          'Evening sky',
          'Montmartre'
        ][i]
      }));

  list.slice(0, 18).forEach(p => {
    const src = photoURL(p);
    const t = document.createElement('div');

    t.className = 'photo-tile';
    t.innerHTML = `<img loading="lazy" src="${src}" alt="${esc(p.title || 'Photo')}">`;

    t.onclick = () => openMedia(src, 'image');
    grid.append(t);
  });
}

function renderVideos() {
  const grid = $('#video-grid');
  grid.innerHTML = '';

  data.videos.slice(0, 4).forEach(v => {
    const t = document.createElement('div');

    t.className = 'photo-tile';
    t.innerHTML = `
      <video preload="none" muted playsinline poster="${v.thumbnail || ''}">
        <source src="${photoURL(v)}">
      </video>
      <span class="tile-label">▶ ${esc(v.title || 'Video')}</span>
    `;

    t.onclick = () => openMedia(photoURL(v), 'video');
    grid.append(t);
  });

  if (!data.videos.length) {
    grid.innerHTML = '<div class="empty">Add video entries to assets.json to display them here.</div>';
  }
}

function renderSplats() {
  const grid = $('#splat-grid');
  grid.innerHTML = '';

  data.gaussians.forEach((g, i) => {
    const c = document.createElement('article');

    c.className = 'splat-card';

    c.innerHTML = `
      <div class="splat-preview">
        ${g.thumbnail ? `<img loading="lazy" src="${g.thumbnail}" alt="">` : ''}
        <div class="splat-overlay">Open spatial viewer</div>
      </div>
      <div class="splat-meta">
        <div class="splat-title">${esc(g.title || g.name || `Spatial memory ${i + 1}`)}</div>
        <div class="splat-sub">${esc(g.location || 'Gaussian splat')}</div>
      </div>
    `;

    c.onclick = () => openSplat(g);
    grid.append(c);
  });

  if (!data.gaussians.length) {
    grid.innerHTML = '<div class="empty">Add Gaussian files to the gaussians folder and list them in assets.json.</div>';
  }
}

function renderPlaces() {
  const places = [
    ...new Set(data.albums.map(a => a.location || a.title).filter(Boolean))
  ];

  $('#places').innerHTML = places.map(p => `
    <button class="place" data-place="${esc(p)}">
      <span class="pin">♧</span>${esc(p)}
    </button>
  `).join('');

  $$('.place').forEach(b => {
    b.onclick = () => {
      const place = b.dataset.place;
      const albums = data.albums.filter(
        a => (a.location || a.title) === place
      );

      if (albums.length) openAlbum(albums[0]);
    };
  });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function openAlbum(a) {
  const items = a.items || [];

  let content = `
    <div style="color:white;max-width:90vw">
      <h2>${esc(a.title || a.name)}</h2>
      <div class="photo-grid" style="grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">
  `;

  items.forEach(it => {
    content += `
      <div class="photo-tile">
        <img src="${photoURL(it)}" alt="" data-src="${photoURL(it)}">
      </div>
    `;
  });

  content += '</div></div>';

  showModal(content);

  $$('#modal-content img').forEach(im => {
    im.onclick = () => openMedia(im.dataset.src, 'image');
  });
}

function showModal(html) {
  disposeSparkViewer();

  $('#modal-content').innerHTML = html;
  $('#modal').classList.remove('hidden');
}

function disposeSparkViewer() {
  if (!activeSparkViewer) return;

  const v = activeSparkViewer;

  try {
    window.removeEventListener('resize', v.resizeHandler);
    v.renderer.setAnimationLoop(null);
    v.controls.dispose();
    v.splats.dispose();
    v.spark.dispose();
    v.renderer.dispose();
    v.canvas.remove();
  } catch (e) {
    console.warn('Viewer cleanup:', e);
  }

  activeSparkViewer = null;
}

function closeModal() {
  disposeSparkViewer();

  $('#modal').classList.add('hidden');
  $('#modal-content').innerHTML = '';
}

function openMedia(src, type) {
  showModal(
    type === 'video'
      ? `<video controls autoplay src="${src}"></video>`
      : `<img src="${src}" alt="">`
  );
}

async function openSplat(g) {
  const src = photoURL(g);

  showModal(`
    <div class="viewer-shell" id="viewer">
      <div class="viewer-status" id="viewer-status">Spatial view · Ready</div>
      <div class="viewer-error" id="viewer-welcome">
        <div>
          <h2>${esc(g.title || 'Spatial memory')}</h2>
          <p>Explore this place in 3D.</p>
          <button class="viewer-toolbar" id="optimize">Open spatial memory</button>
        </div>
      </div>
    </div>
  `);

  $('#optimize').onclick = () => loadSplatScene(src);
}

async function loadSplatScene(src) {
  const welcome = $('#viewer-welcome');
  const status = $('#viewer-status');

  if (!src) {
    welcome.innerHTML = '<p>No file path is set. Edit assets.json.</p>';
    return;
  }

  status.textContent = 'Starting viewer…';

  welcome.innerHTML = `
    <div style="width:100%">
      <div class="loading-bar"></div>
      <p style="padding:20px">Loading spatial memory…</p>
    </div>
  `;

  let THREE;
  let Spark;
  let renderer;
  let controls;
  let splats;
  let spark;
  let canvas;

  try {
    ({ THREE, Spark, OrbitControls } = await loadSpark());

    const shell = $('#viewer');

    if (!shell) throw new Error('Viewer container not found.');

    const width = shell.clientWidth || 800;
    const height = shell.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(
      60,
      width / height,
      0.01,
      10000
    );

    camera.position.set(0, 0, 4);

    canvas = document.createElement('canvas');

    canvas.style.cssText = `
      position:absolute;
      inset:0;
      width:100%;
      height:100%;
      display:block;
      touch-action:none;
    `;

    shell.appendChild(canvas);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance'
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);

    spark = new Spark.SparkRenderer({ renderer });
    scene.add(spark);


    controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;

    status.textContent = 'Downloading Gaussian scene…';

    // Spark directly supports SPZ, PLY, SPLAT, KSPLAT and other formats.
    splats = new Spark.SplatMesh({
      url: src,
      lod: true
    });

    scene.add(splats);

    await splats.initialized;

    // Automatically frame the loaded scene.
    const bounds = splats.getBoundingBox();
    const sphere = bounds.getBoundingSphere(new THREE.Sphere());

    const center = sphere.center;
    const radius = Math.max(sphere.radius, 0.5);
    const distance = radius * 2.8;

    camera.position.set(
      center.x,
      center.y,
      center.z + distance
    );

    camera.near = Math.max(radius / 1000, 0.001);
    camera.far = radius * 100;
    camera.updateProjectionMatrix();

    controls.target.copy(center);
    controls.update();

    const resizeHandler = () => {
      if (!$('#viewer')) return;

      const w = shell.clientWidth;
      const h = shell.clientHeight;

      if (!w || !h) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', resizeHandler);

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    activeSparkViewer = {
      renderer,
      controls,
      splats,
      spark,
      canvas,
      resizeHandler
    };

    status.textContent = 'Drag to orbit · Scroll to zoom';
    welcome.remove();

  } catch (err) {
    console.error('Spark viewer error:', err);

    if (renderer) renderer.setAnimationLoop(null);
    if (controls) controls.dispose();
    if (splats) splats.dispose();
    if (spark) spark.dispose();
    if (renderer) renderer.dispose();
    if (canvas) canvas.remove();

    activeSparkViewer = null;

    const currentWelcome = $('#viewer-welcome');

    if (currentWelcome) {
      currentWelcome.innerHTML = `
        <div>
          <h3>Could not load spatial memory</h3>
          <p>Check the file path and browser console.</p>
          <small>${esc(err.message)}</small>
        </div>
      `;
    }

    if (status) status.textContent = 'Viewer error';
  }
}

function renderView(v) {
  if (v === 'search') {
    mainSearch();
    return;
  }

  if (v === 'albums') {
    renderAlbums();
    $('#main').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  if (v === 'photos') {
    renderPhotos();
    return;
  }

  if (v === 'gaussians') {
    renderSplats();
    return;
  }

  if (v === 'videos') {
    renderVideos();
    return;
  }
}

function mainSearch() {
  const main = $('#main');

  main.innerHTML = `
    <div class="search-view">
      <h1>Search</h1>
      <input class="search-input" id="searchbox" placeholder="Search photos, albums, places…">
      <div id="search-results"></div>
    </div>
  `;

  $('#searchbox').oninput = e => {
    const q = e.target.value.toLowerCase();

    const results = [
      ...data.albums.map(a => ({
        title: a.title,
        kind: 'Album',
        cover: a.cover
      })),
      ...data.photos.map(p => ({
        title: p.title,
        kind: 'Photo',
        cover: photoURL(p)
      })),
      ...data.gaussians.map(g => ({
        title: g.title,
        kind: 'Spatial memory',
        cover: g.thumbnail
      }))
    ].filter(x => (x.title || '').toLowerCase().includes(q));

    $('#search-results').innerHTML = results.map(x => `
      <div class="place">${x.kind} · ${esc(x.title)}</div>
    `).join('');
  };
}

$('#close-modal').onclick = closeModal;

$('#modal').onclick = e => {
  if (e.target.id === 'modal') closeModal();
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

$$('.navitem[data-view]').forEach(b => {
  b.onclick = () => {
    $$('.navitem').forEach(x => x.classList.remove('active'));
    b.classList.add('active');

    if (b.dataset.view === 'library') {
      location.reload();
    } else {
      renderView(b.dataset.view);
    }
  };
});

$$('.seeall').forEach(b => {
  b.onclick = () => renderView(b.dataset.view);
});

(async () => {
  await loadManifest();
  renderAlbums();
  renderPhotos();
  renderSplats();
  renderVideos();
  renderPlaces();
})();
