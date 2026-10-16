// Загрузка Firebase: три источника, таймаут, индикатор
let firebaseAppMod, firestoreMod, authMod;
const CDN_SOURCES = [
"https://www.gstatic.com/firebasejs/12.19.0/",
"https://cdn.jsdelivr.net/npm/firebase@12.19.0/",
"https://unpkg.com/firebase@12.19.0/"
];
const FB_FILES = ["firebase-app.js", "firebase-firestore.js", "firebase-auth.js"];

function importWithTimeout(url, ms = 8000) {
return Promise.race([
import(url),
new Promise((_, rej) => setTimeout(() => rej(new Error('Таймаут: ' + url)), ms))
]);
}

async function loadFirebase() {
let lastError = null;
for (const base of CDN_SOURCES) {
try {
console.log('Пробую источник:', base);
const mods = await Promise.all(FB_FILES.map(f => importWithTimeout(base + f)));
firebaseAppMod = mods[0];
firestoreMod = mods[1];
authMod = mods[2];
return;
} catch (e) {
lastError = e;
console.warn('Источник не ответил за 8 секунд, пробую следующий:', base);
}
}
document.getElementById('appLoader').style.display = 'none';
document.getElementById('loadError').style.display = 'block';
throw lastError;
}

await loadFirebase();
document.getElementById('appLoader').style.display = 'none';

const { initializeApp } = firebaseAppMod;
const { getFirestore, collection, addDoc, doc, setDoc, getDoc, deleteDoc, onSnapshot, query, orderBy } = firestoreMod;
const { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } = authMod;

const firebaseConfig = {
apiKey: "AIzaSyANI2kBCdtQiKgf_tTdm-9AdJw17DRtKPs",
authDomain: "recepts-928b8.firebaseapp.com",
projectId: "recepts-928b8",
storageBucket: "recepts-928b8.firebasestorage.app",
messagingSenderId: "253494978690",
appId: "1:253494978690:web:ff09676a79843aa6712c9b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const recipesCol = collection(db, 'recipes');
const wishlistCol = collection(db, 'wishlist');
const collectionsCol = collection(db, 'collections');

// --- DOM ---
const loginScreen = document.getElementById('loginScreen');
const appDiv = document.getElementById('app');
const loginBtn = document.getElementById('loginBtn');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const fontBtn = document.getElementById('fontBtn');
const randomBtn = document.getElementById('randomBtn');

const titleInput = document.getElementById('recipeTitle');
const categoryInput = document.getElementById('recipeCategory');
const ingredientsInput = document.getElementById('recipeIngredients');
const ingHint = document.getElementById('ingHint');
const dictIngredientsHint = document.getElementById('dictIngredientsHint');
const stepsInput = document.getElementById('recipeSteps');
const dictStepsHint = document.getElementById('dictStepsHint');
const linkInput = document.getElementById('recipeLink');
const familyNoteInput = document.getElementById('recipeFamilyNote');
const imageInput = document.getElementById('recipeImage');
const addRecipeBtn = document.getElementById('addRecipeBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editNotice = document.getElementById('editNotice');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const favOnly = document.getElementById('favOnly');
const favToggle = document.getElementById('favToggle');
const recipesList = document.getElementById('recipesList');
const formTitle = document.getElementById('formTitle');
const collectionsView = document.getElementById('collectionsView');
const collectionsList = document.getElementById('collectionsList');
const createCollectionBtn = document.getElementById('createCollectionBtn');
const collectionModal = document.getElementById('collectionModal');
const collectionName = document.getElementById('collectionName');
const collectionEmoji = document.getElementById('collectionEmoji');
const collectionSaveBtn = document.getElementById('collectionSaveBtn');
const collectionCancelBtn = document.getElementById('collectionCancelBtn');
const pickCollectionModal = document.getElementById('pickCollectionModal');
const pickCollectionList = document.getElementById('pickCollectionList');
const pickCollectionCancelBtn = document.getElementById('pickCollectionCancelBtn');
const modal = document.getElementById('recipeModal');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalGallery = document.getElementById('modalGallery');
const modalIngredients = document.getElementById('modalIngredients');
const modalSteps = document.getElementById('modalSteps');
const modalFamilyNote = document.getElementById('modalFamilyNote');
const modalCookedBy = document.getElementById('modalCookedBy');
const modalMeta = document.getElementById('modalMeta');
const doneBtn = document.getElementById('doneBtn');
const editFromModalBtn = document.getElementById('editFromModalBtn');
const favModalBtn = document.getElementById('favModalBtn');
const cookedModalBtn = document.getElementById('cookedModalBtn');
const ttsBtn = document.getElementById('ttsBtn');
const cookModeBtn = document.getElementById('cookModeBtn');

const portFrom = document.getElementById('portFrom');
const portTo = document.getElementById('portTo');
const scaleBtn = document.getElementById('scaleBtn');

const cookMode = document.getElementById('cookMode');
const cookDishName = document.getElementById('cookDishName');
const cookDots = document.getElementById('cookDots');
const cookStepNum = document.getElementById('cookStepNum');
const cookStepText = document.getElementById('cookStepText');
const cookTimerArea = document.getElementById('cookTimerArea');
const cookPrevBtn = document.getElementById('cookPrevBtn');
const cookNextBtn = document.getElementById('cookNextBtn');
const cookExitBtn = document.getElementById('cookExitBtn');

const timerBanner = document.getElementById('timerBanner');
const timerTime = document.getElementById('timerTime');
const timerStopBtn = document.getElementById('timerStopBtn');

const starsInput = document.getElementById('starsInput');
const reviewName = document.getElementById('reviewName');
const reviewText = document.getElementById('reviewText');
const addReviewBtn = document.getElementById('addReviewBtn');
const reviewsList = document.getElementById('reviewsList');
const closeModalBtn = document.getElementById('closeModalBtn');

const micIngredients = document.getElementById('micIngredients');
const micSteps = document.getElementById('micSteps');
// ===== ПАРАЛЛАКС БАННЕРА =====
const kitchenBanner = document.querySelector('.kitchen-banner');
let bannerScrollRaf = null;
window.addEventListener('scroll', () => {
  if (bannerScrollRaf) return;
  bannerScrollRaf = requestAnimationFrame(() => {
    bannerScrollRaf = null;
    if (!kitchenBanner) return;
    if (window.scrollY > 40) {
      kitchenBanner.classList.add('scrolled');
    } else {
      kitchenBanner.classList.remove('scrolled');
    }
  });
}, { passive: true });
const tabs = document.querySelectorAll('.tab-btn');
let currentView = 'recipes';
let currentRecipeId = null;
let currentCollection = 'recipes';
let currentRecipeData = null;
let allRecipes = [];
let allWishlist = [];
let allCollections = [];
let currentCollectionId = null; // id открытой подборки
let draggedRecipe = null;       // { id, source: 'recipes'|'wishlist' }
let selectedStars = 0;

let editingId = null;
let editingCollection = null;
let editingImages = [];
// ===== TOAST-УВЕДОМЛЕНИЯ =====
function showToast(message, options = {}) {
  const {
    type = 'info',        // 'success' | 'error' | 'info' | 'warn'
    icon = null,
    sub = null,
    duration = 3000
  } = options;

  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' };
  const finalIcon = icon || icons[type] || 'ℹ️';

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${finalIcon}</span>
    <div class="toast-body">
      <span class="toast-title">${escapeHtml(message)}</span>
      ${sub ? `<span class="toast-sub">${escapeHtml(sub)}</span>` : ''}
    </div>
  `;
  container.appendChild(toast);

  // Автоудаление
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 320);
  }, duration);
}
function askCookedBy() {
  const saved = localStorage.getItem('lastCookedBy') || '';
  const who = prompt('Кто приготовил? (имя)', saved);
  if (!who || !who.trim()) return null;
  const name = who.trim();
  localStorage.setItem('lastCookedBy', name);
  return name;
}
// ===== RIPPLE-ЭФФЕКТ =====
function attachRipple(el) {
  el.addEventListener('click', function (e) {
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = (e.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
    const y = (e.clientY || rect.top + rect.height / 2) - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });
}

// Автоматически навешиваем ripple на все кнопки при загрузке
document.addEventListener('click', (e) => {
  const target = e.target.closest('button, .tab-btn, .collection-card, .collection-pick-item');
  if (!target || target.classList.contains('no-ripple')) return;
  // Не навешиваем на уже обработанные через attachRipple (динамические создаются заново)
  if (!target._rippleBound) {
    // Для динамических кнопок — просто визуальный эффект
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  }
});
function escapeHtml(str) {
if (!str) return '';
return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]);
}

function getCategoryClass(cat) {
const map = {
'десерт': 'cat-dessert', 'суп': 'cat-soup', 'салат': 'cat-salad',
'холодная закуска': 'cat-cold-snack', 'горячая закуска': 'cat-hot-snack',
'выпечка сладкая': 'cat-sweet-pastry', 'выпечка не сладкая': 'cat-savory-pastry',
'вторые блюда': 'cat-main', 'гарниры': 'cat-side',
'соусы': 'cat-sauce', 'напитки': 'cat-drink'
};
return map[cat] || '';
}

function getCategoryEmoji(cat) {
const map = {
'десерт': '🍰', 'суп': '🍲', 'салат': '🥗',
'холодная закуска': '🧀', 'горячая закуска': '🥘',
'выпечка сладкая': '🧁', 'выпечка не сладкая': '🥐',
'вторые блюда': '🍖', 'гарниры': '🍚',
'соусы': '🥫', 'напитки': '🥤'
};
return map[cat] || '🍽️';
}

function getImages(r) {
const arr = Array.isArray(r.imagesBase64) ? r.imagesBase64.filter(Boolean) : [];
if (arr.length === 0 && r.imageBase64) arr.push(r.imageBase64);
return arr;
}

function addedDateStr(r) {
try {
if (r.createdAt && r.createdAt.seconds) return new Date(r.createdAt.seconds * 1000).toLocaleDateString('ru-RU');
if (r.createdAt) return new Date(r.createdAt).toLocaleDateString('ru-RU');
} catch (e) {}
return '';
}

function ingredientsToHtml(raw) {
  if (!raw || !raw.trim()) return '';
  // Делим по переносу строки ИЛИ по запятой, за которой НЕ идёт цифра.
  // Это защищает «0,5 кг» от разрезания на «0» и «5 кг».
  const items = raw
    .split(/\n|,(?!\d)/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  if (items.length === 0) return '';
  return `<b>🥕 Ингредиенты:</b><ul class="ingredients-list">${items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
}

// --- Таймеры в шагах ---
function parseTime(text) {
const m = text.match(/(\d+)\s*(мин|минут[аы]?|сек|секунд[аы]?|час[аов]?|ч\b)/i);
if (!m) return null;
const n = parseInt(m[1], 10);
const u = m[2].toLowerCase();
if (u.startsWith('сек')) return n;
if (u.startsWith('час') || u === 'ч') return n * 3600;
return n * 60;
}

function fmtTime(sec) {
const h = Math.floor(sec / 3600);
const m = Math.floor((sec % 3600) / 60);
const s = sec % 60;
if (h) return (m ? `${h} ч ${m} мин` : `${h} ч`);
if (m) return `${m} мин`;
return `${s} сек`;
}

function renderStepsHtml(raw) {
if (!raw || !raw.trim()) return '';
return raw.split('\n').filter(s => s.trim()).map(line => {
const t = parseTime(line);
const esc = escapeHtml(line);
return `<div class="step-line">${esc}${t ? ` <button class="timer-inline" data-sec="${t}">⏱ ${fmtTime(t)}</button>` : ''}</div>`;
}).join('');
}

let timerInterval = null;
function stopGlobalTimer() {
if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
timerBanner.style.display = 'none';
}

function beep() {
try {
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const o = ctx.createOscillator();
const g = ctx.createGain();
o.connect(g); g.connect(ctx.destination);
o.frequency.value = 880;
g.gain.value = 0.25;
o.start();
setTimeout(() => { try { o.stop(); ctx.close(); } catch (e) {} }, 900);
} catch (e) {}
}

function startGlobalTimer(seconds) {
stopGlobalTimer();
let remain = seconds;
timerBanner.style.display = 'flex';
const upd = () => {
const m = Math.floor(remain / 60), s = remain % 60;
timerTime.textContent = `${m}:${String(s).padStart(2, '0')}`;
};
upd();
timerInterval = setInterval(() => {
remain--;
upd();
if (remain <= 0) {
clearInterval(timerInterval); timerInterval = null;
timerTime.textContent = '🔔 Время вышло!';
beep();
try {
const u = new SpeechSynthesisUtterance('Время вышло!');
u.lang = 'ru-RU';
speechSynthesis.speak(u);
} catch (e) {}
setTimeout(() => { timerBanner.style.display = 'none'; }, 6000);
}
}, 1000);
}

timerStopBtn.addEventListener('click', stopGlobalTimer);

// Клик по ⏱ в модалке (делегирование)
modal.addEventListener('click', (e) => {
const btn = e.target.closest('.timer-inline');
if (btn) startGlobalTimer(parseInt(btn.getAttribute('data-sec'), 10));
});

// --- Пересчёт порций ---
function scaleIngredientsText(raw, ratio) {
return raw.replace(/\d+(?:[.,]\d+)?/g, (m) => {
const num = parseFloat(m.replace(',', '.'));
const scaled = Math.round(num * ratio * 100) / 100;
return String(scaled).replace('.', ',');
});
}

scaleBtn.addEventListener('click', () => {
if (!currentRecipeData) return;
const from = parseFloat(portFrom.value) || 4;
const to = parseFloat(portTo.value);
if (!to || to <= 0) { showToast('Укажите количество порций', { type: 'warn' }); return; }
const raw = currentRecipeData.ingredientsShort || '';
if (!raw.trim()) { showToast('Нет списка ингредиентов', { type: 'warn' }); return; }
const ratio = to / from;
modalIngredients.innerHTML =
ingredientsToHtml(scaleIngredientsText(raw, ratio)) +
`<div class="portions-note">Пересчитано на ${to} порц. (вместо ${from}). Это только просмотр — в базе рецепт не изменился. Дробные значения (например, 0,5 ч. л.) можно округлить по вкусу.</div>`;
});

// --- Конфетти ---
function launchConfetti(x, y) {
const colors = ['#f39c12', '#2ecc71', '#e74c3c', '#3498db', '#9b59b6', '#f1c40f', '#e67e22'];
for (let i = 0; i < 20; i++) {
const p = document.createElement('span');
p.className = 'confetti';
const angle = Math.random() * Math.PI * 2;
const dist = 60 + Math.random() * 90;
p.style.left = x + 'px';
p.style.top = y + 'px';
p.style.background = colors[Math.floor(Math.random() * colors.length)];
p.style.width = (6 + Math.random() * 6) + 'px';
p.style.height = (6 + Math.random() * 8) + 'px';
p.style.setProperty('--dx', (Math.cos(angle) * dist) + 'px');
p.style.setProperty('--dy', (Math.sin(angle) * dist - 40) + 'px');
p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
document.body.appendChild(p);
setTimeout(() => p.remove(), 1000);
}
}
// ===== ВЗРЫВ ЭМОДЗИ =====
function launchEmojiBurst(x, y, emojis = ['🎉', '🥳', '✨', '🎊', '🍳', '⭐']) {
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('span');
    el.className = 'emoji-burst';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = x + 'px';
    el.style.top = y + 'px';

    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 120;
    el.style.setProperty('--dx', (Math.cos(angle) * dist) + 'px');
    el.style.setProperty('--dy', (Math.sin(angle) * dist - 60) + 'px');
    el.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }
}

// ===== ЗВУКОВОЙ ЭФФЕКТ (мягкий «динь») =====
function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    // Две ноты: до и ми — приятный аккорд
    const notes = [523.25, 659.25];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);

      const start = now + i * 0.08;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

      osc.start(start);
      osc.stop(start + 0.5);
    });

    setTimeout(() => { try { ctx.close(); } catch (e) {} }, 800);
  } catch (e) { /* звук не критичен */ }
}
// --- Умное заполнение формы ---
function formatIngredients(raw) {
return raw
.split(/\n|,(?!\d)/)
.map(s => s.trim().replace(/^[-•\d.)\s]+/, ''))
.filter(s => s.length > 0)
.map(s => s.charAt(0).toUpperCase() + s.slice(1))
.join('\n');
}

