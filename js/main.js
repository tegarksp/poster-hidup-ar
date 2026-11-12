import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-image-three';
document.title = 'Poster Hidup v18';

// ---------- Elemen HTML ----------
const statusEl = document.getElementById('status');
const panel = document.getElementById('info-panel');
const errorBox = document.getElementById('error-box');
const startBtn = document.getElementById('start-btn');

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove('hidden');
}

function setStatus(text, found = false) {
  statusEl.textContent = text;
  statusEl.classList.toggle('found', found);
}

// ---------- Penyimpanan lokal ----------
const KEY = 'poster-hidup:dipindai';
function loadScanned() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
function saveScanned(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}

// ---------- Muat data JSON + validasi ----------
async function loadTargets() {
  const res = await fetch('data/targets.json');
  if (!res.ok) throw new Error('Gagal memuat targets.json');
  const data = await res.json();
  if (!Array.isArray(data.targets) || data.targets.length === 0)
    throw new Error('Data target kosong atau format salah');
  for (const t of data.targets) {
    for (const f of ['index', 'id', 'judul', 'deskripsi', 'model']) {
      if (t[f] === undefined)
        throw new Error(`Field "${f}" hilang pada target ${t.id ?? '?'}`);
    }
  }
  return data.targets;
}

// ---------- Audio ----------
const sounds = {};
function prepareAudio(targets) {
  for (const t of targets) {
    if (t.audio) {
      const a = new Audio(t.audio);
      a.preload = 'auto';
      sounds[t.id] = a;
    }
  }
}
// Browser HP hanya mengizinkan suara setelah ada sentuhan pengguna,
// jadi "kunci" dibuka saat tombol Mulai diketuk.
function unlockAudio() {
  Object.values(sounds).forEach(a => {
    a.muted = true;
    a.play()
      .then(() => { a.pause(); a.currentTime = 0; a.muted = false; })
      .catch(() => { a.muted = false; });
  });
}

// ---------- Langkah 1: init (muat data, tampilkan tombol) ----------
async function init() {
  let targets;
  try { targets = await loadTargets(); }
  catch (e) { return showError(e.message); }

  prepareAudio(targets);
  setStatus('Siap. Ketuk tombol untuk memulai kamera');
  startBtn.classList.remove('hidden');
  startBtn.addEventListener('click', () => {
    startBtn.classList.add('hidden');
    unlockAudio();
    startAR(targets);
  }, { once: true });
}

