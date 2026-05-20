// ═══════════════════════════════════════════════
// LÓGICA
// ═══════════════════════════════════════════════
let activeCategory = 'all';

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
  CATEGORIES.forEach(cat=>{
    if (cat.id === 'all') return; // Saltamos "Todos" porque ahora tenemos Home
    const btn=document.createElement('button');
    btn.className='nav-btn'+(cat.id===activeCategory?' active':'');
    btn.innerHTML=`<span class="nav-icon">${cat.icon}</span><span>${cat.name}</span><span class="nav-count">${counts[cat.id]||0}</span>`;
    btn.onclick=()=>{
      activeCategory=cat.id;
      updateActiveBtn(btn);
      const h2 = document.getElementById('category-title');
      h2.style.animation = 'none';
      h2.offsetHeight; // reflow
      h2.style.animation = '';
      h2.textContent=cat.name;
      document.getElementById('eyebrow-text').textContent=cat.icon+' '+cat.name.toUpperCase();
      renderGrid(); closeSidebar();
    };
    nav.appendChild(btn);
  });
}

function updateActiveBtn(activeBtn) {
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  if (activeBtn) activeBtn.classList.add('active');
}

function goHome() {
  activeCategory = 'all';
  updateActiveBtn(document.getElementById('btn-home'));
  document.getElementById('category-title').textContent = 'Todos los Programas';
  document.getElementById('eyebrow-text').textContent = 'LISTADO COMPLETO';
  document.getElementById('search').value = '';
  renderGrid();
  closeSidebar();
}

function buildStats(){
  document.getElementById('stat-programs').textContent=PROGRAMS.length;
  document.getElementById('stat-shortcuts').textContent=PROGRAMS.reduce((a,p)=>a+p.shortcuts.length,0);
}

function getIcon(name, color){
  if(ICONS[name]) return `<div class="card-icon">${ICONS[name]}</div>`;
  const ini=name.replace(/[^a-zA-Z0-9]/g,'').substring(0,2).toUpperCase();
  return `<div class="card-icon" style="background:${color||'#6366f1'}"><span class="fb">${ini}</span></div>`;
}

function renderGrid(){
  const q=document.getElementById('search').value.toLowerCase().trim();
  const grid=document.getElementById('grid');
  
  // Si hay búsqueda, forzamos vista "all" para que sea global, 
  // pero solo si el usuario no ha seleccionado una categoría específica recientemente
  // O mejor aún: si hay búsqueda, filtramos sin importar la categoría activa 
  // pero visualmente mostramos que estamos buscando en todo.
  
  const filtered=PROGRAMS.filter(p=>{
    const matchesQuery = !q || p.program.toLowerCase().includes(q) || 
                         p.shortcuts.some(s=>s.description.toLowerCase().includes(q) || 
                         s.keys.some(k=>k.toLowerCase().includes(q)));
    
    if (q) return matchesQuery; // Búsqueda global si hay texto
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    return true;
  }).sort((a,b)=>a.program.localeCompare(b.program));

  // Actualizar título si hay búsqueda
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
    card.style.animationDelay=`${Math.min(idx*35,350)}ms`;
    const shortcuts=q?prog.shortcuts.filter(s=>s.description.toLowerCase().includes(q)||s.keys.some(k=>k.toLowerCase().includes(q))):prog.shortcuts;
    const rows=shortcuts.map(sh=>{
      const keysHtml=sh.keys.map((k,ki)=>`<kbd>${highlight(escH(k),q)}</kbd>${ki<sh.keys.length-1?'<span class="key-sep">+</span>':''}`).join('');
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
}

function highlight(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function escH(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function setView(mode){
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

buildNav(); buildStats(); renderGrid();