function formatSteps(raw) {
  if (!raw || !raw.trim()) return raw;

  // 1. Заменяем ". Заглавная" на ".\nЗаглавная" — безопаснее, чем split с lookbehind
  const withBreaks = raw.replace(/\.\s+(?=[А-ЯЁA-Z])/g, '.\n');

  // 2. Разбиваем по переносам строк, обрезаем, убираем пустое
  const parts = withBreaks
    .split(/\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (parts.length === 0) return raw;

  // 3. Чистим каждый шаг: убираем старую нумерацию, маркеры, лишние пробелы
  const cleaned = parts
    .map(s => s
      .replace(/^\d+[.)]\s*/, '')   // "1. " или "1) "
      .replace(/^[-•*]\s*/, '')     // "- " или "• "
      .trim()
    )
    .filter(s => s.length > 0);     // ← финальная зачистка пустых

  if (cleaned.length === 0) return raw;

 // 4. Всегда нумеруем заново — от 1 до N
  return cleaned
    .map((l, i) => `${i + 1}. ${l}`)
    .join('\n');
}

function updateIngHint() {
  const items = ingredientsInput.value
    .split(/\n|,(?!\d)/)
    .map(s => s.trim())
    .filter(Boolean);

  if (items.length === 0) {
    ingHint.textContent = '';
  } else {
    ingHint.textContent = `🥕 ${items.length} ${items.length === 1 ? 'ингредиент' : items.length < 5 ? 'ингредиента' : 'ингредиентов'} — по запятым и Enter`;
  }

  // Живое превью
  const preview = document.getElementById('ingredientsPreview');
  if (!preview) return;
  if (items.length === 0) {
    preview.innerHTML = '';
  } else {
    preview.innerHTML = '<div class="preview-title">Так будет выглядеть список:</div>' +
      items.slice(0, 8).map(i =>
        `<span class="preview-chip">${escapeHtml(i)}</span>`
      ).join('') +
      (items.length > 8 ? `<span class="preview-more">+${items.length - 8} ещё</span>` : '');
  }
}

ingredientsInput.addEventListener('input', updateIngHint);

ingredientsInput.addEventListener('blur', () => {
const f = formatIngredients(ingredientsInput.value);
if (f) ingredientsInput.value = f;
updateIngHint();
});
stepsInput.addEventListener('blur', () => {
  const f = formatSteps(stepsInput.value);
  if (f) stepsInput.value = f;
  updateStepsPreview();
});

stepsInput.addEventListener('input', updateStepsPreview);

function updateStepsPreview() {
  const preview = document.getElementById('stepsPreview');
  if (!preview) return;

  const raw = stepsInput.value.trim();
  if (!raw) {
    preview.innerHTML = '';
    return;
  }

  // Временно применяем formatSteps, чтобы увидеть результат
  const formatted = formatSteps(raw);
  const parts = formatted
  .split('\n')
  .map(s => s.trim())
  .filter(s => s.length > 0);

  if (parts.length === 0) {
    preview.innerHTML = '';
    return;
  }

  preview.innerHTML = '<div class="preview-title">Так будет выглядеть (' + parts.length + ' шаг' + (parts.length === 1 ? '' : parts.length < 5 ? 'а' : 'ов') + '):</div>' +
    parts.slice(0, 6).map((p, i) =>
      `<div class="preview-step"><span class="preview-num">${i + 1}</span> ${escapeHtml(p.replace(/^\d+[.)]\s*/, ''))}</div>`
    ).join('') +
    (parts.length > 6 ? `<div class="preview-more">+${parts.length - 6} ещё</div>` : '');
}

// --- Диктовка голосом ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let activeDictation = null;

if (!SpeechRecognition) {
micIngredients.style.display = 'none';
micSteps.style.display = 'none';
}

function stopDictation() {
if (!activeDictation) return;
try { activeDictation.rec.stop(); } catch (e) {}
activeDictation.btn.classList.remove('recording');
activeDictation.btn.textContent = '🎤';
activeDictation.hint.textContent = '';
const f = activeDictation.mode === 'ingredients'
? formatIngredients(activeDictation.textarea.value)
: formatSteps(activeDictation.textarea.value);
if (f) activeDictation.textarea.value = f;
updateIngHint();
activeDictation = null;
}

