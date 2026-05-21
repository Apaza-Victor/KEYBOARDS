// ═══════════════════════════════════════════════
// LÓGICA
// ═══════════════════════════════════════════════
let activeCategory = 'all';
let currentView = 'grid';

function getCatName(id){ return (CATEGORIES.find(c=>c.id===id)||{}).name||''; }

function getCatCounts(){
  const counts={all:PROGRAMS.length};
  CATEGORIES.forEach(c=>{ if(c.id!=='all') counts[c.id]=PROGRAMS.filter(p=>p.category===c.id).length; });
  return counts;
}

function buildNav(){
  const counts=getCatCounts();
  const nav=document.getElementById('nav-list');
  nav.innerHTML='';
  CATEGORIES.forEach((cat,idx)=>{
    if (cat.id === 'all') return; 
    const btn=document.createElement('button');
    btn.className='nav-btn'+(cat.id===activeCategory?' active':'');
    btn.setAttribute('data-id', cat.id);
    btn.innerHTML=`<span class="nav-icon">${cat.icon}</span><span>${cat.name}</span><span class="nav-count">${counts[cat.id]||0}</span>`;
    btn.onclick=()=>selectCategory(cat.id);
    nav.appendChild(btn);
  });
}

function selectCategory(catId){
  if (!catId) return;
  activeCategory = catId;
  
  // 1. Limpiar estados activos de TODOS los botones de navegación
  // Buscamos tanto los estáticos como los dinámicos
  const allNavBtns = document.querySelectorAll('.nav-btn, #btn-home, #btn-home-header');
  allNavBtns.forEach(btn => btn.classList.remove('active'));

  // 2. Aplicar estado activo al botón correcto
  if (catId === 'all') {
    const btnHome = document.getElementById('btn-home');
    const btnHomeHeader = document.getElementById('btn-home-header');
    if (btnHome) btnHome.classList.add('active');
    if (btnHomeHeader) btnHomeHeader.classList.add('active');
  } else {
    // Buscar por el atributo data-id que pusimos en buildNav
    const targetBtn = document.querySelector(`.nav-btn[data-id="${catId}"]`);
    if (targetBtn) {
      targetBtn.classList.add('active');
    }
  }

  // 3. Actualizar interfaz (Títulos y Eyebrow)
  const h2 = document.getElementById('category-title');
  const eyebrow = document.getElementById('eyebrow-text');
  const cat = CATEGORIES.find(c => c.id === catId);

  if (h2) {
    h2.style.animation = 'none';
    h2.offsetHeight; // trigger reflow
    h2.style.animation = '';
    h2.textContent = cat ? cat.name : 'Todos los Programas';
  }
  
  if (eyebrow) {
    eyebrow.textContent = catId === 'all' ? 'LISTADO COMPLETO' : (cat ? cat.icon + ' ' + cat.name.toUpperCase() : '');
  }
  
  // 4. Resetear búsqueda y filtrar
  document.getElementById('search').value = '';
  hideSuggestions();
  renderGrid(); 
  
  // 5. Utilidades de navegación
  closeSidebar();
  updateHash();
  
  // Scroll al inicio del contenido al cambiar de categoría
  const content = document.getElementById('content');
  if (content) content.scrollTop = 0;
}

function goHome(){
  selectCategory('all');
  document.getElementById('content').scrollTop=0;
}

function initHeroLogos() {
  const container = document.getElementById('hero-logos');
  if (!container || container.children.length > 0) return; 

  // Aumentamos la cantidad de logos para llenar todo el fondo
  const progsToFloat = [...PROGRAMS].sort(() => 0.5 - Math.random()).slice(0, 25);

  progsToFloat.forEach((prog, i) => {
    const el = document.createElement('div');
    el.className = 'floating-logo';
    
    // Distribuir a lo largo de todo el ancho (0% a 95%)
    const left = (Math.random() * 95) + '%';
    const duration = (Math.random() * 15 + 20) + 's'; // Más lento para que sea elegante
    const delay = (Math.random() * -20) + 's'; // Delay negativo para que empiecen en diferentes puntos
    
    el.style.setProperty('--left', left);
    el.style.setProperty('--duration', duration);
    el.style.setProperty('--delay', delay);
    
    el.innerHTML = getIcon(prog.program, prog.color);
    container.appendChild(el);
  });
}

