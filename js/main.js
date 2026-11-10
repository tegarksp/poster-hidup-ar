import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-image-three';

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
    imageTargetSrc: 'assets/targets/targets1.mind',
    uiLoading: 'no', uiScanning: 'no', uiError: 'no'
  });
  const { renderer, scene, camera } = mindarThree;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));

  const loader = new GLTFLoader();
  const clock = new THREE.Clock();
  const scanned = new Set(loadScanned());
  const items = []; // { anchor, model, mixer, idleAction, aksiAction, data }

  for (const t of targets) {
    const anchor = mindarThree.addAnchor(t.index);

    let gltf;
    try { gltf = await loader.loadAsync(t.model); }
    catch { return showError('Gagal memuat model: ' + t.model); }

    const model = gltf.scene;
    model.scale.setScalar(t.skala ?? 0.5);
    anchor.group.add(model);

    const mixer = new THREE.AnimationMixer(model);
    const find = n => gltf.animations.find(a => a.name === n);
    const idleClip = find(t.animasiIdle) || gltf.animations[0];
    const aksiClip = find(t.animasiAksi);
    const idleAction = idleClip ? mixer.clipAction(idleClip) : null;
    const aksiAction = aksiClip ? mixer.clipAction(aksiClip) : null;
    idleAction?.play();
    if (aksiAction) aksiAction.setLoop(THREE.LoopOnce, 1);

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

    items.push({ anchor, model, mixer, idleAction, aksiAction, data: t });
  }

  // ---------- Ketuk: putar animasi aksi ----------
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const canvas = renderer.domElement;

  canvas.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    for (const it of items) {
      if (!it.anchor.group.visible || !it.aksiAction) continue;
      if (raycaster.intersectObject(it.model, true).length) {
        it.aksiAction.reset().play();
        if (navigator.vibrate) navigator.vibrate(30);
      }
    }
  });

  // ---------- Cubit: perbesar/perkecil ----------
  let startDist = 0;
  const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const baseScale = new Map(items.map(it => [it, it.model.scale.x]));

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      startDist = dist(e.touches);
      items.forEach(it => baseScale.set(it, it.model.scale.x));
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && startDist) {
      const factor = dist(e.touches) / startDist;
      items.forEach(it => {
        const s = THREE.MathUtils.clamp(baseScale.get(it) * factor, 0.1, 3);
        it.model.scale.setScalar(s);
      });
    }
  }, { passive: true });

  canvas.addEventListener('touchend', () => { startDist = 0; });

  // ---------- Nyalakan kamera ----------
  try {
    await mindarThree.start();
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return showError(`AR gagal dimulai. Periksa izin kamera dan file target AR. Detail: ${detail}`);
  }

  setStatus('Mencari target...');
  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta();
    items.forEach(it => it.mixer.update(dt));
    renderer.render(scene, camera);
  });
}

// ---------- Jalankan ----------
init();