function startDictation(btn, textarea, hint, mode) {
const rec = new SpeechRecognition();
rec.lang = 'ru-RU';
rec.continuous = true;
rec.interimResults = false;
rec.maxAlternatives = 1;

rec.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      let text = event.results[i][0].transcript.trim();
      if (!text) continue;

      // ===== ШАГИ =====
      if (mode === 'steps') {
        // Заменяем слова-разделители на реальные знаки
        text = text
          .replace(/\bточка\b/gi, '.')
          .replace(/\bточку\b/gi, '.')
          .replace(/\bтчк\b/gi, '.')
          .replace(/\bзапятая\b/gi, ',')
          .replace(/\bзапятую\b/gi, ',');

        // Разбиваем на предложения по точке/!/?
        const sentences = text
          .split(/[.!?]+\s*/)
          .map(s => s.trim())
          .filter(s => s.length > 0);

        if (sentences.length > 0) {
          const newLines = sentences
            .map(s => s.charAt(0).toUpperCase() + s.slice(1))
            .join('\n');
          const current = textarea.value.trim();
          textarea.value = current ? current + '\n' + newLines : newLines;
        }
      } else {
        // ===== ИНГРЕДИЕНТЫ =====
        text = text.charAt(0).toUpperCase() + text.slice(1);
        const current = textarea.value.trim();
        textarea.value = current ? current + ',\n' + text : text;
        updateIngHint();
      }

      textarea.scrollTop = textarea.scrollHeight;
    }
  }
};

rec.onerror = (event) => {
if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
hint.textContent = 'Нет доступа к микрофону — разрешите его в настройках браузера';
} else if (event.error === 'no-speech') {
hint.textContent = 'Наслушался тишины — скажите что-нибудь 🙂';
} else {
hint.textContent = 'Не получилось распознать речь, попробуйте ещё раз';
}
};

rec.onend = () => {
if (activeDictation && activeDictation.rec === rec) stopDictation();
};

try {
rec.start();
} catch (e) {
hint.textContent = 'Не удалось запустить диктовку';
return;
}

activeDictation = { rec, btn, textarea, mode, hint };
btn.classList.add('recording');
btn.textContent = '⏹';
hint.textContent = '🎙️ Слушаю… говорите, я записываю. Нажмите ⏹, чтобы закончить';
}

micIngredients.addEventListener('click', () => {
if (activeDictation) { stopDictation(); return; }
if (!SpeechRecognition) {
alert('Ваш браузер не поддерживает диктовку. Попробуйте Chrome или Safari.');
return;
}
ingredientsInput.focus();
startDictation(micIngredients, ingredientsInput, dictIngredientsHint, 'ingredients');
});

micSteps.addEventListener('click', () => {
if (activeDictation) { stopDictation(); return; }
if (!SpeechRecognition) {
alert('Ваш браузер не поддерживает диктовку. Попробуйте Chrome или Safari.');
return;
}
stepsInput.focus();
startDictation(micSteps, stepsInput, dictStepsHint, 'steps');
});

// --- Режим крупного шрифта ---
function applyLargeFont() {
const on = localStorage.getItem('largeFont') === '1';
document.body.classList.toggle('large-font', on);
fontBtn.textContent = on ? '📖 Обычный шрифт' : '📖 Крупный шрифт';
}
fontBtn.addEventListener('click', () => {
const on = localStorage.getItem('largeFont') === '1';
localStorage.setItem('largeFont', on ? '0' : '1');
applyLargeFont();
});

// --- Чтение вслух ---
function stopSpeech() {
if ('speechSynthesis' in window) speechSynthesis.cancel();
ttsBtn.textContent = '🔊 Читать вслух';
ttsBtn.classList.remove('tts-active');
}

ttsBtn.addEventListener('click', () => {
if (!('speechSynthesis' in window)) {
alert('Ваш браузер не умеет читать текст вслух');
return;
}
if (speechSynthesis.speaking) {
stopSpeech();
return;
}
const parts = [modalTitle.textContent];
if (modalIngredients.textContent.trim()) parts.push('Ингредиенты: ' + modalIngredients.textContent);
if (modalSteps.textContent.trim()) parts.push('Приготовление: ' + modalSteps.textContent);
const text = parts.join('. ').replace(/\s+/g, ' ').trim();
if (!text) return;

const u = new SpeechSynthesisUtterance(text);
u.lang = 'ru-RU';
u.rate = 0.95;
u.onend = () => stopSpeech();
u.onerror = () => stopSpeech();
speechSynthesis.speak(u);
ttsBtn.textContent = '⏹ Остановить чтение';
ttsBtn.classList.add('tts-active');
});

// --- РЕЖИМ ГОТОВКИ ---
let cookState = null;
let wakeLock = null;

async function lockScreen() {
try {
if ('wakeLock' in navigator) {
wakeLock = await navigator.wakeLock.request('screen');
}
} catch (e) { /* не критично */ }
}
async function unlockScreen() {
try { if (wakeLock) { await wakeLock.release(); wakeLock = null; } } catch (e) {}
}
document.addEventListener('visibilitychange', () => {
if (document.visibilityState === 'visible' && cookState) lockScreen();
});

cookModeBtn.addEventListener('click', openCookMode);

function openCookMode() {
if (!currentRecipeData) return;
const lines = (currentRecipeData.steps || '')
.split('\n').map(s => s.trim()).filter(Boolean)
.map(s => s.replace(/^\d+[.)]\s*/, ''));
if (lines.length === 0) { showToast('В этом рецепте нет шагов', { type: 'warn' }); return; }

cookState = { steps: lines, idx: 0 };
stopSpeech();
stopGlobalTimer();
modal.style.display = 'none';
cookMode.style.display = 'flex';
cookDishName.textContent = currentRecipeData.title || '';
renderCookStep();
lockScreen();
}

function renderCookStep() {
const total = cookState.steps.length;
const i = cookState.idx;

// Обновляем прогресс-бар
const progressFill = document.getElementById('cookProgressFill');
if (progressFill) {
  const percent = ((i + 1) / total) * 100;
  progressFill.style.width = percent + '%';
}

// Старые точки (скрыты, но поддерживаем на всякий случай)
if (cookDots) {
  cookDots.innerHTML = Array.from({ length: total }, (_, k) =>
    `<span class="${k <= i ? 'on' : ''}">●</span>`
  ).join('');
}

cookStepNum.textContent = `Шаг ${i + 1} из ${total}`;
cookStepText.textContent = cookState.steps[i];
cookStepText.scrollTop = 0;

// Анимация появления шага
cookStepText.classList.remove('cook-step-finish');
void cookStepText.offsetWidth;
cookStepText.classList.add('cook-step-finish');

const t = parseTime(cookState.steps[i]);
cookTimerArea.innerHTML = t
? `<button class="cook-timer-btn" data-sec="${t}">⏱ Засечь ${fmtTime(t)}</button>`
: '';

const isLast = i === total - 1;
cookNextBtn.textContent = isLast ? '✅ Приготовил!' : 'Далее →';
cookNextBtn.classList.toggle('cook-finish', isLast);
cookPrevBtn.disabled = i === 0;
}

cookTimerArea.addEventListener('click', (e) => {
const btn = e.target.closest('.cook-timer-btn');
if (btn) startGlobalTimer(parseInt(btn.getAttribute('data-sec'), 10));
});

cookPrevBtn.addEventListener('click', () => {
if (!cookState || cookState.idx === 0) return;
cookState.idx--;
renderCookStep();
});

cookNextBtn.addEventListener('click', () => {
if (!cookState) return;
if (cookState.idx < cookState.steps.length - 1) {
cookState.idx++;
renderCookStep();
} else {
finishCooking();
}
});

cookExitBtn.addEventListener('click', () => {
stopGlobalTimer();
unlockScreen();
cookMode.style.display = 'none';
cookState = null;
if (currentRecipeId) openRecipe(currentRecipeId);
});

async function finishCooking() {
if (!currentRecipeId) return;
const id = currentRecipeId;
const col = currentCollection;
stopGlobalTimer();
unlockScreen();
cookMode.style.display = 'none';
cookState = null;
currentRecipeId = null;
modal.style.display = 'none';

try {
if (col === 'recipes') {
await toggleCooked(id);
} else {
await moveWishlistToRecipes(id);
}
// Салют в центре
const cx = window.innerWidth / 2;
const cy = window.innerHeight / 3;
launchConfetti(cx, cy);
launchEmojiBurst(cx, cy);
playSuccessSound();
} catch (e) {
console.error(e);
showToast('Не удалось сохранить отметку', { type: 'error' });
}
}
// ===== ПОДБОРКИ =====

createCollectionBtn.addEventListener('click', () => {
  collectionName.value = '';
  collectionEmoji.value = '';
  collectionModal.classList.add('show');
  setTimeout(() => collectionName.focus(), 50);
});

collectionCancelBtn.addEventListener('click', () => {
  collectionModal.classList.remove('show');
});

collectionSaveBtn.addEventListener('click', async () => {
  const name = collectionName.value.trim();
  const emoji = collectionEmoji.value.trim() || '🎉';
  if (!name) { showToast('Введите название подборки', { type: 'warn' }); return; }
  try {
    await addDoc(collectionsCol, {
      name, emoji,
      recipeIds: [],
      createdAt: new Date(),
      createdBy: auth.currentUser ? auth.currentUser.email : ''
    });
    collectionModal.classList.remove('show');
  } catch (e) {
    console.error(e);
    showToast('Не удалось создать подборку', { type: 'error' });
  }
});

collectionModal.addEventListener('click', (e) => {
  if (e.target === collectionModal) collectionModal.classList.remove('show');
});
// ===== Модалка выбора подборки =====
let pendingRecipeId = null;

function openPickCollectionModal(recipeId) {
  pendingRecipeId = recipeId;

  if (allCollections.length === 0) {
    pickCollectionList.innerHTML = `
      <p style="text-align:center; color:#888; padding:12px 0;">
        У вас пока нет ни одной подборки.<br>
        Создайте первую — например, «День рождения папы» 🎂
      </p>
    `;
    pickCollectionModal.classList.add('show');
    return;
  }

  // Собираем id рецепта из recipes и wishlist — чтобы показать,
  // в каких подборках он уже есть
  pickCollectionList.innerHTML = '';
  allCollections.forEach(c => {
    const alreadyIn = (c.recipeIds || []).includes(recipeId);
    const item = document.createElement('button');
    item.className = 'collection-pick-item';
    const count = (c.recipeIds || []).length;
    item.innerHTML = `
      <span class="cp-emoji">${escapeHtml(c.emoji || '🎉')}</span>
      <span>${escapeHtml(c.name)}</span>
      <span class="cp-count">${alreadyIn ? '✓ уже внутри' : count + ' рец.'}</span>
    `;
    if (alreadyIn) {
      item.style.opacity = '0.55';
      item.addEventListener('click', () => {
        showToast('Рецепт уже в этой подборке', { type: 'info' });
      });
    } else {
      item.addEventListener('click', async () => {
        await addRecipeToCollection(recipeId, c.id);
        pickCollectionModal.classList.remove('show');
        pendingRecipeId = null;
      });
    }
    pickCollectionList.appendChild(item);
  });

  pickCollectionModal.classList.add('show');
}

pickCollectionCancelBtn.addEventListener('click', () => {
  pickCollectionModal.classList.remove('show');
  pendingRecipeId = null;
});

