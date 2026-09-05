// 主入口：SW 注册、主题、Tab 路由
import { render as renderPlanner } from './planner.js';
import { render as renderGuide } from './guide.js';
import { render as renderReminder } from './reminder.js';
import { render as renderTracker } from './tracker.js';

const VIEWS = {
  planner: renderPlanner,
  guide: renderGuide,
  reminder: renderReminder,
  tracker: renderTracker
};

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('SW 注册失败（file:// 协议下不支持，需通过 http/https 访问）', err);
    });
  });
}

// 主题切换
const themeBtn = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);
themeBtn?.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem('theme', next);
});
function applyTheme(t) {
  if (t === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeBtn.textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeBtn.textContent = '🌙';
  }
}

// Tab 路由
const view = document.getElementById('view');
const tabs = document.querySelectorAll('.tab');
let current = null;

function switchTab(name) {
  if (current === name) return;
  current = name;
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  view.innerHTML = '';
  const fn = VIEWS[name];
  if (fn) fn(view);
}

tabs.forEach((t) => t.addEventListener('click', () => switchTab(t.dataset.tab)));

// 默认进入规划页
switchTab('planner');
