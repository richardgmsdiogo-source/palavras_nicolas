// Palavras Cruzadas — NICOLAS (fácil, assimétrico + ícones)
// Coluna azul é a 6ª (índice 5). As letras nela formam N I C O L A S.

const GRID_ROWS = 7;
const GRID_COLS = 11;
const COL_SPECIAL = 5;
const TARGET = 'NICOLAS';

// AJUSTES SOLICITADOS (AURORA com 'A' no final; dicas exatamente como pediu)
const ROWS = [
  { row:0, word:'NAVE',   align:0, clue:'Veículo do astronauta?' },           // N no começo
  { row:1, word:'ALIEN',  align:2, clue:'Amiguinho de outro planeta?' },      // I no meio (A L [I] E N)
  { row:2, word:'COMETA', align:0, clue:'Bola do espaço com cauda?' },        // C no começo
  { row:3, word:'ROBO',   align:1, clue:'Máquina que ajuda a explorar?' },    // O no meio
  { row:4, word:'LUA',    align:0, clue:'Companheira da Terra à noite?' },    // L no começo
  { row:5, word:'AURORA', align:5, clue:'Fenômeno luminoso no céu?' },        // A no final (índice 5)
  { row:6, word:'SOL',    align:0, clue:'Nossa estrela do dia?' },            // S no começo
];

// Ícones fofos nas casas bloqueadas
const EMOJIS = ['⭐','🌙','☁️','🚀','🛸','🪐','🌎','🌟','🔭','👽','☄️','🛰️'];

const gridEl     = document.getElementById('grid');
const btnCheck   = document.getElementById('btnCheck');
const btnHint    = document.getElementById('btnHint');
const btnReset   = document.getElementById('btnReset');
const overlayWin = document.getElementById('overlayWin');
const btnAgain   = document.getElementById('btnAgain');

let CELLS = [];
let inputs = [];
let PLACED = {};

function buildGrid(){
  gridEl.style.gridTemplateColumns = `repeat(${GRID_COLS}, var(--cell))`;
  gridEl.style.gridTemplateRows    = `repeat(${GRID_ROWS}, var(--cell))`;
  CELLS = []; gridEl.innerHTML = ''; PLACED = {};

  // Calcula o início de cada palavra (start = COL_SPECIAL - align)
  for(const R of ROWS){
    const start = COL_SPECIAL - R.align;
    const end   = start + R.word.length - 1;
    if(start < 0 || end >= GRID_COLS){
      throw new Error(`"${R.word}" não cabe: start=${start}, end=${end}`);
    }
    if(R.word[R.align] !== TARGET[R.row]){
      throw new Error(`Letra vertical difere na linha ${R.row}: esperado ${TARGET[R.row]} em "${R.word}"`);
    }
    PLACED[R.row] = { start, end, word: R.word };
  }

  // Constrói a grade
  for(let r=0; r<GRID_ROWS; r++){
    CELLS[r] = [];
    for(let c=0; c<GRID_COLS; c++){
      const cell = document.createElement('div');
      const P = PLACED[r];

      if(P && c >= P.start && c <= P.end){
        // célula com input
        cell.className = 'cell input';
        if(c === COL_SPECIAL) cell.classList.add('special');

        const input = document.createElement('input');
        input.setAttribute('maxlength','1');
        input.setAttribute('aria-label', `Linha ${r+1}, Coluna ${c+1}`);
        input.addEventListener('input', (e)=> onType(e, r, c));
        input.addEventListener('keydown', (e)=> onKey(e, r, c));
        cell.appendChild(input);

        CELLS[r][c] = { el:cell, input, active:true };
      }else{
        // bloqueada com emoji aleatório
        cell.className = 'cell block';
        const emo = document.createElement('span');
        emo.className = 'emo'; emo.setAttribute('aria-hidden','true');
        emo.textContent = EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
        emo.style.setProperty('--rot', `${(Math.random()*40-20).toFixed(1)}deg`);
        emo.style.setProperty('--scale', (0.9+Math.random()*0.4).toFixed(2));
        cell.appendChild(emo);

        CELLS[r][c] = { el:cell, input:null, active:false };
      }
      gridEl.appendChild(cell);
    }
  }

  // ordem de navegação
  inputs = [];
  for(const R of ROWS){
    for(let i=0;i<R.word.length;i++){
      const c = PLACED[R.row].start + i;
      inputs.push(CELLS[R.row][c].input);
    }
  }
}

