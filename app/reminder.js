// 模块3：训练完成提醒
import { dbGetAll, dbPut, dbDelete, uid } from './db.js';
import { TROOP_PRESETS } from './data.js';
import { ensurePermission, schedule, cancel, supported, fmtDuration, fmtTime } from './notify.js';

export async function render(root) {
  const perm = supported() ? await ensurePermission() : 'unsupported';

  root.innerHTML = `
    <div class="card">
      <h2>训练完成提醒</h2>
      <p class="muted">手动录入兵种和数量，到点本地通知。本工具不读取游戏数据，只做计时提醒。</p>
      <div class="warn" id="r-perm">
        ${perm === 'granted' ? '通知权限：已授权' : perm === 'denied' ? '通知权限：被拒绝，请到浏览器设置开启' : perm === 'unsupported' ? '当前环境不支持通知' : '通知权限：未授权，请点击下方按钮申请'}
      </div>
      ${perm === 'default' ? `<button class="btn ghost" id="r-ask">申请通知权限</button>` : ''}
      <div class="col" style="margin-top:12px">
        <div>
          <label>预设兵种 / 法术 / 英雄</label>
          <select id="r-preset">
            ${TROOP_PRESETS.map((t, i) => `<option value="${i}">${t.name} · ${fmtDuration(t.seconds)}</option>`).join('')}
          </select>
        </div>
        <div class="row">
          <div>
            <label>数量</label>
            <input type="number" id="r-count" value="20" min="1" max="999">
          </div>
          <div>
            <label>或自定义总秒数</label>
            <input type="number" id="r-custom" placeholder="留空则用预设" min="1">
          </div>
        </div>
        <div>
          <label>备注（可选）</label>
          <input type="text" id="r-note" placeholder="如：第一波胖法">
        </div>
        <button class="btn" id="r-add">添加提醒</button>
      </div>
    </div>
    <div class="card">
      <h2>已设提醒</h2>
      <div id="r-list" class="muted">加载中…</div>
    </div>
  `;

  const askBtn = root.querySelector('#r-ask');
  if (askBtn) askBtn.addEventListener('click', async () => {
    await ensurePermission();
    render(root);
  });

  root.querySelector('#r-add').addEventListener('click', () => addReminder(root));
  await refreshList(root);
}

async function addReminder(root) {
  const presetIdx = parseInt(root.querySelector('#r-preset').value, 10);
  const preset = TROOP_PRESETS[presetIdx];
  const count = parseInt(root.querySelector('#r-count').value, 10) || 1;
  const custom = root.querySelector('#r-custom').value;
  const note = root.querySelector('#r-note').value.trim();

  const perUnit = preset.seconds;
  const totalSec = custom ? parseInt(custom, 10) : perUnit * count;
  if (!totalSec || totalSec <= 0) {
    alert('请输入有效的训练时间');
    return;
  }
  const fireAt = Date.now() + totalSec * 1000;
  const item = {
    id: uid(),
    name: preset.name,
    count: custom ? null : count,
    totalSec,
    fireAt,
    note,
    createdAt: Date.now()
  };
  await dbPut('reminders', item);
  await schedule(item.id, fireAt, {
    title: `训练完成 · ${item.name}`,
    body: note ? `${note}（${fmtDuration(totalSec)}）` : `已过 ${fmtDuration(totalSec)}，回去收兵`,
    tag: item.id
  });
  // 清空备注
  root.querySelector('#r-note').value = '';
  root.querySelector('#r-custom').value = '';
  await refreshList(root);
}

async function refreshList(root) {
  const list = root.querySelector('#r-list');
  if (!list) return;
  const items = await dbGetAll('reminders');
  items.sort((a, b) => a.fireAt - b.fireAt);
  if (items.length === 0) {
    list.innerHTML = '<div class="empty">还没有提醒，添加一个吧</div>';
    return;
  }
  list.innerHTML = items.map((it) => {
    const remain = it.fireAt - Date.now();
    const remainTxt = remain > 0 ? `还剩 ${fmtDuration(remain / 1000)}` : '已到点';
    return `
      <div class="list-item">
        <div>
          <div><strong>${it.name}</strong>${it.count ? ` × ${it.count}` : ''}</div>
          <div class="meta">${fmtTime(it.fireAt)} · ${remainTxt}${it.note ? ` · ${it.note}` : ''}</div>
        </div>
        <button class="btn ghost danger" data-id="${it.id}">删除</button>
      </div>
    `;
  }).join('');
  list.querySelectorAll('button[data-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      cancel(id);
      await dbDelete('reminders', id);
      await refreshList(root);
    });
  });
}

// 模块初始化时恢复所有未触发的提醒（页面重载后定时器丢失）
export async function restoreAll() {
  if (!supported()) return;
  const items = await dbGetAll('reminders');
  for (const it of items) {
    if (it.fireAt > Date.now()) {
      await schedule(it.id, it.fireAt, {
        title: `训练完成 · ${it.name}`,
        body: it.note ? `${it.note}（${fmtDuration(it.totalSec)}）` : `已过 ${fmtDuration(it.totalSec)}，回去收兵`,
        tag: it.id
      });
    } else {
      // 已过期未触发的，立即补发一次
      await schedule(it.id, Date.now() + 500, {
        title: `训练完成 · ${it.name}`,
        body: it.note ? `${it.note}（已过点）` : `已过 ${fmtDuration(it.totalSec)}，回去收兵`,
        tag: it.id
      });
    }
  }
}

// 进入此页时自动恢复
restoreAll();
