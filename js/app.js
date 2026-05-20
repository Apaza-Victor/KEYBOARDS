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
    const btn=document.createElement('button');
    btn.className='nav-btn'+(cat.id===activeCategory?' active':'');
    btn.innerHTML=`<span class="nav-icon">${cat.icon}</span><span>${cat.name}</span><span class="nav-count">${counts[cat.id]||0}</span>`;
    btn.onclick=()=>selectCategory(cat.id, idx);
    nav.appendChild(btn);
  });
}

function selectCategory(catId, idx){
  activeCategory=catId;
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const btns=document.querySelectorAll('.nav-btn');
  if(btns[idx]) btns[idx].classList.add('active');
  const h2 = document.getElementById('category-title');
  h2.style.animation = 'none';
  h2.offsetHeight;
  h2.style.animation = '';
  const cat=CATEGORIES.find(c=>c.id===catId);
  h2.textContent=cat?cat.name:'Todos los Programas';
  document.getElementById('eyebrow-text').textContent=catId==='all'?'LISTADO COMPLETO':(cat?cat.icon+' '+cat.name.toUpperCase():'');
  document.getElementById('search').value='';
  hideSuggestions();
  renderGrid(); closeSidebar();
  updateHash();
}

function goHome(){
  selectCategory('all', 0);
  document.getElementById('search').value='';
  document.getElementById('content').scrollTop=0;
  hideSuggestions();
  renderGrid();
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
    card.setAttribute('tabindex','0');
    card.style.animationDelay=`${Math.min(idx*35,350)}ms`;
    const shortcuts=q?prog.shortcuts.filter(s=>s.description.toLowerCase().includes(q)||s.keys.some(k=>k.toLowerCase().includes(q))):prog.shortcuts;
    const rows=shortcuts.map(sh=>{
      const keysHtml=sh.keys.map((k,ki)=>{
        const keyLabel=k===' '?'Espacio':k;
        return `<kbd data-keys='${escH(k)}'>${escH(keyLabel)}</kbd>${ki<sh.keys.length-1?'<span class="key-sep">+</span>':''}`;
      }).join('');
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

function showSuggestions(){
  const q=document.getElementById('search').value.toLowerCase().trim();
  const sug=document.getElementById('suggestions');
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
  document.getElementById('suggestions').style.display='none';
}

function selectSuggestion(program){
  document.getElementById('search').value=program;
  hideSuggestions();
  renderGrid();
}

function scrollToTop(){
  document.getElementById('content').scrollTop=0;
}

function updateHash(){
  if(activeCategory==='all'){
    history.replaceState(null,'',' ');
  } else {
    history.replaceState(null,'',window.location.pathname+'#'+activeCategory);
  }
}

function handleHash(){
  const hash=window.location.hash.slice(1);
  if(hash){
    const cat=CATEGORIES.find(c=>c.id===hash);
    if(cat){
      const idx=CATEGORIES.indexOf(cat);
      selectCategory(hash,idx);
    }
  }
}

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
    if(document.getElementById('suggestions').style.display==='block'){
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

    if(e.key==='1') selectCategory('all',0);
    if(e.key==='2') selectCategory('video',1);
    if(e.key==='3') selectCategory('graphic',2);
    if(e.key==='4') selectCategory('audio',3);
    if(e.key==='5') selectCategory('3d',4);
    if(e.key==='6') selectCategory('engineering',5);
    if(e.key==='7') selectCategory('medicine',6);
    if(e.key==='8') selectCategory('dev',7);
    if(e.key==='9') selectCategory('office',8);
    if(e.key==='0') selectCategory('streaming',9);

    if(e.key==='s'||e.key==='S'){
      e.preventDefault();
      toggleSidebar();
    }
  }
});

document.getElementById('search').addEventListener('keydown',(e)=>{
  const sug=document.getElementById('suggestions');
  if(sug.style.display==='block'){
    const items=sug.querySelectorAll('.sug-item');
    if(items.length){
      if(e.key==='ArrowDown'){
        e.preventDefault();
        const active=sug.querySelector('.sug-active');
        if(active) active.classList.remove('sug-active');
        const first=sug.querySelector('.sug-item');
        if(first) first.classList.add('sug-active');
      } else if(e.key==='ArrowUp'){
        e.preventDefault();
        const active=sug.querySelector('.sug-active');
        if(active) active.classList.remove('sug-active');
        const items=sug.querySelectorAll('.sug-item');
        if(items.length) items[items.length-1].classList.add('sug-active');
      } else if(e.key==='Enter'){
        e.preventDefault();
        const active=sug.querySelector('.sug-active');
        if(active){ active.click(); }
      }
    }
  }
});

document.addEventListener('click',(e)=>{
  if(!e.target.closest('.search-wrap')){
    hideSuggestions();
  }
});

window.addEventListener('hashchange',handleHash);

function toggleKbdHint(){
  document.getElementById('kbd-hint').classList.toggle('show');
}

document.addEventListener('keydown',(e)=>{
  if(e.key==='?' && document.activeElement.tagName!=='INPUT'&&document.activeElement.tagName!=='TEXTAREA'){
    toggleKbdHint();
  }
});

buildNav(); buildStats(); renderGrid();
handleHash();