// Entrada e navegação
function onType(e, r, c){
  const input = e.target;
  input.value = (input.value||'').toUpperCase().replace(/[^A-Z]/g,'');
  if(input.value.length === 1) focusNextInput(r,c);
}
function onKey(e, r, c){
  const k = e.key;
  if(k==='Backspace' && !e.target.value){ focusPrevInput(r,c); e.preventDefault(); return; }
  if(['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(k)){
    e.preventDefault();
    let nr=r, nc=c;
    if(k==='ArrowRight') nc++; if(k==='ArrowLeft') nc--; if(k==='ArrowUp') nr--; if(k==='ArrowDown') nr++;
    if(nr<0||nr>=GRID_ROWS||nc<0||nc>=GRID_COLS) return;
    const cell = CELLS[nr][nc];
    if(cell && cell.active && cell.input) cell.input.focus();
  }
}
function focusNextInput(r,c){ const idx = inputs.indexOf(CELLS[r][c].input); if(idx>=0 && idx<inputs.length-1) inputs[idx+1].focus(); }
function focusPrevInput(r,c){ const idx = inputs.indexOf(CELLS[r][c].input); if(idx>0) inputs[idx-1].focus(); }

// Conferência
function getFilledWord(row){
  const P = PLACED[row]; if(!P) return '';
  let s=''; for(let i=0;i<P.word.length;i++){ const c=P.start+i; s += (CELLS[row][c].input.value || ' '); }
  return s;
}
function checkAll(){
  let ok = true;
  for(const row of CELLS) for(const cell of row) if(cell&&cell.el) cell.el.classList.remove('wrong','right');

  for(const R of ROWS){
    const typed = getFilledWord(R.row);
    if(typed !== R.word){
      ok = false;
      for(let i=0;i<R.word.length;i++){ const c = PLACED[R.row].start + i; CELLS[R.row][c].el.classList.add('wrong'); }
    }else{
      for(let i=0;i<R.word.length;i++){ const c = PLACED[R.row].start + i; CELLS[R.row][c].el.classList.add('right'); }
    }
  }

  if(ok){
    let vertical=''; for(let r=0;r<GRID_ROWS;r++){ const cell=CELLS[r][COL_SPECIAL]; vertical += cell && cell.input ? (cell.input.value||' ') : ' '; }
    if(vertical === TARGET){ celebrate(); return true; }
  }
  return false;
}

// Dica: revela uma letra correta em uma palavra com erro
function revealHint(){
  for(const R of ROWS){
    const typed = getFilledWord(R.row);
    if(typed !== R.word){
      const idxs=[];
      for(let i=0;i<R.word.length;i++){
        const c = PLACED[R.row].start + i;
        const val = (CELLS[R.row][c].input.value || ' ').toUpperCase();
        if(val !== R.word[i]) idxs.push(i);
      }
      if(!idxs.length) continue;
      const ix = idxs[Math.floor(Math.random()*idxs.length)];
      const c = PLACED[R.row].start + ix;
      const cell = CELLS[R.row][c];
      cell.input.value = R.word[ix];
      cell.el.classList.add('right');
      focusNextInput(R.row, c);
      return;
    }
  }
}

// Reset / vitória
function resetAll(){
  for(const row of CELLS) for(const cell of row){
    if(cell && cell.active && cell.input){
      cell.input.value = '';
      cell.el.classList.remove('wrong','right');
    }
  }
  if(overlayWin) overlayWin.classList.add('hidden');
  if(inputs[0]) inputs[0].focus();
}
function celebrate(){ if(overlayWin) overlayWin.classList.remove('hidden'); }

// Inicialização
buildGrid();
if(document.querySelector('input')) document.querySelector('input').focus();
if(btnCheck) btnCheck.addEventListener('click', checkAll);
if(btnHint)  btnHint.addEventListener('click', revealHint);
if(btnReset) btnReset.addEventListener('click', resetAll);
if(btnAgain) btnAgain.addEventListener('click', resetAll);
