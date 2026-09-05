// 静态数据：城墙升级成本、兵种训练时间、打资源策略
// 数据来源：Supercell 公开游戏数据（参考值，以游戏内实际为准）
// 本文件不连接任何服务器，纯内置

// 城墙各等级升级成本（金币）
// key = 当前等级 → 升级到下一级所需金币
// 0 表示无墙 → 1级，1 表示 1级 → 2级，以此类推
export const WALL_COST = {
  0: 300,         // 起步
  1: 1000,
  2: 5000,
  3: 10000,
  4: 30000,
  5: 75000,
  6: 200000,
  7: 500000,
  8: 1000000,
  9: 2000000,
  10: 3000000,
  11: 4000000,
  12: 5000000,
  13: 6000000,
  14: 7000000,
  15: 8000000
};

// 最高等级
export const WALL_MAX_LEVEL = 15;

// 每个城墙大本营级别可达到的墙等级上限（参考）
export const TH_WALL_CAP = {
  3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7,
  10: 8, 11: 9, 12: 10, 13: 11, 14: 12, 15: 13, 16: 14, 17: 15
};

// 兵种训练时间预设（秒）—— 用户也可以自定义
export const TROOP_PRESETS = [
  { name: '野蛮人 (Barbarian)', seconds: 5, type: 'army' },
  { name: '弓箭手 (Archer)', seconds: 6, type: 'army' },
  { name: '巨人 (Giant)', seconds: 30, type: 'army' },
  { name: '哥布林 (Goblin)', seconds: 7, type: 'army' },
  { name: '炸弹人 (Wall Breaker)', seconds: 30, type: 'army' },
  { name: '气球 (Balloon)', seconds: 60, type: 'army' },
  { name: '法师 (Wizard)', seconds: 60, type: 'army' },
  { name: '皮卡 (P.E.K.K.A)', seconds: 180, type: 'army' },
  { name: '飞龙 (Dragon)', seconds: 180, type: 'army' },
  { name: '雷电法术 (Lightning)', seconds: 60, type: 'spell' },
  { name: '狂暴法术 (Rage)', seconds: 180, type: 'spell' },
  { name: '冰冻法术 (Freeze)', seconds: 180, type: 'spell' },
  { name: '英雄：守护者', seconds: 60 * 60, type: 'hero', note: '受伤恢复' },
  { name: '英雄：野蛮之王', seconds: 60 * 60, type: 'hero', note: '受伤恢复' },
  { name: '英雄：飞盾战神', seconds: 60 * 60, type: 'hero', note: '受伤恢复' },
  { name: '英雄：战神', seconds: 60 * 60, type: 'hero', note: '受伤恢复' }
];

// 打资源策略速查（纯文字知识库）
export const STRATEGY_GUIDE = [
  {
    title: '兵种搭配',
    items: [
      { name: '胖法流 (TH7-9)', desc: '巨人扛伤 + 法师输出 + 弓箭清边。通用性强，黑油消耗低。' },
      { name: '电龙流 (TH9-11)', desc: '雷电法术 + 飞龙，刷资源快，训练时间中等。适合Farm资源多的阵。' },
      { name: '矿工流 (TH10+)', desc: '矿工无视城墙，圣水消耗高但稳定。适合打金币/圣水多的基地。' },
      { name: '夜世界野蛮人海', desc: '夜世界刷墙专用，野蛮人碾压，胜场奖励稳定。' }
    ]
  },
  {
    title: '匹配值策略',
    items: [
      { name: '低匹配工程 (已淘汰)', desc: '工程兵配置已被官方削弱，不再推荐，请正常升级。' },
      { name: '主升墙的节奏', desc: '在每次大本营升级前，先把当前墙刷满再升本，避免落后。' },
      { name: '夜世界双倍刷墙', desc: '夜世界独立于主世界，但用同一资源刷墙。利用每天5星奖励双倍资源。' }
    ]
  },
  {
    title: '时间窗口',
    items: [
      { name: '黄金Farm时段', desc: '晚上 20:00-23:00 和周末白天，对手在线率高，可用低本攻城找资源。' },
      { name: '清晨资源库', desc: '早晨 06:00-09:00，许多玩家护盾结束，资源更易获取。' },
      { name: '夜世界冷却', desc: '夜世界每天有攻击次数冷却，刷墙靠日积月累，不要硬刷。' }
    ]
  },
  {
    title: '资源管理',
    items: [
      { name: '保护圣水', desc: '圣水最难补，优先用金币刷墙（金币易得），圣水留给兵种训练。' },
      { name: '部落城堡存仓', desc: '将资源存入部落城堡，被攻击损失更少。每日领取部落战奖励。' },
      { name: '连胜奖励', desc: '连续攻击低本玩家保持连胜，连胜奖励提供额外资源。' }
    ]
  },
  {
    title: '合规提醒',
    items: [
      { name: '禁止自动化', desc: 'Supercell EULA 明确禁止宏、自动点击器、脚本。使用即封号。' },
      { name: '禁止共享账号', desc: '账号共享、代练一律视为违规，封号不可申诉。' },
      { name: '合法加速', desc: '合法加速方式：使用官方训练加速道具、合理规划在线时段、加入活跃部落获取援军。' }
    ]
  }
];