pickCollectionModal.addEventListener('click', (e) => {
  if (e.target === pickCollectionModal) {
    pickCollectionModal.classList.remove('show');
    pendingRecipeId = null;
  }
});
function renderCollections() {
  if (currentCollectionId) {
    renderCollectionDetail();
    return;
  }

  if (allCollections.length === 0) {
    collectionsList.innerHTML = emptyStateHtml('🎉',
      'Пока нет ни одной подборки.<br>Создайте, например, «День рождения папы» и перетащите туда рецепты!');
    return;
  }

  collectionsList.innerHTML = '<div class="collections-grid"></div>';
  const grid = collectionsList.querySelector('.collections-grid');

  allCollections.forEach(c => {
    const card = document.createElement('div');
    card.className = 'collection-card';
    const count = (c.recipeIds || []).length;
    card.innerHTML = `
      <button class="cc-del" title="Удалить подборку">✕</button>
      <h3><span class="cc-emoji">${escapeHtml(c.emoji || '🎉')}</span>${escapeHtml(c.name)}</h3>
      <div class="cc-meta">${count} ${count === 1 ? 'рецепт' : count < 5 ? 'рецепта' : 'рецептов'}</div>
    `;
    card.addEventListener('click', (e) => {
      if (e.target.closest('.cc-del')) return;
      currentCollectionId = c.id;
      renderCollections();
    });
    card.querySelector('.cc-del').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm(`Удалить подборку «${c.name}»? Рецепты останутся на месте.`)) return;
      try {
        await deleteDoc(doc(db, 'collections', c.id));
      } catch (err) {
        console.error(err);
        showToast('Не удалось удалить подборку', { type: 'error' });
      }
    });
    grid.appendChild(card);
  });
}

