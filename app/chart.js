// 纯 SVG 折线图，无第三方依赖
// data: [{ label, value }]
// options: { width, height, color, fill, yLabel }

export function lineChart(data, opts = {}) {
  if (!data || data.length === 0) {
    return '<div class="empty">暂无数据</div>';
  }
  const w = opts.width || 600;
  const h = opts.height || 220;
  const pad = { l: 48, r: 12, t: 12, b: 28 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;

  const values = data.map((d) => d.value);
  let min = Math.min(...values, 0);
  let max = Math.max(...values, 1);
  if (max === min) max = min + 1;
  const span = max - min;

  const xStep = data.length > 1 ? iw / (data.length - 1) : 0;
  const yPos = (v) => pad.t + ih - ((v - min) / span) * ih;
  const xPos = (i) => pad.l + i * xStep;

  const points = data.map((d, i) => `${xPos(i)},${yPos(d.value)}`).join(' ');
  const areaPts = `${pad.l},${yPos(min)} ${points} ${pad.l + (data.length - 1) * xStep},${yPos(min)}`;

  const color = opts.color || '#7c3aed';
  const grid = '#2d2d4444';

  // y 轴 5 刻度
  const ticks = [];
  for (let i = 0; i <= 4; i++) {
    const v = min + (span * i) / 4;
    const y = yPos(v);
    ticks.push(`
      <line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" stroke="${grid}" stroke-dasharray="3 3"/>
      <text x="${pad.l - 6}" y="${y + 3}" text-anchor="end" font-size="10" fill="#a0a0b8">${formatNum(v)}</text>
    `);
  }

  // x 轴标签（最多 8 个）
  const xLabels = data.map((d, i) => {
    const showEvery = Math.ceil(data.length / 8);
    if (i % showEvery !== 0 && i !== data.length - 1) return '';
    return `<text x="${xPos(i)}" y="${h - pad.b + 16}" text-anchor="middle" font-size="10" fill="#a0a0b8">${d.label}</text>`;
  }).join('');

  const dots = data.map((d, i) =>
    `<circle cx="${xPos(i)}" cy="${yPos(d.value)}" r="3" fill="${color}"><title>${d.label}: ${formatNum(d.value)}</title></circle>`
  ).join('');

  const yLabel = opts.yLabel
    ? `<text x="${pad.l - 36}" y="${pad.t + ih / 2}" text-anchor="middle" font-size="10" fill="#a0a0b8" transform="rotate(-90 ${pad.l - 36} ${pad.t + ih / 2})">${opts.yLabel}</text>`
    : '';

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img">
    ${ticks.join('')}
    <polygon points="${areaPts}" fill="${color}22"/>
    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    ${xLabels}
    ${yLabel}
  </svg>`;
}

function formatNum(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return String(Math.round(n));
}
