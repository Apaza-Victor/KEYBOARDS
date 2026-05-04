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
    const btn=document.createElement('button');
    btn.className='nav-btn'+(cat.id===activeCategory?' active':'');
    btn.innerHTML=`<span class="nav-icon">${cat.icon}</span><span>${cat.name}</span><span class="nav-count">${counts[cat.id]||0}</span>`;
    btn.onclick=()=>{
      activeCategory=cat.id;
      document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const h2 = document.getElementById('category-title');
      h2.style.animation = 'none';
      h2.offsetHeight; // reflow
      h2.style.animation = '';
      h2.textContent=cat.name;
      document.getElementById('eyebrow-text').textContent=cat.id==='all'?'LISTADO COMPLETO':cat.icon+' '+cat.name.toUpperCase();
      renderGrid(); closeSidebar();
    };
    nav.appendChild(btn);
  });
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
  const filtered=PROGRAMS.filter(p=>{
    if(activeCategory!=='all'&&p.category!==activeCategory) return false;
    if(!q) return true;
    return p.program.toLowerCase().includes(q)||p.shortcuts.some(s=>s.description.toLowerCase().includes(q)||s.keys.some(k=>k.toLowerCase().includes(q)));
  }).sort((a,b)=>a.program.localeCompare(b.program));

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
      const keysHtml=sh.keys.map((k,ki)=>`<kbd>${escH(k)}</kbd>${ki<sh.keys.length-1?'<span class="key-sep">+</span>':''}`).join('');
      return `<li class="shortcut-row"><span class="shortcut-desc">${escH(sh.description)}</span><div class="keys-group">${keysHtml}</div></li>`;
    }).join('');
    card.innerHTML=`
      <div class="card-header">
        ${getIcon(prog.program,prog.color)}
        <div class="card-meta"><h3>${escH(prog.program)}</h3><div class="cat-tag">${escH(getCatName(prog.category))}</div></div>
        <span class="card-count">${shortcuts.length} atajos</span>
      </div>
      <div class="card-body"><ul style="list-style:none">${rows}</ul></div>`;
    grid.appendChild(card);
  });
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

buildNav(); buildStats(); renderGrid();

