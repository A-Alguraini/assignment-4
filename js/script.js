const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const GH_USER = 'A-Alguraini';
const GH_ENDPOINT = `https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=6`;

const state = {
  projects: [],
  filtered: [],
  tags: new Set(),
  activeTags: new Set(),
  sort: 'title',
  query: '',
  difficulty: 'any',
  onlyPinned: false,
  pinned: new Set(load('pinnedProjects', [])),
  github: { repos: [], loaded: false, loading: false, error: '' }
};

function save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
function load(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch{ return fallback; } }

function slugify(input){
  const base = (input || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  if(base) return base;
  const randomId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  return randomId;
}

function normalizeProjects(arr){
  return (arr || []).map((item, idx) => ({
    ...item,
    id: item.id || slugify(`${item.title || 'project'}-${idx}`),
    title: item.title || 'Untitled',
    date: item.date || new Date().toISOString(),
    summary: item.summary || '',
    details: item.details || '',
    tags: item.tags || [],
    difficulty: (item.difficulty || 'intermediate').toLowerCase()
  }));
}

function persistPins(){ save('pinnedProjects', [...state.pinned]); }

function setGreeting(){
  const name = load('username', null) || 'Guest';
  const hour = new Date().getHours();
  const part = hour<12 ? 'Good morning' : hour<18 ? 'Good afternoon' : 'Good evening';
  $('#greeting').textContent = `${part}, ${name}!`;
}

function applyTheme(){
  const theme = load('theme', 'light');
  document.body.classList.remove('light','dark');
  document.body.classList.add(theme);
}

function toggleTheme(){
  const theme = document.body.classList.contains('dark') ? 'light' : 'dark';
  save('theme', theme);
  applyTheme();
  toast(`Theme: ${theme}`);
}

function initTabs(){
  $$('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const id = btn.dataset.tab;
      $$('.panel').forEach(p => { p.classList.remove('active'); p.setAttribute('aria-hidden','true'); });
      const target = '#' + id;
      $(target).classList.add('active');
      $(target).setAttribute('aria-hidden','false');
    });
  });
}

function initReveal(){
  const io = new IntersectionObserver(entries => {
    for(const e of entries){
      if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
    }
  }, {threshold: 0.12});
  $$('.reveal').forEach(el => io.observe(el));
}

let toastTimer;
function toast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
}

async function loadProjects(){
  $('#status').textContent = 'Loading projects…';
  try{
    const res = await fetch('assets/projects.json', {cache:'no-store'});
    if(!res.ok) throw new Error('Network error');
    const data = await res.json();
    state.projects = normalizeProjects(data.projects);
    $('#status').textContent = '';
  }catch(err){
    state.projects = normalizeProjects([
      { title: 'Responsive Layout', date: '2025-09-12', summary: 'Grid-based layout with mobile-first approach.', details: 'Implements CSS Grid and Flexbox utilities. Lighthouse performance tuned.', tags:['web','ui'], difficulty: 'beginner' },
      { title: 'API Fun Facts', date: '2025-10-05', summary: 'Small widget that shows rotating facts.', details: 'Originally fetched from a public API; replaced with local JSON and retry strategy.', tags:['javascript','api'], difficulty: 'intermediate' },
      { title: 'Data Viz Mini', date: '2025-08-20', summary: 'Canvas-based bar chart demo.', details: 'Accessible SVG/Canvas chart with keyboard navigation hints.', tags:['data','viz'], difficulty: 'advanced' }
    ]);
    $('#status').innerHTML = 'Couldn’t load remote data. Using local fallback. <button id="retryBtn" class="btn-outline">Retry</button>';
    $('#retryBtn')?.addEventListener('click', ()=>{ loadProjects().then(renderProjects); });
  }
  buildTags();
  applyFilters();
  renderProjects();
}

function buildTags(){
  state.tags = new Set();
  state.projects.forEach(p => (p.tags||[]).forEach(t => state.tags.add(t)));
  const wrap = $('#tagFilters');
  wrap.innerHTML='';
  [...state.tags].sort().forEach(tag => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = tag;
    b.addEventListener('click', () => {
      if(state.activeTags.has(tag)) state.activeTags.delete(tag); else state.activeTags.add(tag);
      b.classList.toggle('active');
      applyFilters();
      renderProjects();
    });
    wrap.appendChild(b);
  });
}

