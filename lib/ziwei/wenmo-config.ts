/**
 * 文墨流派配置 — 9 类排盘流派开关 + 默认值 + 持久化
 *
 * 数据源：文墨天机 v2.5.8 反编译（详见 docs/wenmo-alignment.md）
 *
 * 用户在 chart 页设置面板切换，立即重新排盘
 */

import type { BrightnessSchool } from './wenmo-data';

// ─── 9 类流派配置 ───────────────────────────────────────────────────────

/** 1. 14 主星亮度表 */
export type BrightnessSchoolOption = 'default' | BrightnessSchool;

/** 2. 庚年四化（5 种变体）*/
export type GengYearSihua =
  | 'GYWYT'   // 阳武阴同（文墨默认，与 iztro 一致）
  | 'GYWTY'   // 阳武同阴（科忌互换说）
  | 'GYWFT'   // 阳武府同
  | 'GYWFX'   // 阳武府相
  | 'GYWTX';  // 阳武同相

/** 3. 安天马 */
export type TianmaSchool = 'year-branch' | 'month-branch';

/** 4. 安天空 */
export type TiankongSchool = 'normal' | 'shun-jia-shi';

/** 5. 截空旬空 */
export type JiekongSchool = 'single' | 'double' | 'zhanyan';

/** 6. 安魁钺 */
export type KuiyueSchool = 'qs1' | 'qs2' | 'zhong-yiming' | 'network';

/** 7. 安天使天伤 */
export type TianshiTianshangSchool = 'normal' | 'zhongzhou';

/** 8. 安长生十二神 */
export type ChangshengSchool = 'yin-yang-shun-ni' | 'shui-tu' | 'huo-tu';

/** 9. 晚子时处理 */
export type LateZishi =
  | 'next-day'           // 视为次日（文墨默认 + 我们当前）
  | 'current-day'        // 视为当日（倪师派）
  | 'all-current'        // 日柱当日时柱当日（八字）
  | 'day-cur-time-next'; // 日柱当日时柱次日（八字）

/** 10. 闰月处理（用户反馈：倪师派要求闰月归下月）*/
export type LeapMonth =
  | 'split'         // 分半（前 15 天归上月，后 15 天归下月）— ★我们默认 = 文墨专业版出厂默认「月中分界」（2026-09-05 150 组真机对照：9 张闰月后半月盘唯此口径逐星全同）
  | 'next-month'    // 整月归下月（倪师派：闰四月当五月）
  | 'prev-month'    // 整月当本月普通月（闰四月当四月）— 文墨设置「视为本月」；2.6 万盘验证针对的是基础版反编译引擎，与专业版真机出厂默认不一致
  | 'origin-month'; // 不调整（闰四月仍标闰月，iztro fixLeap=false）

// ─── 完整配置对象 ──────────────────────────────────────────────────────

export interface WenmoConfig {
  brightnessSchool: BrightnessSchoolOption;
  gengYearSihua: GengYearSihua;
  tianmaSchool: TianmaSchool;
  tiankongSchool: TiankongSchool;
  jiekongSchool: JiekongSchool;
  kuiyueSchool: KuiyueSchool;
  tianshiTianshang: TianshiTianshangSchool;
  changshengSchool: ChangshengSchool;
  lateZishi: LateZishi;
  leapMonth: LeapMonth;
}

/** 默认配置 = 对齐文墨默认排盘（辅星六煞杂曜+四化+运限 穷举零差异；闰月口径=整月归本月）*/
/**
 * ★ 2026-09-05 默认闰月口径 prev-month → split：150 组文墨专业版 2.5.16 真机对照，随机 100 盘 0 排星差异，
 * 唯一系统性差异是 9 张闰月后半月盘——文墨出厂默认「月中分界」(split)，Metis 旧默认整月归本月；切 split 后逐星全同。
 * 站长 2026-09-05 拍板改默认。algorithm / wenmo-patches / yunxian-palace 的兜底默认都引用这一个常量，别再各写字面量。
 */
export const DEFAULT_LEAP_MONTH: LeapMonth = 'split';

export const WENMO_DEFAULT_CONFIG: WenmoConfig = {
  brightnessSchool: 'default',           // 我们的混合表（基于全书 + 文墨安星码 8GDPB）
  gengYearSihua: 'GYWYT',                // 阳武阴同
  tianmaSchool: 'year-branch',           // 依据年支
  tiankongSchool: 'normal',              // 常规
  jiekongSchool: 'double',               // 正副双星
  kuiyueSchool: 'qs1',                   // 斗数全书歌诀理解1
  tianshiTianshang: 'normal',            // 常规
  changshengSchool: 'yin-yang-shun-ni',  // 区分阴阳顺逆
  lateZishi: 'next-day',                 // 视为次日
  leapMonth: DEFAULT_LEAP_MONTH,         // 闰月分半（文墨专业版出厂默认「月中分界」，150 组真机对照验证）
};

// ─── localStorage 持久化 key ───────────────────────────────────────────
export const WENMO_CONFIG_LS_KEY = 'ziwei-wenmo-config-v1';
/** 2026-09-05 闰月默认 prev-month→split 的一次性迁移标记（见 loadWenmoConfig） */
export const WENMO_LEAP_MIGRATED_KEY = 'ziwei-wenmo-leap-split-migrated';