function buildStats(){
  document.getElementById('stat-programs').textContent=PROGRAMS.length;
  document.getElementById('stat-shortcuts').textContent=PROGRAMS.reduce((a,p)=>a+p.shortcuts.length,0);
}

const CUSTOM_SVGS = {
  'aftereffects': `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect width="256" height="256" rx="38" fill="#00005b"/><path d="M101.4 172l-8.6-24.8H58.2l-8.4 24.8H34.4l34-92.4h22.4l34 92.4h-13.4zm-13.6-34.8l-12.4-36.2-12.2 36.2h24.6zm80.2 13.8c-8.6 0-15.6-2.4-21-7.2-5.4-4.8-8.2-12.2-8.2-22.2v-4.4c0-10 2.8-17.4 8.2-22.2s12.4-7.2 21-7.2c8.2 0 14.8 2.2 20 6.6s7.8 11.2 7.8 20.4h-12.2c0-5.8-1.2-10-3.6-12.8s-6-4.2-11.2-4.2c-5.2 0-9 1.8-11.4 5.4s-3.6 10-3.6 19v5.2c0 9 1.2 15.4 3.6 19s6.2 5.4 11.4 5.4c5.4 0 9.2-1.4 11.4-4.2s3.6-7 3.6-12.8h12.2c0 9.2-2.6 16.2-7.8 20.6-5.2 4.4-11.8 6.6-20 6.6z" fill="#d291ff"/></svg>`,
  
  'capcut': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h4v16h-4V4zM4 4h4v16H4V4zm6 4h4v8h-4V8z" fill="currentColor"/></svg>`,
  
  'davinciresolve': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="7.5" r="4.5" fill="#ff4d4d"/><circle cx="7.5" cy="15.5" r="4.5" fill="#4dff4d"/><circle cx="16.5" cy="15.5" r="4.5" fill="#4d4dff"/></svg>`,
  
  'anki': `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 4l8.3 17h18.7l-13.5 13.2 3.2 18.8-16.7-8.8-16.7 8.8 3.2-18.8-13.5-13.2h18.7z" fill="#5b9cfd"/></svg>`,
  
  'sonyvegaspro': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 2h20v20H2V2zm18 18V4H4v16h16zM6 7l4 10h2l4-10h-2l-3 7.5L8 7H6z" fill="#0070c0"/></svg>`,
  
  'illustrator': `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect width="256" height="256" rx="38" fill="#330000"/><path d="M101.4 172l-8.6-24.8H58.2l-8.4 24.8H34.4l34-92.4h22.4l34 92.4h-13.4zm-13.6-34.8l-12.4-36.2-12.2 36.2h24.6zm44.2 34.8V84.2h12.2V172h-12.2zm48 0V84.2h12.2V172h-12.2z" fill="#ff9a00"/></svg>`,
  
  'photoshop': `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect width="256" height="256" rx="38" fill="#001e36"/><path d="M91.2 133.2c0 9.4-2.2 16.4-6.6 20.8s-10.8 6.6-19.2 6.6H50v11.4H35.6V84.2h32c8.2 0 14.6 2.2 19 6.6s6.6 11.2 6.6 20.4v22zm-14.4-23c0-10.8-5-16.2-15-16.2H50v32.4h11.8c10 0 15-5.4 15-16.2v-16.2zm76.6 44.2c-5.2 4.4-12.2 6.6-20.8 6.6-8.2 0-14.8-2.2-20-6.6s-7.8-10.8-7.8-19.2h13.2c0 9.2 4.8 13.8 14.6 13.8 4.6 0 8.2-1 10.6-3s3.6-4.8 3.6-8.4c0-3.4-1-6-3-7.8s-6-3.6-12.2-5.4c-8.6-2.6-14.8-5.6-18.4-9.2s-5.4-8.8-5.4-15.6c0-7.8 2.6-14 7.8-18.4s12.2-6.6 20.8-6.6c7.8 0 14.2 2 19.2 6s7.6 10 7.6 18h-13.2c0-8-4.4-12-13.2-12-4.2 0-7.6 1-10 3s-3.6 4.8-3.6 8.2c0 3.2 1 5.8 3 7.6s6 3.4 12 5.2c8.6 2.6 14.8 5.6 18.4 9.2s5.4 9 5.4 16.2c0 8.4-2.6 15-7.8 19.4z" fill="#31a8ff"/></svg>`,
  
  'indesign': `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect width="256" height="256" rx="38" fill="#49021f"/><path d="M94 172V84.2h12.2V172H94zm48 0V84.2h15.2c9.4 0 16.8 2.6 22 7.8s7.8 12.8 7.8 22.8v34.4c0 10-2.6 17.6-7.8 22.8s-12.6 7.8-22 7.8H142zm12.2-11.4h3c10.8 0 16.2-5.4 16.2-16.2v-34.4c0-10.8-5.4-16.2-16.2-16.2h-3V160.6z" fill="#ff3366"/></svg>`
};