function applyFilters(){
  const q = state.query.toLowerCase();
  let arr = state.projects.filter(p => {
    const matchesQ = [p.title,p.summary,p.details,(p.tags||[]).join(' ')].join(' ').toLowerCase().includes(q);
    const matchesTag = state.activeTags.size === 0 || (p.tags||[]).some(t => state.activeTags.has(t));
    const matchesDifficulty = state.difficulty === 'any' || (p.difficulty || '').toLowerCase() === state.difficulty;
    const matchesPin = !state.onlyPinned || state.pinned.has(p.id);
    return matchesQ && matchesTag && matchesDifficulty && matchesPin;
  });
  arr.sort((a,b)=>{
    if(!state.onlyPinned){
      const pinWeight = Number(state.pinned.has(b.id)) - Number(state.pinned.has(a.id));
      if(pinWeight !== 0) return pinWeight;
    }
    if(state.sort==='date') return new Date(b.date) - new Date(a.date);
    return a.title.localeCompare(b.title);
  });
  state.filtered = arr;
  updateStats();
}

function updateStats(){
  const stats = $('#projectStats');
  if(!stats) return;
  const visible = state.filtered.length;
  const total = state.projects.length;
  const tags = state.activeTags.size;
  const pinnedCount = state.pinned.size;
  const diffLabel = state.difficulty === 'any' ? 'All levels' : state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);
  stats.innerHTML = `
    <span>${visible} of ${total} projects</span>
    <span>${pinnedCount} pinned</span>
    <span>${tags} tag filters</span>
    <span>${diffLabel}</span>
  `;
}

function renderProjects(){
  const list = $('#projectList');
  list.innerHTML='';

  if(state.filtered.length===0){
    $('#status').textContent = 'No projects found.';
    return;
  } else {
    $('#status').textContent = '';
  }

  const tpl = $('#projectItemTemplate');
  state.filtered.forEach(p => {
    const node = tpl.content.cloneNode(true);
    const item = node.querySelector('li');
    if(state.pinned.has(p.id)) item.classList.add('is-pinned');

    const img = node.querySelector('.thumb');
    if (img) {
      if (p.image) {
        img.src = p.image;
        img.alt = p.imageAlt || `${p.title} preview`;
        img.loading = 'lazy';
        img.style.display = 'block';
      } else {
        img.remove();
      }
    }

    node.querySelector('.title').textContent = p.title;
    node.querySelector('.date').textContent = new Date(p.date).toLocaleDateString();
    node.querySelector('.summary').textContent = p.summary;
    node.querySelector('.details').textContent = p.details;
    node.querySelector('.difficulty').textContent = (p.difficulty || 'intermediate').charAt(0).toUpperCase() + (p.difficulty || 'intermediate').slice(1);

    const tags = node.querySelector('.tags');
    (p.tags || []).forEach(t => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = t;
      tags.appendChild(span);
    });

    const pinBtn = node.querySelector('.pin');
    if(pinBtn){
      const pinned = state.pinned.has(p.id);
      pinBtn.setAttribute('aria-pressed', pinned);
      pinBtn.textContent = pinned ? '★' : '☆';
      pinBtn.addEventListener('click', ()=>{
        if(state.pinned.has(p.id)) state.pinned.delete(p.id); else state.pinned.add(p.id);
        persistPins();
        applyFilters();
        renderProjects();
      });
    }

    const accBtn = node.querySelector('.accordion');
    const panel = node.querySelector('.panel-acc');
    accBtn.addEventListener('click', () => {
      panel.style.maxHeight = panel.style.maxHeight ? '' : panel.scrollHeight + 'px';
    });

    list.appendChild(node);
  });

  initReveal(); 
}

function initForm(){
  const form = $('#contactForm');
  const status = $('#formStatus');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    status.textContent = '';
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();

    let ok = true;
    ok &= setError('#name', name.length>=2 ? '' : 'Please enter at least 2 characters.');
    ok &= setError('#email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Please enter a valid email.');
    ok &= setError('#message', message.length>=10 ? '' : 'Message should be at least 10 characters.');
    if(!ok){ toast('Please fix the highlighted fields.'); return; }

    $('#sendBtn').disabled = true;
    $('#sendBtn').textContent = 'Sending…';
    try{
      await new Promise(res=>setTimeout(res, 1200));
      toast('Message sent!');
      status.textContent = 'Thanks! I will get back to you soon.';
      form.reset();
    }catch(err){
      status.textContent = 'Failed to send. Please try again.';
      toast('Send failed');
    }finally{
      $('#sendBtn').disabled = false;
      $('#sendBtn').textContent = 'Send';
    }
  });

  function setError(sel, msg){
    const input = $(sel);
    const small = input.parentElement.querySelector('.error');
    small.textContent = msg;
    return msg === '';
  }
}

function initNameForm(){
  const form = $('#nameForm');
  if(!form) return;
  const input = $('#displayName');
  const status = $('#nameStatus');
  const clearBtn = $('#clearName');
  const saved = load('username', '');
  if(saved){
    input.value = saved;
    status.textContent = `I will greet you as ${saved}.`;
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    const value = input.value.trim();
    if(value.length < 2){
      status.textContent = 'Please enter at least 2 characters.';
      return;
    }
    save('username', value);
    setGreeting();
    status.textContent = `I will greet you as ${value}.`;
    toast('Greeting updated');
  });
  clearBtn.addEventListener('click', ()=>{
    input.value = '';
    localStorage.removeItem('username');
    setGreeting();
    status.textContent = 'Greeting reset to Guest.';
    toast('Name cleared');
  });
}