/**
 * 读 localStorage 配置（安全 fallback 到默认）
 * 浏览器端调用，服务端返回默认
 */
export function loadWenmoConfig(): WenmoConfig {
  if (typeof window === 'undefined') return WENMO_DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(WENMO_CONFIG_LS_KEY);
    if (!raw) return WENMO_DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<WenmoConfig>;
    // ★ 2026-09-05 一次性迁移：旧默认 prev-month 是被整份存进 localStorage 的（抽屉存完整配置），分不清「默认」还是「手选」；
    //   而旧选项本身就标着「默认 · 对齐文墨」，选它的人要的也是对齐文墨 → 统一迁到新默认 split，只迁一次（迁移标记），之后再手选 prev-month 就尊重
    if (parsed.leapMonth === 'prev-month' && !localStorage.getItem(WENMO_LEAP_MIGRATED_KEY)) {
      parsed.leapMonth = DEFAULT_LEAP_MONTH;
      try { localStorage.setItem(WENMO_LEAP_MIGRATED_KEY, '1'); localStorage.setItem(WENMO_CONFIG_LS_KEY, JSON.stringify({ ...WENMO_DEFAULT_CONFIG, ...parsed })); } catch { /* noop */ }
    }
    return { ...WENMO_DEFAULT_CONFIG, ...parsed };
  } catch {
    return WENMO_DEFAULT_CONFIG;
  }
}

/** 保存配置到 localStorage */
export function saveWenmoConfig(cfg: WenmoConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WENMO_CONFIG_LS_KEY, JSON.stringify(cfg));
  } catch { /* localStorage 满或被禁 */ }
}

/** 重置为默认 */
export function resetWenmoConfig(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(WENMO_CONFIG_LS_KEY); } catch { /* noop */ }
}

// ─── 配置 → URL query 双向转换（用于分享带流派的命盘）────────────────────

/**
 * 流派 URL 参数 key 全集 — 与 configToParams 输出一一对应，10 类配置 10 个 key。
 *
 * ★ 2026-06-12 修「分享链接丢闰月口径」：chart 页此前两处手写 key 数组判断
 *   「URL 是否带流派参数」，都漏了 'lm'（闰月归属）——用户改成 next-month 后分享，
 *   对方打开 ?lm=next-month 被无视、按默认闰月口径排出不同的盘。
 *   今后判断一律复用本常量；configToParams 加字段时必须同步加这里。
 */
export const SCHOOL_PARAM_KEYS = ['bs', 'gys', 'tm', 'tk', 'jk', 'ky', 'tst', 'cs', 'lz', 'lm'] as const;

/** WenmoConfig → URL params（紧凑形式：?bs=qs&sh=GYWTY...）*/
export function configToParams(cfg: WenmoConfig): Record<string, string> {
  const out: Record<string, string> = {};
  if (cfg.brightnessSchool !== 'default') out.bs = cfg.brightnessSchool;
  if (cfg.gengYearSihua !== 'GYWYT') out.gys = cfg.gengYearSihua;
  if (cfg.tianmaSchool !== 'year-branch') out.tm = cfg.tianmaSchool;
  if (cfg.tiankongSchool !== 'normal') out.tk = cfg.tiankongSchool;
  if (cfg.jiekongSchool !== 'double') out.jk = cfg.jiekongSchool;
  if (cfg.kuiyueSchool !== 'qs1') out.ky = cfg.kuiyueSchool;
  if (cfg.tianshiTianshang !== 'normal') out.tst = cfg.tianshiTianshang;
  if (cfg.changshengSchool !== 'yin-yang-shun-ni') out.cs = cfg.changshengSchool;
  if (cfg.lateZishi !== 'next-day') out.lz = cfg.lateZishi;
  if (cfg.leapMonth !== DEFAULT_LEAP_MONTH) out.lm = cfg.leapMonth;   // 老分享链接不带 lm 的，现按新默认 split 解析（与文墨一致）
  return out;
}

/** URLSearchParams → WenmoConfig（缺省字段用默认值填充）*/
export function paramsToConfig(params: URLSearchParams): WenmoConfig {
  return {
    brightnessSchool: (params.get('bs') as BrightnessSchoolOption) || WENMO_DEFAULT_CONFIG.brightnessSchool,
    gengYearSihua: (params.get('gys') as GengYearSihua) || WENMO_DEFAULT_CONFIG.gengYearSihua,
    tianmaSchool: (params.get('tm') as TianmaSchool) || WENMO_DEFAULT_CONFIG.tianmaSchool,
    tiankongSchool: (params.get('tk') as TiankongSchool) || WENMO_DEFAULT_CONFIG.tiankongSchool,
    jiekongSchool: (params.get('jk') as JiekongSchool) || WENMO_DEFAULT_CONFIG.jiekongSchool,
    kuiyueSchool: (params.get('ky') as KuiyueSchool) || WENMO_DEFAULT_CONFIG.kuiyueSchool,
    tianshiTianshang: (params.get('tst') as TianshiTianshangSchool) || WENMO_DEFAULT_CONFIG.tianshiTianshang,
    changshengSchool: (params.get('cs') as ChangshengSchool) || WENMO_DEFAULT_CONFIG.changshengSchool,
    lateZishi: (params.get('lz') as LateZishi) || WENMO_DEFAULT_CONFIG.lateZishi,
    leapMonth: (params.get('lm') as LeapMonth) || WENMO_DEFAULT_CONFIG.leapMonth,
  };
}

