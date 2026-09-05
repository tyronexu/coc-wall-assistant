// 模块4：进度追踪可视化
import { dbGetAll, dbPut, dbDelete, uid } from './db.js';
import { lineChart } from './chart.js';

export async function render(root) {
  root.innerHTML = `
    <div class="card">
      <h2>记录今日进度</h2>
      <p class="muted">每天记一笔，看长期发育曲线。所有数据存在本地，不上传任何服务器。</p>
      <div class="col">
        <div>
          <label>日期</label>
          <input type="date" id="t-date">
        </div>
        <div class="row">
          <div>
            <label>今日金币获取</label>
            <input type="number" id="t-gold" value="0" min="0" step="50000">
          </div>
          <div>
            <label>今日圣水获取</label>
            <input type="number" id="t-elixir" value="0" min="0" step="50000">
          </div>
        </div>
        <div>
          <label>今日完成的墙升级数</label>
          <input type="number" id="t-walls" value="0" min="0" max="300">
        </div>
        <button class="btn" id="t-save">保存记录</button>
      </div>
    </div>
    <div class="card">
      <h2>发育曲线</h2>
      <div id="t-charts" class="muted">暂无数据，先记录几天再看图</div>
    </div>
    <div class="card">
      <h2>历史记录</h2>
      <div id="t-list" class="muted">加载中…</div>
    </div>
  `;

  // 默认今天
  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  root.querySelector('#t-date').value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  root.querySelector('#t-save').addEventListener('click', () => save(root));
  await refresh(root);
}

async function save(root) {
  const date = root.querySelector('#t-date').value;
  const gold = parseInt(root.querySelector('#t-gold').value, 10) || 0;
  const elixir = parseInt(root.querySelector('#t-elixir').value, 10) || 0;
  const walls = parseInt(root.querySelector('#t-walls').value, 10) || 0;
  if (!date) {
    alert('请选择日期');
    return;
  }
  // 同一日期覆盖更新（按日期合并）
  const existing = (await dbGetAll('tracker')).find((r) => r.date === date);
  const item = {
    id: existing?.id || uid(),
    date,
    gold: (existing?.gold || 0) + gold,
    elixir: (existing?.elixir || 0) + elixir,
    walls: (existing?.walls || 0) + walls,
    updatedAt: Date.now()
  };
  await dbPut('tracker', item);
  root.querySelector('#t-gold').value = 0;
  root.querySelector('#t-elixir').value = 0;
  root.querySelector('#t-walls').value = 0;
  await refresh(root);
}

async function refresh(root) {
  const items = await dbGetAll('tracker');
  items.sort((a, b) => a.date.localeCompare(b.date));
  refreshCharts(root, items);
  refreshList(root, items);
}

function refreshCharts(root, items) {
  const wrap = root.querySelector('#t-charts');
  if (items.length === 0) {
    wrap.innerHTML = '<div class="empty">暂无数据，先记录几天再看图</div>';
    return;
  }
  // 累计
  let cumG = 0, cumE = 0, cumW = 0;
  const goldData = [], elixirData = [], wallData = [];
  for (const it of items) {
    cumG += it.gold; cumE += it.elixir; cumW += it.walls;
    const label = it.date.slice(5); // MM-DD
    goldData.push({ label, value: cumG });
    elixirData.push({ label, value: cumE });
    wallData.push({ label, value: cumW });
  }
  wrap.innerHTML = `
    <div class="chart-wrap">
      <div class="muted" style="margin-bottom:6px">累计金币获取</div>
      ${lineChart(goldData, { color: '#fbbf24', yLabel: '金币' })}
    </div>
    <div class="chart-wrap">
      <div class="muted" style="margin-bottom:6px">累计圣水获取</div>
      ${lineChart(elixirData, { color: '#ec4899', yLabel: '圣水' })}
    </div>
    <div class="chart-wrap">
      <div class="muted" style="margin-bottom:6px">累计完成墙数</div>
      ${lineChart(wallData, { color: '#10b981', yLabel: '块' })}
    </div>
  `;
}

function refreshList(root, items) {
  const list = root.querySelector('#t-list');
  if (items.length === 0) {
    list.innerHTML = '<div class="empty">还没有记录</div>';
    return;
  }
  const recent = [...items].reverse();
  list.innerHTML = recent.map((it) => `
    <div class="list-item">
      <div>
        <strong>${it.date}</strong>
        <div class="meta">
          <span class="tag gold">金币 ${fmt(it.gold)}</span>
          <span class="tag elixir">圣水 ${fmt(it.elixir)}</span>
          <span class="tag dim">墙 ${it.walls} 块</span>
        </div>
      </div>
      <button class="btn ghost danger" data-id="${it.id}">删除</button>
    </div>
  `).join('');
  list.querySelectorAll('button[data-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await dbDelete('tracker', btn.dataset.id);
      await refresh(root);
    });
  });
}

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return String(n);
}