function renderCollectionDetail() {
  const c = allCollections.find(x => x.id === currentCollectionId);
  if (!c) { currentCollectionId = null; renderCollections(); return; }

  const ids = c.recipeIds || [];

  // Собираем рецепты из обеих коллекций
  const items = [];
  ids.forEach(id => {
    const r1 = allRecipes.find(x => x.id === id);
    if (r1) { items.push({ ...r1, _source: 'recipes' }); return; }
    const r2 = allWishlist.find(x => x.id === id);
    if (r2) items.push({ ...r2, _source: 'wishlist' });
  });

const shopList = c.shoppingList || [];
const notBought = shopList.filter(i => !i.bought && !i.haveIt).length;
const shopCountLabel = notBought > 0 ? ` <span class="shop-count">${notBought}</span>` : '';

collectionsList.innerHTML = `
  <div class="collection-detail-head">
    <h2><span style="font-size:1.2em;">${escapeHtml(c.emoji || '🎉')}</span> ${escapeHtml(c.name)}</h2>
    <button id="backToCollectionsBtn" class="ghost-btn" style="width:auto; color:#333;">← Назад</button>
  </div>

  <button class="shopping-list-btn" id="openShoppingBtn">
    🛒 Список покупок${shopCountLabel}
  </button>

  <div class="collection-drop-hint" id="collectionDropHint">
    ⬇️ Перетащите сюда рецепт из «Все рецепты» или «Хочу приготовить»
  </div>
  <div id="collectionItems"></div>
`;

// Кнопка списка покупок
document.getElementById('openShoppingBtn').addEventListener('click', () => {
  openShoppingList(c.id);
});

  document.getElementById('backToCollectionsBtn').addEventListener('click', () => {
    currentCollectionId = null;
    renderCollections();
  });

  const dropHint = document.getElementById('collectionDropHint');
  dropHint.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropHint.classList.add('drag-over');
  });
  dropHint.addEventListener('dragleave', () => dropHint.classList.remove('drag-over'));
  dropHint.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropHint.classList.remove('drag-over');
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    let parsed;
    try { parsed = JSON.parse(data); } catch (err) { return; }
    await addRecipeToCollection(parsed.id, c.id);
  });

  const itemsBox = document.getElementById('collectionItems');
  if (items.length === 0) {
    itemsBox.innerHTML = emptyStateHtml('🍽️', 'В подборке пока пусто.<br>Перетащите сюда рецепты из других вкладок.');
    return;
  }

  items.forEach(r => {
    const card = document.createElement('div');
    card.className = 'card recipe-card' + (r.cooked ? ' cooked' : '');
    const catClass = getCategoryClass(r.category);
    const catEmoji = getCategoryEmoji(r.category);
    const images = getImages(r);
    const mainImg = images[0]
      ? `<div class="polaroid"><img src="${images[0]}" alt="Фото блюда"></div>`
      : '';

    // Информация о том, где уже готовили
    let cookedInfo = '';
    if (Array.isArray(r.cookedInCollections) && r.cookedInCollections.length > 0) {
      cookedInfo = r.cookedInCollections.map(cc =>
        `<span class="cooked-collection-note">✅ ${escapeHtml(cc.emoji || '🎉')} ${escapeHtml(cc.name)} — ${escapeHtml(cc.date || '')}</span>`
      ).join('');
    }

    card.innerHTML = `
      <button class="icon-btn" style="float:right; color:#d9534f; width:44px; min-width:44px; height:44px;" title="Убрать из подборки">✕</button>
      <span class="category-badge ${catClass}">${catEmoji} ${escapeHtml(r.category)}</span>
      <h3>${escapeHtml(r.title)}</h3>
      ${mainImg}
      ${ingredientsToHtml(r.ingredientsShort)}
      ${cookedInfo ? `<div style="margin-top:6px;">${cookedInfo}</div>` : ''}
      <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
        <button class="done-btn cookedHereBtn" style="flex:1;">🍳 Приготовил</button>
        <button class="ghost-btn openInCollectionBtn" style="width:auto; color:#333;">Открыть</button>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      // Открываем рецепт во «все рецепты», если он там есть
      if (r._source === 'recipes') {
        tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-view') === 'recipes'));
        currentView = 'recipes';
        recipesList.style.display = 'block';
        collectionsView.style.display = 'none';
        document.getElementById('searchInput').parentElement.style.display = 'flex';
        openRecipe(r.id);
      } else {
        tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-view') === 'wishlist'));
        currentView = 'wishlist';
        recipesList.style.display = 'block';
        collectionsView.style.display = 'none';
        document.getElementById('searchInput').parentElement.style.display = 'flex';
        openRecipe(r.id);
      }
    });

   card.querySelector('.cookedHereBtn').addEventListener('click', async (e) => {
  e.stopPropagation();
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top;

  // Эффекты запускаем сразу — визуальный отклик мгновенный
  launchConfetti(cx, cy);
  launchEmojiBurst(cx, cy);
  playSuccessSound();

  if (card) {
    card.classList.add('cooked-flash');
    const flash = document.createElement('div');
    flash.className = 'cook-flash-green';
    card.appendChild(flash);
    setTimeout(() => flash.remove(), 950);
    setTimeout(() => card.classList.remove('cooked-flash'), 1050);
  }

  await markCookedInCollection(r, c);
});

    card.querySelector('.openInCollectionBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      card.click();
    });

    card.querySelector('.icon-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm(`Убрать «${r.title}» из подборки?`)) return;
      await removeRecipeFromCollection(r.id, c.id);
    });

    itemsBox.appendChild(card);
  });
}

async function addRecipeToCollection(recipeId, collectionId) {
  const c = allCollections.find(x => x.id === collectionId);
  if (!c) return;
  const ids = c.recipeIds || [];
  if (ids.includes(recipeId)) {
    showToast('Рецепт уже в подборке', { type: 'info' });
    return;
  }
  try {
    await setDoc(doc(db, 'collections', collectionId), {
      recipeIds: [...ids, recipeId]
    }, { merge: true });
  } catch (e) {
    console.error(e);
    showToast('Не удалось добавить рецепт', { type: 'error' });
  }
}

async function removeRecipeFromCollection(recipeId, collectionId) {
  const c = allCollections.find(x => x.id === collectionId);
  if (!c) return;
  const ids = (c.recipeIds || []).filter(id => id !== recipeId);
  try {
    await setDoc(doc(db, 'collections', collectionId), { recipeIds: ids }, { merge: true });
  } catch (e) {
    console.error(e);
    showToast('Не удалось убрать рецепт', { type: 'error' });
  }
}

async function markCookedInCollection(recipe, collection) {
  const today = new Date().toLocaleDateString('ru-RU');
  const entry = {
    id: collection.id,
    name: collection.name,
    emoji: collection.emoji || '🎉',
    date: today
  };

  // Случай 1: рецепт из «Хочу приготовить» — переносим в «Все рецепты»
  if (recipe._source === 'wishlist') {
    const newId = await moveWishlistToRecipes(recipe.id);
    if (!newId) return;
    try {
      await setDoc(doc(db, 'recipes', newId), {
        cookedInCollections: [entry]
      }, { merge: true });

      // Обновляем recipeIds в подборке: старый id → новый
      const c = allCollections.find(x => x.id === collection.id);
      if (c) {
        const newIds = (c.recipeIds || []).map(x => x === recipe.id ? newId : x);
        await setDoc(doc(db, 'collections', collection.id), { recipeIds: newIds }, { merge: true });
      }

      launchConfetti(window.innerWidth / 2, window.innerHeight / 3);
      showToast(`«${recipe.title}» готовится для «${collection.name}»`, {
  type: 'success',
  icon: '🎉',
  sub: 'Рецепт перенесён в «Все рецепты»'
});
    } catch (e) {
      console.error(e);
      alert('Не удалось сохранить отметку');
    }
    return;
  }

  // Случай 2: рецепт уже в «Все рецепты» — просто ставим отметку
  if (recipe._source === 'recipes') {
    const r = allRecipes.find(x => x.id === recipe.id);
    if (!r) return;
    const existing = Array.isArray(r.cookedInCollections) ? r.cookedInCollections : [];
    const already = existing.some(x => x.id === collection.id && x.date === today);
    const updated = already ? existing : [...existing, entry];

    try {
      await setDoc(doc(db, 'recipes', recipe.id), {
        cooked: true,
        cookedAt: new Date(),
        cookedInCollections: updated
      }, { merge: true });

      launchConfetti(window.innerWidth / 2, window.innerHeight / 3);
      showToast(`«${recipe.title}»`, {
  type: 'success',
  icon: '🎉',
  sub: `Приготовлено для «${collection.name}» — ${today}`
});
    } catch (e) {
      console.error(e);
      showToast('Не удалось сохранить отметку', { type: 'error' });
    }
  }
}
// ===== СПИСОК ПОКУПОК =====
const shoppingModal = document.getElementById('shoppingModal');
const shoppingTitle = document.getElementById('shoppingTitle');
const shoppingSubtitle = document.getElementById('shoppingSubtitle');
const shoppingBody = document.getElementById('shoppingBody');
const shoppingProgressFill = document.getElementById('shoppingProgressFill');
const shoppingProgressText = document.getElementById('shoppingProgressText');
const shoppingRemainText = document.getElementById('shoppingRemainText');
const shoppingCloseBtn = document.getElementById('shoppingCloseBtn');
const shoppingSyncBtn = document.getElementById('shoppingSyncBtn');
const shoppingShareBtn = document.getElementById('shoppingShareBtn');
const shoppingCopyBtn = document.getElementById('shoppingCopyBtn');
const shoppingResetBtn = document.getElementById('shoppingResetBtn');

let currentShoppingCollectionId = null;

// Уникальный id для пункта
function shoppingUid() {
  return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Открытие модалки
function openShoppingList(collectionId) {
  const c = allCollections.find(x => x.id === collectionId);
  if (!c) { showToast('Подборка не найдена', { type: 'error' }); return; }

  currentShoppingCollectionId = collectionId;
  shoppingTitle.textContent = `🛒 Список покупок — ${c.emoji || '🎉'} ${c.name}`;
  renderShoppingList();
  shoppingModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeShoppingList() {
  shoppingModal.classList.remove('show');
  document.body.style.overflow = '';
  currentShoppingCollectionId = null;
}

shoppingCloseBtn.addEventListener('click', closeShoppingList);
shoppingModal.addEventListener('click', (e) => {
  if (e.target === shoppingModal) closeShoppingList();
});
// ===== Делегирование кликов по списку покупок =====
shoppingBody.addEventListener('click', async (e) => {
  const itemEl = e.target.closest('.shopping-item');
  if (!itemEl) return;

  const id = itemEl.getAttribute('data-id');
  if (!id) return;

  // Кнопка «Удалить»
  if (e.target.closest('.shopping-del-btn')) {
    if (confirm('Удалить пункт из списка?')) {
      await removeShoppingItem(id);
    }
    return;
  }

  // Кнопка «Уже есть»
  if (e.target.closest('.shopping-have-btn')) {
    await toggleShoppingHave(id);
    return;
  }

  // Клик по чекбоксу ИЛИ по названию → переключаем «куплено»
  await toggleShoppingBought(id);
});
// Собираем ингредиенты из всех рецептов подборки
// Нормализация ключа ингредиента для дедупликации
function normalizeIngredientKey(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[.,;:!?»«"'()]+/g, '')   // убираем все знаки
    .replace(/\s+/g, ' ')                // сжимаем пробелы
    .trim();
}

function collectIngredientsFromCollection(collection) {
  // Дедупликация id рецептов — на случай, если рецепт в recipeIds дважды
  const ids = [...new Set(collection.recipeIds || [])];
  const seen = new Set();
  const result = [];

  ids.forEach(id => {
    const r = allRecipes.find(x => x.id === id) || allWishlist.find(x => x.id === id);
    if (!r || !r.ingredientsShort) return;

    r.ingredientsShort
      .split(/\n|,(?!\d)/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .forEach(ing => {
        const key = normalizeIngredientKey(ing);
        if (!key || seen.has(key)) return;
        seen.add(key);
        result.push(ing);
      });
  });

  return result;
}

// Обновить список из рецептов (с сохранением отметок)
shoppingSyncBtn.addEventListener('click', async () => {
  const c = allCollections.find(x => x.id === currentShoppingCollectionId);
  if (!c) return;

  const fromRecipes = collectIngredientsFromCollection(c);
  const existing = c.shoppingList || [];
 const existingMap = new Map();
existing.forEach(item => {
  existingMap.set(normalizeIngredientKey(item.name), item);
});

  const newList = [];
  // Сначала все существующие — сохраняем отметки
  fromRecipes.forEach(name => {
  const key = normalizeIngredientKey(name);
    const old = existingMap.get(key);
    if (old) {
      newList.push(old); // сохраняем haveIt/bought
    } else {
      newList.push({
        id: shoppingUid(),
        name,
        haveIt: false,
        bought: false,
        manual: false
      });
    }
  });

  // Оставляем ручные пункты, которые не пересеклись
  existing.forEach(item => {
  if (item.manual && !fromRecipes.some(n => normalizeIngredientKey(n) === normalizeIngredientKey(item.name))) {
    newList.push(item);
  }
});

  try {
    await setDoc(doc(db, 'collections', c.id), { shoppingList: newList }, { merge: true });
    if (newList.length === 0) {
      showToast('В рецептах подборки не найдено ингредиентов', { type: 'info' });
    } else {
      showToast(`Собрано ${newList.length} пунктов`, { type: 'success', icon: '🛒' });
    }
  } catch (e) {
    console.error(e);
    showToast('Не удалось собрать список', { type: 'error' });
  }
});

// Сбросить все отметки
shoppingResetBtn.addEventListener('click', async () => {
  const c = allCollections.find(x => x.id === currentShoppingCollectionId);
  if (!c) return;
  if (!confirm('Сбросить все отметки? Пункты останутся, отметки «есть/куплено» сбросятся.')) return;

  const newList = (c.shoppingList || []).map(item => ({ ...item, haveIt: false, bought: false }));
  try {
    await setDoc(doc(db, 'collections', c.id), { shoppingList: newList }, { merge: true });
    showToast('Отметки сброшены', { type: 'success', icon: '↺' });
  } catch (e) {
    console.error(e);
    showToast('Не удалось сбросить', { type: 'error' });
  }
});

// Рендер списка
function renderShoppingList() {
  const c = allCollections.find(x => x.id === currentShoppingCollectionId);
  if (!c) return;

  const list = c.shoppingList || [];

  // Прогресс
  const total = list.filter(i => !i.haveIt).length; // «есть дома» не считаем
  const bought = list.filter(i => i.bought && !i.haveIt).length;
  const percent = total === 0 ? 0 : Math.round((bought / total) * 100);
  shoppingProgressFill.style.width = percent + '%';
  shoppingProgressText.textContent = `Куплено ${bought} из ${total}`;
  shoppingRemainText.textContent = total === 0 ? '' : `Осталось: ${total - bought}`;

  shoppingSubtitle.textContent = `${list.length} ${list.length === 1 ? 'пункт' : list.length < 5 ? 'пункта' : 'пунктов'} в списке`;

  // Пусто
  if (list.length === 0) {
    shoppingBody.innerHTML = `
      <div class="shopping-empty">
        <div class="es-icon">🛒</div>
        <p>Список пуст.<br>Нажмите <b>«Собрать из рецептов»</b> — я соберу ингредиенты из всех рецептов этой подборки.</p>
      </div>
    `;
    return;
  }

  // Разделяем на группы
  const toBuy = list.filter(i => !i.haveIt && !i.bought);
  const boughtItems = list.filter(i => !i.haveIt && i.bought);
  const haveItems = list.filter(i => i.haveIt);

  let html = '';

  if (toBuy.length > 0) {
    html += `<div class="shopping-section-title">Купить (${toBuy.length})</div>`;
    toBuy.forEach(item => html += shoppingItemHtml(item));
  }

  if (boughtItems.length > 0) {
    html += `<div class="shopping-section-title">Куплено (${boughtItems.length})</div>`;
    boughtItems.forEach(item => html += shoppingItemHtml(item));
  }

  if (haveItems.length > 0) {
    html += `<div class="shopping-section-title">Уже есть дома (${haveItems.length})</div>`;
    haveItems.forEach(item => html += shoppingItemHtml(item));
  }

  // Ручное добавление
  html += `
    <div class="shopping-add-row">
      <input id="newShoppingItem" placeholder="Добавить свой пункт…" maxlength="120">
      <button id="addShoppingItemBtn">+</button>
    </div>
  `;

  shoppingBody.innerHTML = html;

  const addInput = document.getElementById('newShoppingItem');
  const addBtn = document.getElementById('addShoppingItemBtn');
  if (addBtn && addInput) {
    const add = async () => {
      const name = addInput.value.trim();
      if (!name) return;
      await addShoppingItem(name);
      addInput.value = '';
      addInput.focus();
    };
    addBtn.addEventListener('click', add);
    addInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); add(); }
    });
  }
}

function shoppingItemHtml(item) {
  const cls = item.bought ? 'bought' : item.haveIt ? 'have-it' : '';
  const check = item.bought ? '✓' : item.haveIt ? '🏠' : '';
  const haveLabel = item.haveIt ? '🏠' : '☆';
  return `
    <div class="shopping-item ${cls}" data-id="${item.id}">
      <div class="shopping-checkbox">${check}</div>
      <div class="shopping-name">${escapeHtml(item.name)}</div>
      <button class="shopping-have-btn">${haveLabel}</button>
      <button class="shopping-del-btn" title="Удалить">✕</button>
    </div>
  `;
}

// Переключить «куплено»
async function toggleShoppingBought(itemId) {
  const c = allCollections.find(x => x.id === currentShoppingCollectionId);
  if (!c) return;
  const list = (c.shoppingList || []).map(item => {
    if (item.id === itemId) {
      return { ...item, bought: !item.bought, haveIt: false };
    }
    return item;
  });
  await setDoc(doc(db, 'collections', c.id), { shoppingList: list }, { merge: true });
}

// Переключить «уже есть дома»
async function toggleShoppingHave(itemId) {
  const c = allCollections.find(x => x.id === currentShoppingCollectionId);
  if (!c) return;
  const list = (c.shoppingList || []).map(item => {
    if (item.id === itemId) {
      return { ...item, haveIt: !item.haveIt, bought: false };
    }
    return item;
  });
  await setDoc(doc(db, 'collections', c.id), { shoppingList: list }, { merge: true });
}

// Добавить свой пункт
async function addShoppingItem(name) {
  const c = allCollections.find(x => x.id === currentShoppingCollectionId);
  if (!c) return;
  const list = [...(c.shoppingList || [])];
  const key = normalizeIngredientKey(name);
if (list.some(i => normalizeIngredientKey(i.name) === key)) {
    showToast('Уже есть в списке', { type: 'info' });
    return;
  }
  list.push({ id: shoppingUid(), name, haveIt: false, bought: false, manual: true });
  await setDoc(doc(db, 'collections', c.id), { shoppingList: list }, { merge: true });
}

// Удалить пункт
async function removeShoppingItem(itemId) {
  const c = allCollections.find(x => x.id === currentShoppingCollectionId);
  if (!c) return;
  const list = (c.shoppingList || []).filter(i => i.id !== itemId);
  await setDoc(doc(db, 'collections', c.id), { shoppingList: list }, { merge: true });
}
// Формируем текст для шаринга
function buildShoppingText() {
  const c = allCollections.find(x => x.id === currentShoppingCollectionId);
  if (!c) return '';
  const list = c.shoppingList || [];

  const toBuy = list.filter(i => !i.haveIt && !i.bought);
  const bought = list.filter(i => !i.haveIt && i.bought);
  const have = list.filter(i => i.haveIt);

  let text = `🛒 Список покупок\n🎉 ${c.emoji || ''} ${c.name}\n\n`;

  if (toBuy.length > 0) {
    text += `Нужно купить:\n`;
    toBuy.forEach(i => { text += `• ${i.name}\n`; });
    text += '\n';
  }
  if (bought.length > 0) {
    text += `Уже куплено:\n`;
    bought.forEach(i => { text += `✅ ${i.name}\n`; });
    text += '\n';
  }
  if (have.length > 0) {
    text += `Уже есть дома:\n`;
    have.forEach(i => { text += `🏠 ${i.name}\n`; });
  }

  return text.trim();
}

// Поделиться
shoppingShareBtn.addEventListener('click', async () => {
  const text = buildShoppingText();
  if (!text) { showToast('Список пуст', { type: 'info' }); return; }

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Список покупок',
        text
      });
    } catch (e) {
      // Пользователь отменил — это не ошибка
      if (e.name !== 'AbortError') {
        console.warn('Share error:', e);
      }
    }
  } else {
    // Fallback — копирование
    try {
      await navigator.clipboard.writeText(text);
      showToast('Список скопирован', { type: 'success', icon: '📋', sub: 'Вставьте в любой мессенджер' });
    } catch (e) {
      // Резерв — старая копия через textarea
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showToast('Список скопирован', { type: 'success', icon: '📋' }); }
      catch (err) { showToast('Не удалось скопировать', { type: 'error' }); }
      ta.remove();
    }
  }
});

// Копировать
shoppingCopyBtn.addEventListener('click', async () => {
  const text = buildShoppingText();
  if (!text) { showToast('Список пуст', { type: 'info' }); return; }
  try {
    await navigator.clipboard.writeText(text);
    showToast('Скопировано', { type: 'success', icon: '📋', sub: 'Вставьте в чат или заметки' });
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('Скопировано', { type: 'success', icon: '📋' }); }
    catch (err) { showToast('Не удалось скопировать', { type: 'error' }); }
    ta.remove();
  }
});

// --- Случайный рецепт ---
randomBtn.addEventListener('click', () => {
const pool = currentView === 'recipes' ? allRecipes : allWishlist;
if (pool.length === 0) {
showToast('Нет рецептов', { type: 'info', icon: '🎲', sub: 'Добавьте хотя бы один рецепт' });
return;
}
openRecipe(pool[Math.floor(Math.random() * pool.length)].id);
});

// --- Фон ---
function applyBackground() {
const bgMap = {
'десерт': 'bg-dessert', 'суп': 'bg-soup', 'салат': 'bg-salad',
'холодная закуска': 'bg-cold-snack', 'горячая закуска': 'bg-hot-snack',
'выпечка сладкая': 'bg-sweet-pastry', 'выпечка не сладкая': 'bg-savory-pastry',
'вторые блюда': 'bg-main', 'гарниры': 'bg-side',
'соусы': 'bg-sauce', 'напитки': 'bg-drink'
};
let bgClass = 'bg-all';
if (currentView === 'wishlist') {
bgClass = 'bg-wishlist';
} else if (categoryFilter.value !== 'all') {
bgClass = bgMap[categoryFilter.value] || 'bg-all';
}
document.body.className = bgClass;
if (localStorage.getItem('largeFont') === '1') document.body.classList.add('large-font');
}

function getRating(r) {
const reviews = r.reviews || [];
if (reviews.length === 0) return { avg: null, count: 0 };
const sum = reviews.reduce((acc, rev) => acc + (rev.stars || 0), 0);
return { avg: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}

function starsText(n) {
if (!n) return '';
const full = Math.round(n);
return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function compressImage(file, maxWidth = 700, quality = 0.55) {
return new Promise((resolve, reject) => {
const reader = new FileReader();
reader.onload = (e) => {
const img = new Image();
img.onload = () => {
let w = img.width;
let h = img.height;
if (w > maxWidth) {
h = Math.round((h * maxWidth) / w);
w = maxWidth;
}
const canvas = document.createElement('canvas');
canvas.width = w;
canvas.height = h;
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0, w, h);
resolve(canvas.toDataURL('image/jpeg', quality));
};
img.onerror = reject;
img.src = e.target.result;
};
reader.onerror = reject;
reader.readAsDataURL(file);
});
}

async function compressImages(files) {
const limit = Math.min(files.length, 4);
if (files.length > 4) {
alert('Максимум 4 фото — взяты первые 4.');
}
const result = [];
for (let i = 0; i < limit; i++) {
result.push(await compressImage(files[i]));
}
return result;
}

// --- Авторизация ---
loginBtn.addEventListener('click', async () => {
const email = loginEmail.value.trim();
const password = loginPassword.value.trim();
if (!email || !password) {
loginError.style.display = 'block';
loginError.textContent = 'Введите email и пароль';
return;
}
try {
await signInWithEmailAndPassword(auth, email, password);
} catch (e) {
loginError.style.display = 'block';
loginError.textContent = 'Неверный email или пароль';
}
});

logoutBtn.addEventListener('click', async () => {
stopSpeech();
stopDictation();
stopGlobalTimer();
unlockScreen();
await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
if (user) {
loginScreen.style.display = 'none';
appDiv.style.display = 'block';
applyLargeFont();
applyBackground();
startRealtime();
} else {
loginScreen.style.display = 'flex';
appDiv.style.display = 'none';
stopSpeech();
stopDictation();
stopGlobalTimer();
unlockScreen();
loginEmail.value = '';
loginPassword.value = '';
}
});

// --- Реалтайм ---
let unsubRecipes = null;
let unsubWishlist = null;
let unsubCollections = null;

function startRealtime() {
  // Показываем скелетоны, пока грузятся данные
  if (currentView === 'recipes' && allRecipes.length === 0) {
    recipesList.innerHTML = Array.from({ length: 3 }, () => `
      <div class="skeleton-card">
        <div class="skeleton-line w-40"></div>
        <div class="skeleton-line w-60"></div>
        <div class="skeleton-img"></div>
        <div class="skeleton-line w-90"></div>
        <div class="skeleton-line w-60"></div>
      </div>
    `).join('');
  }
if (unsubRecipes) unsubRecipes();
if (unsubWishlist) unsubWishlist();
if (unsubCollections) unsubCollections();   // ← ДОБАВЛЕНО

unsubRecipes = onSnapshot(query(recipesCol, orderBy('createdAt', 'desc')), (snap) => {
allRecipes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
if (currentView === 'recipes') renderList();
}, (err) => {
console.error('Ошибка реалтайма (recipes):', err);
recipesList.innerHTML = '<p style="color:red;">Ошибка загрузки. Проверьте права Firestore.</p>';
});

unsubWishlist = onSnapshot(query(wishlistCol, orderBy('createdAt', 'desc')), (snap) => {
allWishlist = snap.docs.map(d => ({ id: d.id, ...d.data() }));
if (currentView === 'wishlist') renderList();
}, (err) => {
console.error('Ошибка реалтайма (wishlist):', err);
});

// ↓↓↓ ДОБАВЛЕНО ↓↓↓
unsubCollections = onSnapshot(query(collectionsCol, orderBy('createdAt', 'desc')), (snap) => {
  allCollections = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (currentView === 'collections') renderCollections();

  // Авто-перерисовка открытого списка покупок
  const shopModal = document.getElementById('shoppingModal');
  if (shopModal && shopModal.classList.contains('show') &&
      typeof renderShoppingList === 'function' &&
      typeof currentShoppingCollectionId !== 'undefined' &&
      currentShoppingCollectionId) {
    renderShoppingList();
  }
}, (err) => {
  console.error('Ошибка реалтайма (collections):', err);
});
// ↑↑↑ ДОБАВЛЕНО ↑↑↑
}

// --- Вкладки ---
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Если кликнули по уже активной вкладке — ничего не делаем
    if (tab.classList.contains('active')) return;

    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentView = tab.getAttribute('data-view');
    cancelEdit();
    applyBackground();
    favToggle.style.display = currentView === 'wishlist' ? 'none' : 'flex';

    // Переключение видимости блоков с плавной анимацией
    if (currentView === 'collections') {
      // Уходим с рецептов
      recipesList.classList.add('view-fade-out');
      setTimeout(() => {
        recipesList.style.display = 'none';
        recipesList.classList.remove('view-fade-out');

        collectionsView.style.display = 'block';
        collectionsView.classList.add('view-fade-in');
        setTimeout(() => collectionsView.classList.remove('view-fade-in'), 400);

        document.querySelector('.kitchen-banner').style.display = 'none';
        document.querySelector('.header-actions-row').style.display = 'none';
        document.querySelector('#addFormCard').style.display = 'none';
        document.getElementById('searchInput').parentElement.style.display = 'none';

        renderCollections();
      }, 200);
    } else {
      // Уходим с подборок
      collectionsView.classList.add('view-fade-out');
      setTimeout(() => {
        collectionsView.style.display = 'none';
        collectionsView.classList.remove('view-fade-out');

        recipesList.style.display = 'block';
        recipesList.classList.add('view-fade-in');
        setTimeout(() => recipesList.classList.remove('view-fade-in'), 400);

        document.querySelector('.kitchen-banner').style.display = 'block';
        document.querySelector('.header-actions-row').style.display = 'flex';
        document.querySelector('#addFormCard').style.display = 'block';
        document.getElementById('searchInput').parentElement.style.display = 'flex';

        renderList();
      }, 200);
    }
  });
});

// --- Поиск ---
function matchesSearch(r, term) {
if (!term) return true;
const haystack = [
r.title || '',
r.steps || '',
r.ingredientsShort || ''
].join(' ').toLowerCase();
return haystack.includes(term);
}

function emptyStateHtml(icon, text) {
return `<div class="empty-state"><div class="es-icon">${icon}</div><p>${text}</p></div>`;
}

function renderList() {
const data = currentView === 'recipes' ? allRecipes : allWishlist;
const selected = categoryFilter.value;
const term = searchInput.value.trim().toLowerCase();

let filtered = data;
if (currentView === 'recipes' && selected !== 'all') {
filtered = filtered.filter(r => r.category === selected);
}
if (currentView === 'recipes' && favOnly.checked) {
filtered = filtered.filter(r => r.favorite === true);
}
filtered = filtered.filter(r => matchesSearch(r, term));

recipesList.innerHTML = '';
if (filtered.length === 0) {
if (term) {
recipesList.innerHTML = emptyStateHtml('🔍', 'Ничего не нашлось — даже поварёнок не помог.<br>Попробуйте другое слово 🙂');
} else if (currentView === 'wishlist') {
recipesList.innerHTML = emptyStateHtml('📋', 'Пока ничего не запланировано.<br>Нажмите ☆ на приглянувшемся рецепте — или добавьте новый!');
} else if (favOnly.checked) {
recipesList.innerHTML = emptyStateHtml('⭐', 'В избранном пусто — нажимайте ☆ на карточках,<br>чтобы собрать свою золотую коллекцию.');
} else if (selected !== 'all') {
recipesList.innerHTML = emptyStateHtml('🍽️', 'В этой категории пока пусто.<br>Добавьте рецепт — и она оживёт!');
} else {
recipesList.innerHTML = emptyStateHtml('🍳', 'Здесь пока пусто — как сковородка перед завтраком.<br>Добавьте первый рецепт!');
}
return;
}

filtered.forEach((r, idx) => {
const card = document.createElement('div');
card.className = 'card recipe-card' + (r.cooked ? ' cooked' : '');
card.setAttribute('draggable', 'true');
card.addEventListener('dragstart', (e) => {
  draggedRecipe = { id: r.id, source: currentView === 'recipes' ? 'recipes' : 'wishlist' };
  e.dataTransfer.setData('text/plain', JSON.stringify(draggedRecipe));
  e.dataTransfer.effectAllowed = 'copy';
  card.classList.add('dragging');
});
card.addEventListener('dragend', () => card.classList.remove('dragging'));
card.style.animationDelay = Math.min(idx * 70, 700) + 'ms';

const catClass = getCategoryClass(r.category);
const catEmoji = getCategoryEmoji(r.category);
const { avg, count } = getRating(r);
const ratingHtml = avg
? `<div class="rating-line">${starsText(avg)} <span class="rating-count">${avg} · оценок: ${count}</span></div>`
: '';
const badges = [];
if (r.favorite) badges.push('<span class="fav-badge">⭐ В избранном</span>');
if (r.cooked) badges.push('<span class="cooked-badge">Уже пробовали ✅</span>');
if (Array.isArray(r.cookedInCollections) && r.cookedInCollections.length > 0) {
  r.cookedInCollections.forEach(cc => {
    badges.push(`<span class="cooked-collection-note">🎉 ${escapeHtml(cc.name)}${cc.date ? ' — ' + escapeHtml(cc.date) : ''}</span>`);
  });
}
const isRecipes = currentView === 'recipes';
const images = getImages(r);

const mainImg = images[0]
? `<div class="polaroid"><img src="${images[0]}" alt="Фото блюда">${addedDateStr(r) ? `<div class="polaroid-caption">${escapeHtml(addedDateStr(r))}</div>` : ''}</div>`
: '';
const stripHtml = images.length > 1
? `<div class="photo-strip">${images.slice(1).map(src => `<img src="${src}" alt="Фото блюда">`).join('')}</div>`
: '';

card.innerHTML = `
<span class="category-badge ${catClass}">${catEmoji} ${escapeHtml(r.category)}</span>
<h3>${escapeHtml(r.title)} ${badges.join(' ')}${r.cookedBy ? `<span class="cooked-by-badge">👨‍🍳 ${escapeHtml(r.cookedBy)}</span>` : ''}</h3>
${ratingHtml}
${mainImg}
${stripHtml}
${ingredientsToHtml(r.ingredientsShort)}
<div class="meta">${r.link ? `<a href="${escapeHtml(r.link)}" target="_blank">Источник</a>` : ''}</div>
${r.steps ? `
  <div class="card-steps-preview" data-preview-id="${r.id}">${escapeHtml(r.steps).replace(/\n/g, '<br>')}</div>
  <button class="toggle-steps-btn" data-toggle-id="${r.id}">Показать все шаги ↓</button>
` : ''}
${r.familyNote ? `<div class="family-note-card">${escapeHtml(r.familyNote)}</div>` : ''}
<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
${isRecipes ? `<button class="icon-btn favCardBtn" data-id="${r.id}" title="Избранное">${r.favorite ? '⭐' : '☆'}</button>` : ''}
${isRecipes ? `<button class="icon-btn cookedCardBtn" data-id="${r.id}" title="Уже приготовили">${r.cooked ? '✓' : '☐'}</button>` : ''}
<button class="edit-btn editRecipeBtn" data-id="${r.id}">Редактировать</button>
<button class="addToCollectionBtn" data-id="${r.id}" style="background:#8e44ad;">➕ В подборку</button>
<button class="delete-btn deleteRecipeBtn" data-id="${r.id}">Удалить</button>
</div>
`;

card.addEventListener('click', (e) => {
if (e.target.closest('button') || e.target.closest('a')) return;
openRecipe(r.id);
});

recipesList.appendChild(card);
});

document.querySelectorAll('.editRecipeBtn').forEach(btn => {
btn.addEventListener('click', (e) => {
e.stopPropagation();
startEdit(btn.getAttribute('data-id'));
});
});
document.querySelectorAll('.deleteRecipeBtn').forEach(btn => {
btn.addEventListener('click', async (e) => {
e.stopPropagation();
if (confirm('Удалить рецепт?')) {
await deleteRecipe(btn.getAttribute('data-id'));
}
});
});
document.querySelectorAll('.favCardBtn').forEach(btn => {
btn.addEventListener('click', (e) => {
e.stopPropagation();
toggleFavorite(btn.getAttribute('data-id'));
});
});
document.querySelectorAll('.cookedCardBtn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = btn.getAttribute('data-id');
    const r = allRecipes.find(x => x.id === id);
    const turningOn = r && !r.cooked;
    toggleCooked(id);
    if (turningOn) {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top;

      // Все эффекты разом
      launchConfetti(cx, cy);
      launchEmojiBurst(cx, cy);
      playSuccessSound();

      // Зелёная вспышка на карточке
      const card = btn.closest('.card');
      if (card) {
        card.classList.add('cooked-flash');
        const flash = document.createElement('div');
        flash.className = 'cook-flash-green';
        card.appendChild(flash);
        setTimeout(() => flash.remove(), 950);
        setTimeout(() => card.classList.remove('cooked-flash'), 1050);
      }
    }
  });
});

// Кнопка «➕ В подборку» на карточке рецепта
document.querySelectorAll('.addToCollectionBtn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    openPickCollectionModal(btn.getAttribute('data-id'));
  });
});
// Кнопка «Показать все шаги»
document.querySelectorAll('.toggle-steps-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = btn.getAttribute('data-toggle-id');
    const preview = document.querySelector(`.card-steps-preview[data-preview-id="${id}"]`);
    if (!preview) return;
    const expanded = preview.classList.toggle('expanded');
    btn.textContent = expanded ? 'Свернуть ↑' : 'Показать все шаги ↓';
  });
});
}

categoryFilter.addEventListener('change', () => {
applyBackground();
renderList();
});
searchInput.addEventListener('input', renderList);
favOnly.addEventListener('change', () => {
favToggle.classList.toggle('active', favOnly.checked);
renderList();
});

// --- Избранное и «Приготовил» ---
async function toggleFavorite(id) {
const r = allRecipes.find(x => x.id === id);
if (!r) return;
try {
await setDoc(doc(db, 'recipes', id), { favorite: !r.favorite }, { merge: true });
} catch (e) {
console.error(e);
showToast('Не удалось обновить избранное', { type: 'error' });
}
}

async function toggleCooked(id) {
  const r = allRecipes.find(x => x.id === id);
  if (!r) return;
  try {
    if (!r.cooked) {
      const who = askCookedBy();
      if (who === null) return;
      await setDoc(doc(db, 'recipes', id), {
        cooked: true,
        cookedAt: new Date(),
        cookedBy: who
      }, { merge: true });
    } else {
      await setDoc(doc(db, 'recipes', id), {
        cooked: false,
        cookedAt: null,
        cookedBy: ''
      }, { merge: true });
    }
  } catch (e) {
    console.error(e);
    showToast('Не удалось обновить отметку', { type: 'error' });
  }
}

// --- Редактирование ---
function startEdit(id) {
const data = currentView === 'recipes' ? allRecipes : allWishlist;
const r = data.find(x => x.id === id);
if (!r) { showToast('Рецепт не найден', { type: 'error' }); return; }

editingId = id;
editingCollection = currentView === 'recipes' ? 'recipes' : 'wishlist';
editingImages = getImages(r);

stopSpeech();
stopDictation();
stopGlobalTimer();
cookMode.style.display = 'none';
cookState = null;
modal.style.display = 'none';

titleInput.value = r.title || '';
categoryInput.value = r.category || '';
ingredientsInput.value = r.ingredientsShort || '';
stepsInput.value = formatSteps(r.steps || '');
linkInput.value = r.link || '';
familyNoteInput.value = r.familyNote || '';
imageInput.value = '';
updateIngHint();

formTitle.textContent = 'Редактировать рецепт';
editNotice.style.display = 'block';
addRecipeBtn.textContent = 'Сохранить изменения';
cancelEditBtn.style.display = 'block';

document.getElementById('addFormCard').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
editingId = null;
editingCollection = null;
editingImages = [];

stopDictation();

titleInput.value = '';
categoryInput.selectedIndex = 0;
ingredientsInput.value = '';
stepsInput.value = '';
linkInput.value = '';
familyNoteInput.value = '';
imageInput.value = '';
updateIngHint();

formTitle.textContent = currentView === 'wishlist' ? 'Добавить в «Хочу приготовить»' : 'Добавить рецепт';
editNotice.style.display = 'none';
addRecipeBtn.textContent = currentView === 'wishlist' ? 'Добавить в список желаний' : 'Добавить рецепт';
cancelEditBtn.style.display = 'none';
}

cancelEditBtn.addEventListener('click', cancelEdit);

// --- Добавление / сохранение ---
async function addRecipe() {
stopDictation();

const title = titleInput.value.trim();
const category = categoryInput.value;
const ingredientsShort = formatIngredients(ingredientsInput.value);
const steps = formatSteps(stepsInput.value);
const link = linkInput.value.trim();
const familyNote = familyNoteInput.value.trim();

if (!title || !category || !steps) {
	showToast('Заполните название, категорию и шаги', { type: 'warn' });
return;
}

let newImages = null;
if (imageInput.files.length > 0) {
addRecipeBtn.textContent = 'Обрабатываем фото…';
try {
newImages = await compressImages(imageInput.files);
} catch (e) {
console.error('Ошибка сжатия:', e);
showToast('Не удалось обработать фото', { type: 'error' });
addRecipeBtn.textContent = editingId ? 'Сохранить изменения'
: (currentView === 'wishlist' ? 'Добавить в список желаний' : 'Добавить рецепт');
return;
}
}

addRecipeBtn.textContent = 'Сохраняем…';

if (editingId) {
const docRef = doc(db, editingCollection, editingId);
const updates = { title, category, ingredientsShort, steps, link, familyNote };
if (newImages !== null && newImages.length > 0) {
updates.imagesBase64 = newImages;
updates.imageBase64 = newImages[0] || '';
} else if (editingImages.length > 0) {
updates.imagesBase64 = editingImages;
updates.imageBase64 = editingImages[0] || '';
}
await setDoc(docRef, updates, { merge: true });
cancelEdit();
} else {
const targetCol = currentView === 'wishlist' ? wishlistCol : recipesCol;
await addDoc(targetCol, {
  title, category, ingredientsShort, steps, link, familyNote,
  imageBase64: (newImages && newImages[0]) || '',
  imagesBase64: newImages || [],
  favorite: false, cooked: false,
  createdAt: new Date(), reviews: []
});
cancelEdit();
}

addRecipeBtn.textContent = currentView === 'wishlist' ? 'Добавить в список желаний' : 'Добавить рецепт';
}

// --- Удаление ---
async function deleteRecipe(id) {
const col = currentView === 'wishlist' ? wishlistCol : recipesCol;
try {
if (editingId === id) cancelEdit();
await deleteDoc(doc(db, col.path, id));
if (currentRecipeId === id) closeModal();
} catch (e) {
console.error(e);
showToast('Не удалось удалить рецепт', { type: 'error' });
}
}

// --- Открытие рецепта ---
async function openRecipe(id) {
currentRecipeId = id;
currentCollection = currentView === 'wishlist' ? 'wishlist' : 'recipes';

try {
const docRef = doc(db, currentCollection, id);
const recipeDoc = await getDoc(docRef);
if (!recipeDoc.exists()) { showToast('Рецепт не найден', { type: 'error' }); return; }
const r = recipeDoc.data();
currentRecipeData = r;
const images = getImages(r);

modalTitle.textContent = r.title || '';
modalImage.src = images[0] || '';
modalImage.style.display = images.length ? 'block' : 'none';

modalGallery.innerHTML = '';
if (images.length > 1) {
images.forEach((src, i) => {
const thumb = document.createElement('img');
thumb.src = src;
if (i === 0) thumb.classList.add('selected');
thumb.addEventListener('click', () => {
modalImage.src = src;
modalGallery.querySelectorAll('img').forEach(t => t.classList.remove('selected'));
thumb.classList.add('selected');
});
modalGallery.appendChild(thumb);
});
}

// Сброс пересчёта порций при каждом открытии
modalIngredients.innerHTML = ingredientsToHtml(r.ingredientsShort) || '';
portTo.value = '';
modalSteps.innerHTML = renderStepsHtml(r.steps);
// Семейный комментарий
if (r.familyNote) {
  modalFamilyNote.innerHTML = `
    <div class="family-note-full">
      <span class="fn-label">💬 Семейный комментарий</span>
      <span class="fn-text">${escapeHtml(r.familyNote)}</span>
    </div>
  `;
} else {
  modalFamilyNote.innerHTML = '';
}

// Кто готовил
if (r.cookedBy) {
  const dateStr = r.cookedAt
    ? new Date(r.cookedAt.seconds ? r.cookedAt.seconds * 1000 : r.cookedAt).toLocaleDateString('ru-RU')
    : '';
  modalCookedBy.innerHTML = `
    <div style="margin:10px 0; font-size:0.9em; color:#7a4a1f;">
      <b>👨‍🍳 Готовил(а):</b> ${escapeHtml(r.cookedBy)}${dateStr ? ` · <span style="color:#888;">${dateStr}</span>` : ''}
    </div>
  `;
} else {
  modalCookedBy.innerHTML = '';
}
modalMeta.textContent = r.link ? `Источник: ${escapeHtml(r.link)}` : '';

doneBtn.style.display = currentCollection === 'wishlist' ? 'block' : 'none';
favModalBtn.style.display = currentCollection === 'recipes' ? 'block' : 'none';
cookedModalBtn.style.display = currentCollection === 'recipes' ? 'block' : 'none';
favModalBtn.textContent = r.favorite ? '⭐' : '☆';
favModalBtn.classList.toggle('fav-active', !!r.favorite);
cookedModalBtn.textContent = r.cooked ? '✓' : '☐';
cookedModalBtn.classList.toggle('cooked-active', !!r.cooked);

selectedStars = 0;
updateStarsUI();
renderReviews(r.reviews || []);
stopSpeech();
stopGlobalTimer();
modal.style.display = 'block';
modal.classList.add('show');
modal.scrollTo({ top: 0, behavior: 'smooth' });

// Активируем sticky-эффект заголовка при скролле
requestAnimationFrame(() => {
  const stickyHead = modal.querySelector('.modal-sticky-head');
  if (!stickyHead) return;

  const onScroll = () => {
    if (modal.scrollTop > 80) {
      stickyHead.classList.add('scrolled');
    } else {
      stickyHead.classList.remove('scrolled');
    }
  };
  // Убираем старый обработчик, если был
  if (modal._stickyHandler) modal.removeEventListener('scroll', modal._stickyHandler);
  modal._stickyHandler = onScroll;
  modal.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
} catch (e) {
console.error(e);
showToast('Ошибка при открытии рецепта', { type: 'error' });
}
}

function closeModal() {
  stopSpeech();
  stopGlobalTimer();
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
    currentRecipeId = null;
    currentRecipeData = null;
  }, 250);
}
closeModalBtn.addEventListener('click', closeModal);
document.getElementById('closeModalFloat').addEventListener('click', closeModal);
editFromModalBtn.addEventListener('click', () => {
if (!currentRecipeId) return;
startEdit(currentRecipeId);
});

favModalBtn.addEventListener('click', async () => {
if (!currentRecipeId || currentCollection !== 'recipes') return;
const r = allRecipes.find(x => x.id === currentRecipeId);
if (!r) return;
await toggleFavorite(currentRecipeId);
favModalBtn.textContent = !r.favorite ? '⭐' : '☆';
favModalBtn.classList.toggle('fav-active', !r.favorite);
});

cookedModalBtn.addEventListener('click', async () => {
  if (!currentRecipeId || currentCollection !== 'recipes') return;
  const r = allRecipes.find(x => x.id === currentRecipeId);
  if (!r) return;
  const turningOn = !r.cooked;
  await toggleCooked(currentRecipeId);
  if (turningOn) {
    const rect = cookedModalBtn.getBoundingClientRect();
    launchConfetti(rect.left + rect.width / 2, rect.top);
  }
  // Перерисовываем модалку — обновляется плашка «кто готовил»
  openRecipe(currentRecipeId);
});

// --- Рейтинг ---
function updateStarsUI() {
starsInput.querySelectorAll('button').forEach(btn => {
const n = parseInt(btn.getAttribute('data-star'), 10);
btn.classList.toggle('active', n <= selectedStars);
});
}

starsInput.querySelectorAll('button').forEach(btn => {
btn.addEventListener('click', () => {
selectedStars = parseInt(btn.getAttribute('data-star'), 10);
updateStarsUI();
starsInput.querySelectorAll('button').forEach((b, i) => {
const n = parseInt(b.getAttribute('data-star'), 10);
if (n <= selectedStars) {
setTimeout(() => {
b.classList.remove('pop');
void b.offsetWidth;
b.classList.add('pop');
setTimeout(() => b.classList.remove('pop'), 450);
}, i * 90);
}
});
});
});

async function addReview() {
const name = reviewName.value.trim();
const text = reviewText.value.trim();
if (!selectedStars) { showToast('Выберите звёзды', { type: 'warn' }); return; }
if (!name) { showToast('Укажите имя', { type: 'warn' }); return; }
if (!currentRecipeId) return;

const docRef = doc(db, currentCollection, currentRecipeId);
const recipeDoc = await getDoc(docRef);
if (!recipeDoc.exists()) { showToast('Рецепт не найден', { type: 'error' }); closeModal(); return; }

const reviews = recipeDoc.data().reviews || [];
reviews.push({ name, stars: selectedStars, text, date: new Date() });
await setDoc(docRef, { reviews }, { merge: true });

reviewName.value = '';
reviewText.value = '';
selectedStars = 0;
updateStarsUI();
openRecipe(currentRecipeId);
}

function renderReviews(reviews) {
const { avg, count } = getRating({ reviews });
let header = avg
? `<div class="rating-line">${starsText(avg)} <span class="rating-count">${avg} из 5 · оценок: ${count}</span></div>`
: '<p>Ещё нет оценок — поставьте первую!</p>';
const items = reviews.slice().reverse().map(rev => {
let dateStr = '';
try { dateStr = new Date(rev.date.seconds ? rev.date.seconds * 1000 : rev.date).toLocaleDateString(); } catch(e) {}
return `<div class="review-item">
<span class="review-stars">${starsText(rev.stars)}</span>
<b>${escapeHtml(rev.name)}</b> <small>${dateStr}</small><br>
${rev.text ? escapeHtml(rev.text) : '<small>без отзыва</small>'}
</div>`;
}).join('');
reviewsList.innerHTML = header + items;
}

// --- Перенос wishlist -> recipes (общая функция) ---
async function moveWishlistToRecipes(id) {
  const docRef = doc(db, 'wishlist', id);
  const recipeDoc = await getDoc(docRef);
  if (!recipeDoc.exists()) { showToast('Рецепт не найден', { type: 'error' }); return null; }
  const r = recipeDoc.data();
  const images = getImages(r);

  const newDoc = await addDoc(recipesCol, {
    title: r.title, category: r.category, ingredientsShort: r.ingredientsShort || '',
    steps: r.steps, link: r.link,
    imageBase64: images[0] || '',
    imagesBase64: images,
    favorite: r.favorite || false, cooked: true, cookedAt: new Date(),
    createdAt: new Date(), reviews: r.reviews || []
  });

  await deleteDoc(docRef);
  return newDoc.id;
}

doneBtn.addEventListener('click', async () => {
  if (!currentRecipeId || currentCollection !== 'wishlist') return;
  try {
    const newId = await moveWishlistToRecipes(currentRecipeId);
    if (newId) {
      const rect = doneBtn.getBoundingClientRect();
      launchConfetti(rect.left + rect.width / 2, rect.top);
      closeModal();
    }
  } catch (e) {
    console.error(e);
    alert('Не удалось переместить рецепт');
  }
});

// --- Обработчики ---
addRecipeBtn.addEventListener('click', addRecipe);
addReviewBtn.addEventListener('click', addReview);
