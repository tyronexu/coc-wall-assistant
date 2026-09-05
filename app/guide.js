// 模块2：打资源策略速查
import { STRATEGY_GUIDE } from './data.js';

export function render(root) {
  root.innerHTML = `
    <div class="card">
      <h2>打资源策略速查</h2>
      <p class="muted">以下内容为公开游戏知识整理，仅供参考。请遵守 Supercell 用户协议。</p>
    </div>
    ${STRATEGY_GUIDE.map((sec) => `
      <div class="card">
        <div class="guide-section">
          <h3>${sec.title}</h3>
          ${sec.items.map((it) => `
            <div style="margin-bottom:10px">
              <strong>${it.name}</strong>
              <div class="muted">${it.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
    <div class="card">
      <h2>关于"刷墙"的合规边界</h2>
      <div class="guide-section">
        <p>刷墙 = 通过正常游戏行为积累资源升级城墙。下列做法是<b>合规</b>的：</p>
        <ul>
          <li>手动操作游戏，自己安排在线时段</li>
          <li>使用本工具做规划、提醒、追踪，不接触游戏本身</li>
          <li>使用游戏内官方加速道具</li>
        </ul>
        <p>下列做法会被判作弊，<b style="color:var(--red)">不要做</b>：</p>
        <ul>
          <li>宏 / 自动点击器 / 模拟器脚本自动 Farm</li>
          <li>共享账号给代练或机器人</li>
          <li>修改游戏内存或拦截网络包</li>
        </ul>
        <p class="muted">违规封号通常不可申诉，辛苦刷的资源会全部清零。</p>
      </div>
    </div>
  `;
}
