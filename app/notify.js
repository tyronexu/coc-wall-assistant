// 通知封装：基于 setTimeout + Notification API
// 注意：PWA 后台定时不可靠，需 APP 前台运行。关闭后台时提醒会丢失。
// 通过 SW.postMessage 触发实际显示，以便后续扩展为 push 通知。

const timers = new Map(); // id -> setTimeout handle

export function supported() {
  return typeof Notification !== 'undefined' && 'serviceWorker' in navigator;
}

export async function ensurePermission() {
  if (!supported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const p = await Notification.requestPermission();
  return p;
}

export async function schedule(id, fireAt, payload) {
  cancel(id);
  const delay = fireAt - Date.now();
  if (delay <= 0) {
    await fire(payload);
    return;
  }
  const handle = setTimeout(() => fire(payload), delay);
  timers.set(id, handle);
}

export function cancel(id) {
  const h = timers.get(id);
  if (h) { clearTimeout(h); timers.delete(id); }
}

export function cancelAll() {
  for (const h of timers.values()) clearTimeout(h);
  timers.clear();
}

async function fire(payload) {
  try {
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({ type: 'SHOW_NOTIFY', payload });
  } catch {
    // SW 未就绪，直接显示
    if (Notification.permission === 'granted') {
      new Notification(payload.title, { body: payload.body, tag: payload.tag });
    }
  }
}

// 工具：秒数 → hh:mm 文本
export function fmtDuration(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}时${m}分`;
  if (m > 0) return `${m}分${s}秒`;
  return `${s}秒`;
}

export function fmtTime(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