function getIcon(name, color){
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Si tenemos un SVG personalizado, lo usamos directamente
  if (CUSTOM_SVGS[slug]) {
    return `<div class="card-icon" style="background: var(--surface2) !important;">
      ${CUSTOM_SVGS[slug]}
    </div>`;
  }

  const iconMappings = {
    'vscode': 'visualstudiocode',
    'chromebrave': 'googlechrome',
    'terminallinuxmac': 'gnumetadataterminal',
    'cmdwindows': 'windows',
    'zabbixwebui': 'zabbix',
    'sqlserver': 'microsoftsqlserver',
    'osirixhoros': 'apple',
    'blufftitler': 'adobe',
    'anki': 'anki',
    'pubmed': 'pubmed',
    'premierepro': 'adobepremierepro',
    'aftereffects': 'adobeaftereffects',
    'photoshop': 'adobephotoshop',
    'illustrator': 'adobeillustrator',
    'indesign': 'adobeindesign',
    'audition': 'adobeaudition',
    'excel': 'microsoftexcel',
    'word': 'microsoftword',
    'powerpoint': 'microsoftpowerpoint',
    'teams': 'microsoftteams',
    'obsstudio': 'obsstudio',
    'flstudio': 'flstudio',
    'abletonlive': 'abletonlive',
    'unrealengine': 'unrealengine',
    'unity': 'unity',
    'autocad': 'autodeskautocad',
    'maya': 'autodeskmaya',
    'cinema4d': 'maxoncinema4d',
    'zbrush': 'pixologicizbrush',
    'windows11': 'windows11',
    'androidstudio': 'androidstudio',
    'mongodb': 'mongodb',
    'pycharm': 'pycharm',
    'intellijidea': 'intellijidea',
    'sublimetext': 'sublimetext',
    'postman': 'postman',
    'discord': 'discord',
    'slack': 'slack',
    'trello': 'trello',
    'notion': 'notion',
    'spotify': 'spotify',
    'sketched': 'sketchup',
    'sketchup': 'sketchup',
    'capcut': 'capcut',
    'davinciresolve': 'davinciresolve',
    'sonyvegaspro': 'sonyvegas',
    'finalcutpro': 'finalcutpro',
    'krita': 'krita',
    'canva': 'canva'
  };

  const finalSlug = iconMappings[slug] || slug;
  
  const iconColor = color ? color.replace('#', '') : '6366f1'; 
  const iconUrl = `https://cdn.simpleicons.org/${finalSlug}/${iconColor}`;

  return `<div class="card-icon" style="background: var(--surface2) !important;">
    <img src="${iconUrl}" 
         alt="${name}" 
         loading="lazy" 
         onload="this.style.opacity=1"
         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
         style="opacity:0; transition: opacity 0.2s; width:70%; height:70%; object-fit:contain;">
    <span class="fb" style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-family:'Space Mono',monospace; font-weight:700; font-size:12px; color:var(--text-strong);">${name.substring(0,2).toUpperCase()}</span>
  </div>`;
}