// ─── UI 显示用：每个开关的所有选项 + 中文标签 ──────────────────────────

export const SCHOOL_OPTIONS = {
  // ★ 2026-06-17 统一格式(用户要求):每组【默认项】固定排第一,且 desc 统一以「默认 · xxx」开头
  brightnessSchool: [
    { value: 'default', label: '混合亮度表', desc: '默认 · 全书 + 文墨安星码 8GDPB 交叉验证' },
    { value: 'QS', label: '《斗数全书》派', desc: '古籍原始记载' },
    { value: 'XD1', label: '现代修正 v1', desc: '文墨口径' },
    { value: 'ZZ', label: '中州派', desc: '中州派理论' },
    { value: 'XD2', label: '现代修正 v2', desc: '另一种现代修正' },
  ],
  gengYearSihua: [
    { value: 'GYWYT', label: '阳武阴同', desc: '默认 · 与 iztro / 主流一致' },
    { value: 'GYWTY', label: '阳武同阴', desc: '科忌互换说' },
    { value: 'GYWFT', label: '阳武府同' },
    { value: 'GYWFX', label: '阳武府相' },
    { value: 'GYWTX', label: '阳武同相' },
  ],
  tianmaSchool: [
    { value: 'year-branch', label: '依据年支', desc: '默认 · 年支起天马' },
    { value: 'month-branch', label: '依据月支' },
  ],
  tiankongSchool: [
    { value: 'normal', label: '常规排法', desc: '默认 · 常规起天空' },
    { value: 'shun-jia-shi', label: '顺加生时' },
  ],
  jiekongSchool: [
    { value: 'double', label: '正副双星', desc: '默认 · 正副双星并用' },
    { value: 'single', label: '常规单星' },
    { value: 'zhanyan', label: '占验派' },
  ],
  kuiyueSchool: [
    { value: 'qs1', label: '《斗数全书》理解 1', desc: '默认 · 全书歌诀理解一' },
    { value: 'qs2', label: '《斗数全书》理解 2', desc: '差异仅在庚辛壬癸年生人' },
    { value: 'zhong-yiming', label: '钟义明先生书籍排法' },
    { value: 'network', label: '网络流传排法' },
  ],
  tianshiTianshang: [
    { value: 'normal', label: '常规排法', desc: '默认 · 身宫 ±5 位' },
    { value: 'zhongzhou', label: '中州派排法', desc: '生月奇偶 × 性别 交换' },
  ],
  changshengSchool: [
    { value: 'yin-yang-shun-ni', label: '区分阴阳顺逆', desc: '默认 · 阴阳顺逆起长生' },
    { value: 'shui-tu', label: '水土共长生', desc: '土五局起点 = 水二局起点 (申)' },
    { value: 'huo-tu', label: '火土共长生', desc: '土五局起点 = 火六局起点 (寅)' },
  ],
  lateZishi: [
    { value: 'next-day', label: '视为次日', desc: '默认 · 文墨 + 主流' },
    { value: 'current-day', label: '视为当日', desc: '倪师派' },
    { value: 'all-current', label: '日柱当日 / 时柱当日（八字）' },
    { value: 'day-cur-time-next', label: '日柱当日 / 时柱次日（八字）' },
  ],
  // ★ 2026-06-17 全站约定:每组默认选项一律排第一；去「天机」二字(避商标侵权)
  // ★ 2026-09-05 默认改为分半：文墨专业版出厂默认「月中分界」，150 组真机对照唯此口径逐星全同
  leapMonth: [
    { value: 'split', label: '视为分半', desc: '默认 · 对齐文墨出厂默认「月中分界」（前 15 天归本月 / 后 15 天归下月，150 组真机对照验证）' },
    { value: 'prev-month', label: '视为本月', desc: '闰四月整月当四月普通月排（文墨设置「视为本月」）' },
    { value: 'next-month', label: '视为下月', desc: '倪师派（闰四月整月当五月排）' },
    { value: 'origin-month', label: '保持闰月', desc: '不调整，闰四月仍标闰月' },
  ],
} as const;

/** 10 类配置的中文标签（用于 UI 标题）*/
export const SCHOOL_LABELS: Record<keyof WenmoConfig, string> = {
  brightnessSchool: '星曜亮度表',
  gengYearSihua: '庚年四化',
  tianmaSchool: '安天马',
  tiankongSchool: '安天空',
  jiekongSchool: '安截空旬空',
  kuiyueSchool: '安魁钺',
  tianshiTianshang: '安天使天伤',
  changshengSchool: '长生十二神',
  lateZishi: '晚子时',
  leapMonth: '闰月归属',
};