// ---------- Langkah 2: startAR (dulu bernama start) ----------
async function startAR(targets) {
  const mindarThree = new MindARThree({
    container: document.getElementById('ar-container'),
    imageTargetSrc: 'assets/targets/targets.mind',
    uiLoading: 'no', uiScanning: 'no', uiError: 'no'
  });
  const { renderer, scene, camera } = mindarThree;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));

  const loader = new GLTFLoader();
  const clock = new THREE.Clock();
  const scanned = new Set(loadScanned());
  const items = []; // { anchor, model, mixer, idleAction, aksiAction, data }

  for (const [i, t] of targets.entries()) {
    setStatus(`Memuat model ${i + 1} dari ${targets.length}...`);
    const anchor = mindarThree.addAnchor(t.index);

    let gltf;
    try { gltf = await loader.loadAsync(t.model); }
    catch { return showError('Gagal memuat model: ' + t.model); }

    const model = gltf.scene;
    model.scale.setScalar(t.skala ?? 0.5);
    anchor.group.add(model);

    const mixer = new THREE.AnimationMixer(model);
    const find = n => (n ? gltf.animations.find(a => a.name === n) : undefined);

    // Idle HANYA jika "animasiIdle" diisi di targets.json.
    // Jika dikosongkan, model diam saat discan dan baru bergerak saat diketuk.
    let idleClip = find(t.animasiIdle) || null;
    // Klip aksi: sesuai "animasiAksi", atau klip pertama yang bukan idle
    const aksiClip = find(t.animasiAksi)
      || gltf.animations.find(a => a !== idleClip)
      || null;
    if (idleClip && idleClip === aksiClip) idleClip = null;

    const idleAction = idleClip ? mixer.clipAction(idleClip) : null;
    const aksiAction = aksiClip ? mixer.clipAction(aksiClip) : null;

    // Tahan model di frame pertama klip aksi (pose diam)
    const diamkan = () => {
      if (!aksiAction) return;
      aksiAction.reset().play();
      aksiAction.paused = true;
    };

    idleAction?.play();
    if (aksiAction) {
      aksiAction.setLoop(THREE.LoopOnce, 1);
      aksiAction.clampWhenFinished = true;
      if (!idleAction) diamkan();
      mixer.addEventListener('finished', (event) => {
        if (event.action !== aksiAction) return;
        if (idleAction) {
          aksiAction.fadeOut(0.15);
          idleAction.reset().fadeIn(0.15).play();
        } else {
          diamkan(); // selesai: kembali diam, siap diketuk lagi
        }
      });
    }

    anchor.onTargetFound = () => {
      setStatus('Target ditemukan: ' + t.judul, true);
      document.getElementById('info-judul').textContent = t.judul;
      document.getElementById('info-deskripsi').textContent = t.deskripsi;
      const a = document.getElementById('info-tautan');
      if (t.tautan) { a.href = t.tautan; a.classList.remove('hidden'); }
      else a.classList.add('hidden');
      panel.classList.remove('hidden');

      scanned.add(t.id);
      saveScanned([...scanned]);

      sounds[t.id]?.play().catch(() => {});
    };

    anchor.onTargetLost = () => {
      setStatus('Mencari target...');
      panel.classList.add('hidden');

      const s = sounds[t.id];
      if (s) { s.pause(); s.currentTime = 0; }
    };

    items.push({
      anchor, model, mixer, idleAction, aksiAction, data: t, tapAnimation: null,
      rotasiAwal: model.rotation.y,
      posYAwal: model.position.y,
      skalaAwal: model.scale.x
    });
  }

  // ---------- Interaksi sentuh: ketuk dan cubit ----------
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const canvas = renderer.domElement;
  canvas.style.touchAction = 'none';

  function itemAt(x, y) {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((x - r.left) / r.width) * 2 - 1;
    pointer.y = -((y - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    for (const it of items) {
      if (!it.anchor.group.visible) continue;
      if (raycaster.intersectObject(it.model, true).length) return it;
    }
    return null;
  }

  function playAction(item) {
    if (item.aksiAction) {
      item.idleAction?.fadeOut(0.12);
      item.aksiAction.reset().fadeIn(0.12).play();
    } else {
      item.tapAnimation = { startedAt: performance.now(), startRotation: item.rotasiAwal };
    }
    if (navigator.vibrate) navigator.vibrate(30);
  }

  const activePointers = new Map();
  let tapCandidate = null;
  let pinchSession = null;
  let suppressTap = false;
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    canvas.setPointerCapture(e.pointerId);
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.size === 1) {
      tapCandidate = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, item: itemAt(e.clientX, e.clientY) };
      return;
    }

    if (activePointers.size === 2) {
      suppressTap = true;
      tapCandidate = null;
      const points = [...activePointers.values()];
      const midpoint = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
      const item = itemAt(midpoint.x, midpoint.y) || items.find(it => it.anchor.group.visible);
      pinchSession = item ? {
        pointerIds: [...activePointers.keys()],
        item,
        startDistance: Math.max(distance(points[0], points[1]), 1),
        startScale: item.model.scale.x
      } : null;
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!activePointers.has(e.pointerId)) return;
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (tapCandidate?.pointerId === e.pointerId &&
        Math.hypot(e.clientX - tapCandidate.x, e.clientY - tapCandidate.y) > 10) {
      tapCandidate = null;
    }

    if (!pinchSession || !pinchSession.pointerIds.every(id => activePointers.has(id))) return;
    const points = pinchSession.pointerIds.map(id => activePointers.get(id));
    const factor = distance(points[0], points[1]) / pinchSession.startDistance;
    const scale = THREE.MathUtils.clamp(
      pinchSession.startScale * factor,
      pinchSession.item.skalaAwal * 0.3,
      pinchSession.item.skalaAwal * 4
    );
    pinchSession.item.model.scale.setScalar(scale);
  });

  function finishPointer(e) {
    if (e.type === 'pointerup' && tapCandidate?.pointerId === e.pointerId && !suppressTap) {
      const item = itemAt(e.clientX, e.clientY) || tapCandidate.item;
      if (item) playAction(item);
    }
    activePointers.delete(e.pointerId);
    tapCandidate = null;
    if (activePointers.size < 2) pinchSession = null;
    if (activePointers.size === 0) suppressTap = false;
  }

  canvas.addEventListener('pointerup', finishPointer);
  canvas.addEventListener('pointercancel', finishPointer);

  // ---------- Nyalakan kamera ----------
  if (!window.isSecureContext) {
    return showError('Kamera membutuhkan koneksi aman. Buka halaman melalui HTTPS atau localhost.');
  }
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
    return showError('Browser tidak menyediakan akses kamera. Buka halaman melalui HTTPS atau localhost, lalu coba browser lain.');
  }

  setStatus('Menyalakan kamera dan menyiapkan pelacak...');
  const pengingat = setTimeout(() => {
    setStatus('Masih menyiapkan pelacak... mohon tunggu');
  }, 8000);

  try {
    await mindarThree.start();
    clearTimeout(pengingat);
  } catch (e) {
    clearTimeout(pengingat);
    console.error('AR gagal:', e, 'tipe:', typeof e);
    const nama = e?.name;
    if (nama === 'NotAllowedError') {
      return showError('Izin kamera ditolak. Izinkan akses kamera lalu muat ulang halaman.');
    }
    if (nama === 'NotFoundError') {
      return showError('Kamera tidak ditemukan di perangkat ini.');
    }
    if (nama === 'NotReadableError') {
      return showError('Kamera sedang dipakai aplikasi lain.');
    }
    return showError('Kamera gagal dimulai. Izinkan akses kamera untuk situs ini, tutup aplikasi lain yang memakai kamera, lalu coba lagi. MindAR tidak memberikan detail error dari browser.');
  }

  setStatus('Mencari target...');
  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta();
    items.forEach(it => {
      it.mixer.update(dt);
      const now = performance.now();
      if (it.tapAnimation) {
        // Aksi ketuk buatan kode (model tanpa klip aksi): putar 360 derajat + melompat
        const progress = Math.min((now - it.tapAnimation.startedAt) / 700, 1);
        const eased = 1 - (1 - progress) ** 3;
        it.model.rotation.y = it.tapAnimation.startRotation + Math.PI * 2 * eased;
        it.model.position.y = it.posYAwal + Math.sin(progress * Math.PI) * 0.08;
        if (progress === 1) it.tapAnimation = null;
      }
    });
    renderer.render(scene, camera);
  });
}

// ---------- Jalankan ----------
init();