function renderGrid(){
  const q=document.getElementById('search').value.toLowerCase().trim();
  const grid=document.getElementById('grid');
  const hero=document.getElementById('home-hero');
  
  // Mostrar u ocultar Hero según la categoría y búsqueda
  if (activeCategory === 'all' && !q) {
    hero.classList.add('show');
    initHeroLogos();
  } else {
    hero.classList.remove('show');
  }

  const filtered=PROGRAMS.filter(p=>{
    const matchesQuery = !q || p.program.toLowerCase().includes(q) || 
                         p.shortcuts.some(s=>s.description.toLowerCase().includes(q) || 
                         s.keys.some(k=>k.toLowerCase().includes(q)));
    
    if (q) return matchesQuery; 
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    return true;
  }).sort((a,b)=>a.program.localeCompare(b.program));

  const h2 = document.getElementById('category-title');
  const eyebrow = document.getElementById('eyebrow-text');
  
  if (q) {
    h2.textContent = `Resultados para "${q}"`;
    eyebrow.textContent = '🔍 BÚSQUEDA GLOBAL';
  } else {
    const cat = CATEGORIES.find(c => c.id === activeCategory);
    h2.textContent = cat ? cat.name : 'Todos los Programas';
    eyebrow.textContent = activeCategory === 'all' ? 'LISTADO COMPLETO' : (cat ? cat.icon + ' ' + cat.name.toUpperCase() : '');
  }

  document.getElementById('result-count').textContent=`${filtered.length} programa${filtered.length!==1?'s':''} · ${filtered.reduce((a,p)=>a+p.shortcuts.length,0)} atajos`;
  grid.innerHTML='';

  if(!filtered.length){
    grid.innerHTML=`<div class="empty"><div class="empty-icon">🔍</div><h3>SIN RESULTADOS</h3><p>No encontramos nada para "<strong>${escH(q)}</strong>"</p></div>`;
    return;
  }

  filtered.forEach((prog,idx)=>{
    const card=document.createElement('div');
    card.className='card';
    card.setAttribute('tabindex','0');
    card.style.animationDelay=`${Math.min(idx*35,350)}ms`;
    
    // Si el nombre del programa coincide exactamente con la búsqueda (insensible a mayúsculas),
    // mostramos todos sus atajos. De lo contrario, filtramos los atajos por la consulta.
    const isExactProgramMatch = prog.program.toLowerCase() === q;
    const shortcuts = (q && !isExactProgramMatch) 
      ? prog.shortcuts.filter(s => s.description.toLowerCase().includes(q) || s.keys.some(k => k.toLowerCase().includes(q)))
      : prog.shortcuts;
    
    const rows=shortcuts.map(sh=>{
      const keysHtml=sh.keys.map((k,ki)=>{
        const keyLabel=k===' '?'Espacio':k;
        return `<kbd data-keys='${escH(k)}'>${highlight(escH(keyLabel),q)}</kbd>${ki<sh.keys.length-1?'<span class="key-sep">+</span>':''}`;
      }).join('');
      return `<li class="shortcut-row"><span class="shortcut-desc">${highlight(escH(sh.description),q)}</span><div class="keys-group">${keysHtml}</div></li>`;
    }).join('');

    card.innerHTML=`
      <div class="card-header">
        ${getIcon(prog.program,prog.color)}
        <div class="card-meta"><h3>${highlight(escH(prog.program),q)}</h3><div class="cat-tag">${escH(getCatName(prog.category))}</div></div>
        <span class="card-count">${shortcuts.length} atajos</span>
      </div>
      <div class="card-body"><ul style="list-style:none">${rows}</ul></div>`;
    grid.appendChild(card);
  });

  document.querySelectorAll('kbd[data-keys]').forEach(kbd=>{
    kbd.style.cursor='pointer';
    kbd.title='Clic para copiar';
    kbd.addEventListener('click',(e)=>{
      e.stopPropagation();
      const keys=kbd.getAttribute('data-keys');
      navigator.clipboard.writeText(keys).then(()=>{
        kbd.style.background='rgba(99,102,241,0.4)';
        kbd.style.borderColor='var(--accent)';
        setTimeout(()=>{
          kbd.style.background='';
          kbd.style.borderColor='';
        },800);
      });
    });
  });
}

