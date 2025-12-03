const lower = "abcdefghijklmnopqrstuvwxyz";
const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";
const symbols = "!@#$%^&*()_+[]{}<>?/|~=-";

const state = {
  slider: 0,
  options: {
    uppercase: false,
    lowercase: true,
    numbers: false,
    symbols: false
  },
  password: []
};

const root = document.querySelector('#password-generator');

const slider = root.querySelector('#length');
const pw_length = root.querySelector('#length-value');
const checkboxes = root.querySelectorAll('[data-option]');
const output = root.querySelector('#password');
const generate_btn = root.querySelector('.generate');
const strengthEl = root.querySelector('.strength_result');
const copy_btn = root.querySelector('.copy-btn');
const info = root.querySelector('#copy-text');
const strengthTextEl = root.querySelector('#strength_text');


slider.addEventListener('input', () => {
  state.slider = Number(slider.value);
  pw_length.innerHTML = state.slider;
  updateSliderFill();
});

generate_btn.addEventListener('click', (event) => {
  event.preventDefault();
  generator();
});

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    const option = checkbox.dataset.option;
    state.options[option] = checkbox.checked;
    console.log(option, state.options[option]);
  });
});

copy_btn.addEventListener('click', () => {
  const pw = output.value;

  navigator.clipboard.writeText(pw)
    .then(() => {
      showCopiedMessage();
      console.log("Password copied!");
    })
    .catch(err => {
      console.error("Copy failed", err);
    });
});

window.addEventListener("load", () => {
  syncUIToState();
  updateSliderFill();
});



function generator() {
  state.password = [];

  // 1. Zeichenvorrat (pool) anhand der Optionen aufbauen
  let pool = "";

  if (state.options.lowercase) pool += lower;
  if (state.options.uppercase) pool += upper;
  if (state.options.numbers)   pool += numbers;
  if (state.options.symbols)   pool += symbols;

  // 2. Wenn kein Zeichentyp ausgewählt ist → abbrechen
  if (pool.length === 0) {
    console.warn("No character types selected – falling back to lowercase.");
    pool += lower;
  }

  // 3. Sicherstellen, dass die Länge > 0 ist
  if (state.slider > 0) {
    for (let step = 0; step < state.slider; step++) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      const char = pool[randomIndex];
      state.password.push(char);
    }

    const pw = state.password.join("");

    output.value = pw;

    // 4. Custom-Analyse
    pw_test(pw);
  }
}


function customScore(pw) {
  const length = pw.length;

  if (!pw) return 0;

  const hasLower   = /[a-z]/.test(pw);
  const hasUpper   = /[A-Z]/.test(pw);
  const hasNumber  = /[0-9]/.test(pw);
  const hasSymbol  = /[^A-Za-z0-9]/.test(pw);

  const groups = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;

  // 1) Extrem kurze Passwörter sind IMMER weak
  if (length < 8) {
    return 0;
  }

  // 2) Basis-Score nur aus den Gruppen
  let scoreBase;
  if (groups === 1) scoreBase = 0;   // nur eine Gruppe → eher schwach
  else if (groups === 2) scoreBase = 1;
  else if (groups === 3) scoreBase = 2;
  else scoreBase = 3;                // alle 4 Gruppen

  // 3) Längen-Bonus oben drauf
  if (length >= 12) scoreBase += 1;
  if (length >= 16) scoreBase += 1;

  // 4) Auf 0–3 begrenzen
  const level = Math.max(0, Math.min(3, scoreBase));

  return level;
}

function pw_test(pw) {
  const STRENGTH_LEVELS = [
    "strength--weak",
    "strength--medium",
    "strength--strong",
    "strength--very-strong"
  ];

  const STRENGTH_LABELS = [
    "TOO WEAK!",
    "WEAK",
    "MEDIUM",
    "STRONG"
  ];

  const level = customScore(pw);

  strengthEl.classList.remove(...STRENGTH_LEVELS);
  strengthEl.classList.add(STRENGTH_LEVELS[level]);

  strengthTextEl.textContent = STRENGTH_LABELS[level];

  return level;
}

function syncUIToState() {
  // slider
  state.slider = Number(slider.value);
  pw_length.innerHTML = state.slider;

  // checkboxes
  checkboxes.forEach(cb => {
    const opt = cb.dataset.option;
    state.options[opt] = cb.checked;
  });

  // Passwortfeld löschen
  output.value = "";

  // Stärkeanzeige zurücksetzen
  strengthEl.classList.remove(
    "strength--weak",
    "strength--medium",
    "strength--strong",
    "strength--very-strong"
  );
}


function showCopiedMessage() {
  info.classList.remove("hidden");

  // 1500ms ausfaden
  setTimeout(() => {
    info.classList.add("hidden");
  }, 1500);
}


function updateSliderFill() {
  const min = Number(slider.min);
  const max = Number(slider.max);
  const val = Number(slider.value);

  const percent = ((val - min) * 100) / (max - min) + "%";

  // CSS-Variable am Slider-Element setzen
  slider.style.setProperty("--track-fill", percent);
}