function initControls(){
  $('#searchInput').addEventListener('input', (e)=>{
    state.query = e.target.value;
    applyFilters();
    renderProjects();
  });
  $('#sortSelect').addEventListener('change', (e)=>{
    state.sort = e.target.value;
    applyFilters();
    renderProjects();
  });
  $('#difficultySelect').addEventListener('change', (e)=>{
    state.difficulty = e.target.value;
    applyFilters();
    renderProjects();
  });
  const pinnedBtn = $('#pinnedToggle');
  pinnedBtn.addEventListener('click', ()=>{
    state.onlyPinned = !state.onlyPinned;
    pinnedBtn.setAttribute('aria-pressed', state.onlyPinned);
    pinnedBtn.textContent = state.onlyPinned ? 'Showing pinned' : 'Show pinned only';
    applyFilters();
    renderProjects();
  });
  $('#reloadBtn').addEventListener('click', ()=>{ loadProjects(); });
}

function initSessionTimer(){
  const target = $('#sessionTimer');
  if(!target) return;
  const start = Date.now();
  const update = ()=>{
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2,'0');
    const secs = String(elapsed % 60).padStart(2,'0');
    target.textContent = `${mins}:${secs}`;
  };
  update();
  setInterval(update, 1000);
}

function observeGitHubFeed(){
  const feed = $('#githubFeed');
  if(!feed) return;
  setGitHubStatus('Feed loads when visible.');
  const observer = new IntersectionObserver(entries => {
    if(entries.some(entry => entry.isIntersecting)){
      fetchGitHubRepos();
      observer.disconnect();
    }
  }, {threshold:0.2});
  observer.observe(feed);
  const refreshBtn = $('#githubRefresh');
  refreshBtn?.addEventListener('click', ()=>{ fetchGitHubRepos(true); });
}

async function fetchGitHubRepos(force=false){
  if(state.github.loading) return;
  if(state.github.loaded && !force) return;
  state.github.loading = true;
  setGitHubStatus('Loading repositories…');
  try{
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 6000);
    const res = await fetch(GH_ENDPOINT, {signal: controller.signal, headers:{'Accept':'application/vnd.github+json'}});
    clearTimeout(timeout);
    if(!res.ok) throw new Error('Request failed');
    const data = await res.json();
    state.github.repos = (data || []).map(repo => ({
      id: repo.id,
      name: repo.name,
      url: repo.html_url,
      description: repo.description || 'No description yet.',
      stars: repo.stargazers_count,
      language: repo.language || 'n/a',
      updated: repo.pushed_at
    })).slice(0,6);
    state.github.loaded = true;
    state.github.error = '';
    renderGitHubRepos();
    setGitHubStatus('GitHub feed updated.');
  }catch(err){
    state.github.loaded = false;
    state.github.error = 'Unable to load GitHub data. Try again later.';
    setGitHubStatus(state.github.error);
  }finally{
    state.github.loading = false;
  }
}

function renderGitHubRepos(){
  const list = $('#githubList');
  if(!list) return;
  list.innerHTML = '';
  if(state.github.repos.length === 0){
    list.innerHTML = '<li class="feed-card">No repositories found.</li>';
    return;
  }
  const tpl = $('#repoTemplate');
  state.github.repos.forEach(repo => {
    const node = tpl.content.cloneNode(true);
    node.querySelector('.repo-name').textContent = repo.name;
    node.querySelector('.repo-stars').textContent = `★ ${repo.stars}`;
    node.querySelector('.repo-desc').textContent = repo.description;
    node.querySelector('.repo-lang').textContent = repo.language;
    node.querySelector('.repo-updated').textContent = formatRelativeTime(repo.updated);
    const link = node.querySelector('.repo-link');
    link.href = repo.url;
    link.textContent = 'Open repo';
    list.appendChild(node);
  });
}

function setGitHubStatus(msg){
  const el = $('#githubStatus');
  if(el) el.textContent = msg;
}

function formatRelativeTime(value){
  const ts = new Date(value).getTime();
  if(!isFinite(ts)) return '';
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if(minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if(hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

document.addEventListener('DOMContentLoaded', ()=>{
  $('#year').textContent = new Date().getFullYear();
  setGreeting();
  applyTheme();
  $('#themeToggle').addEventListener('click', toggleTheme);
  initTabs();
  initReveal();
  initForm();
  initNameForm();
  initSessionTimer();
  initControls();
  observeGitHubFeed();
  loadProjects();
});
