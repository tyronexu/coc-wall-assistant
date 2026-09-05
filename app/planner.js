// 模块1：资源规划计算器
import { WALL_COST, WALL_MAX_LEVEL, TH_WALL_CAP } from './data.js';

export function render(root) {
  root.innerHTML = `
    <div class="card">
      <h2>城墙升级规划</h2>
      <p class="muted">根据当前墙等级、目标等级、数量和每日金币产出，估算刷墙所需资源与完成日期。</p>
      <div class="warn">合规提醒：本工具只做数学计算，不调用游戏接口，不模拟点击。请遵守 Supercell 用户协议，不要使用任何自动化外挂。</div>
      <div class="col" style="margin-top:12px">
        <div>
          <label>大本营等级（参考墙等级上限）</label>
          <select id="p-th">
            ${Object.keys(TH_WALL_CAP).map((k) => `<option value="${k}">TH ${k}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>当前墙等级</label>
          <select id="p-from">
            ${Array.from({ length: WALL_MAX_LEVEL + 1 }, (_, i) => `<option value="${i}" ${i === 5 ? 'selected' : ''}>Lv ${i}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>目标墙等级</label>
          <select id="p-to">
            ${Array.from({ length: WALL_MAX_LEVEL + 1 }, (_, i) => `<option value="${i}" ${i === 9 ? 'selected' : ''}>Lv ${i}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>需要升级的墙数量（块）</label>
          <input type="number" id="p-count" value="100" min="1" max="300">
        </div>
        <div>
          <label>每日可刷金币（资源池）</label>
          <input type="number" id="p-daily" value="4000000" min="0" step="100000">
        </div>
        <button class="btn" id="p-calc">计算</button>
      </div>
      <div id="p-result" style="margin-top:14px"></div>
    </div>
    <div class="card">
      <h2>升级成本明细（每块）</h2>
      <div id="p-table" class="muted">填好上面参数并点击计算后显示</div>
    </div>
  `;

  // TH 联动：选中 TH 时把 from/to 上限提示（不强制）
  const thSel = root.querySelector('#p-th');
  thSel.addEventListener('change', () => {
    const cap = TH_WALL_CAP[thSel.value];
    root.querySelector('#p-cap-note')?.remove();
    const note = document.createElement('div');
    note.id = 'p-cap-note';
    note.className = 'muted';
    note.textContent = `TH${thSel.value} 墙等级上限：Lv ${cap}`;
    thSel.parentElement.appendChild(note);
  });
  thSel.dispatchEvent(new Event('change'));

  root.querySelector('#p-calc').addEventListener('click', () => calc(root));
  calc(root);
}

function calc(root) {
  const from = parseInt(root.querySelector('#p-from').value, 10);
  const to = parseInt(root.querySelector('#p-to').value, 10);
  const count = parseInt(root.querySelector('#p-count').value, 10) || 0;
  const daily = parseInt(root.querySelector('#p-daily').value, 10) || 0;

  const result = root.querySelector('#p-result');
  const table = root.querySelector('#p-table');

  if (to <= from) {
    result.innerHTML = `<div class="warn">目标等级需大于当前等级</div>`;
    table.innerHTML = '';
    return;
  }

  // 计算每块墙升级成本（从 from 升到 to）
  const steps = [];
  let perBlock = 0;
  for (let lv = from; lv < to; lv++) {
    const cost = WALL_COST[lv] || 0;
    steps.push({ from: lv, to: lv + 1, cost });
    perBlock += cost;
  }
  const total = perBlock * count;
  const days = daily > 0 ? Math.ceil(total / daily) : Infinity;
  const finishDate = new Date(Date.now() + days * 86400000);

  result.innerHTML = `
    <div class="stat">
      <span class="k">单块升级成本</span><span class="v gold">${fmt(perBlock)}</span>
      <span class="k">总成本（${count} 块）</span><span class="v gold">${fmt(total)}</span>
      <span class="k">每日金币产出</span><span class="v">${fmt(daily)}</span>
      <span class="k">预计完成天数</span><span class="v green">${days === Infinity ? '∞' : days + ' 天'}</span>
      <span class="k">预计完成日期</span><span class="v">${days === Infinity ? '—' : finishDate.toLocaleDateString('zh-CN')}</span>
    </div>
  `;

  table.innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="text-align:left;color:var(--text-dim)">
        <th style="padding:6px 0">升级</th><th>金币</th><th style="text-align:right">累计</th>
      </tr></thead>
      <tbody>
        ${steps.map((s, i) => {
          const cum = steps.slice(0, i + 1).reduce((a, b) => a + b.cost, 0);
          return `<tr style="border-top:1px solid var(--border)">
            <td style="padding:6px 0">Lv${s.from} → Lv${s.to}</td>
            <td style="color:var(--gold)">${fmt(s.cost)}</td>
            <td style="text-align:right">${fmt(cum)}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
}

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return String(n);
}