function highlight(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function escH(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function setView(mode){
  currentView=mode;
  const grid=document.getElementById('grid');
  document.getElementById('btn-grid').classList.toggle('active',mode==='grid');
  document.getElementById('btn-list').classList.toggle('active',mode==='list');
  grid.classList.toggle('list-view',mode==='list');
}

function toggleSidebar(){ document.getElementById('sidebar').classList.toggle('open'); document.getElementById('overlay').classList.toggle('open'); }
function closeSidebar(){ document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('open'); }

function scrollToTop() {
  document.getElementById('content').scrollTo({ top: 0, behavior: 'smooth' });
}

// Control del botón volver arriba
document.getElementById('content').addEventListener('scroll', (e) => {
  const btn = document.getElementById('back-to-top');
  if (e.target.scrollTop > 300) {
    btn.classList.add('show');
  } else {
    btn.classList.remove('show');
  }
});

function showSuggestions(){
  const q=document.getElementById('search').value.toLowerCase().trim();
  const sug=document.getElementById('suggestions');
  if(!sug) return;
  if(!q || q.length<1){ hideSuggestions(); return; }
  const matches=PROGRAMS.filter(p=>p.program.toLowerCase().includes(q)).slice(0,6);
  const descMatches=PROGRAMS.filter(p=>p.shortcuts.some(s=>s.description.toLowerCase().includes(q))&&!p.program.toLowerCase().includes(q)).slice(0,4);
  if(!matches.length && !descMatches.length){ hideSuggestions(); return; }
  let html='';
  if(matches.length){
    html+='<div class="sug-section">PROGRAMAS</div>';
    matches.forEach(p=>{
      html+=`<div class="sug-item" onclick="selectSuggestion('${escH(p.program)}')">${escH(p.program)} <span class="sug-cat">${getCatName(p.category)}</span></div>`;
    });
  }
  if(descMatches.length){
    html+='<div class="sug-section">FUNCIONES</div>';
    descMatches.forEach(p=>{
      const found=p.shortcuts.find(s=>s.description.toLowerCase().includes(q));
      if(found) html+=`<div class="sug-item" onclick="selectSuggestion('${escH(p.program)}')">${escH(found.description)} <span class="sug-cat">en ${escH(p.program)}</span></div>`;
    });
  }
  sug.innerHTML=html;
  sug.style.display='block';
}

function hideSuggestions(){
  const sug = document.getElementById('suggestions');
  if(sug) sug.style.display='none';
}

function selectSuggestion(program){
  document.getElementById('search').value=program;
  hideSuggestions();
  renderGrid();
}

function updateHash(){
  if(activeCategory==='all'){
    history.replaceState(null,'',' ');
  } else {
    history.replaceState(null,'',window.location.pathname+'#'+activeCategory);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcons(newTheme);
}

function updateThemeIcons(theme) {
  const darkIcon = document.getElementById('theme-icon-dark');
  const lightIcon = document.getElementById('theme-icon-light');
  if (darkIcon && lightIcon) {
    if (theme === 'dark') {
      darkIcon.style.display = 'none';
      lightIcon.style.display = 'block';
    } else {
      darkIcon.style.display = 'block';
      lightIcon.style.display = 'none';
    }
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);
}

function handleHash(){
  const hash=window.location.hash.slice(1);
  if(hash){
    const cat=CATEGORIES.find(c=>c.id===hash);
    if(cat){
      selectCategory(hash);
    }
  }
}

function toggleKbdHint(){
  const hint = document.getElementById('kbd-hint');
  if (hint) hint.classList.toggle('show');
}

// Event Listeners
document.getElementById('search').oninput = () => {
  renderGrid();
  showSuggestions();
};

document.addEventListener('keydown',(e)=>{
  const tag=document.activeElement.tagName;
  const isInput=tag==='INPUT'||tag==='TEXTAREA';

  if(e.key==='/' && !isInput){
    e.preventDefault();
    document.getElementById('search').focus();
    hideSuggestions();
  }

  if((e.ctrlKey||e.metaKey)&&e.key==='k'){
    e.preventDefault();
    document.getElementById('search').focus();
    hideSuggestions();
  }

  if(e.key==='Escape'){
    const sug = document.getElementById('suggestions');
    if(sug && sug.style.display==='block'){
      hideSuggestions();
    } else {
      closeSidebar();
      document.getElementById('search').blur();
      document.getElementById('search').value='';
      renderGrid();
    }
  }

  if(!isInput){
    if(e.key==='h'||e.key==='H'){
      goHome();
    }
    if(e.key==='g'||e.key==='G'){
      setView('grid');
    }
    if(e.key==='l'||e.key==='L'){
      setView('list');
    }
    if(e.key==='t'||e.key==='T'){
      scrollToTop();
    }
    
    // Categorías por números
    const num = parseInt(e.key);
    if (num === 1) selectCategory('all');
    else if (num > 1 && num <= CATEGORIES.length) {
      selectCategory(CATEGORIES[num-1].id);
    }

    if(e.key==='s'||e.key==='S'){
      e.preventDefault();
      toggleSidebar();
    }
  }
});

document.addEventListener('click',(e)=>{
  if(!e.target.closest('.search-wrap')){
    hideSuggestions();
  }
});

window.addEventListener('hashchange',handleHash);

// Inicialización
initTheme();
buildNav(); 
buildStats(); 
renderGrid();
handleHash();
