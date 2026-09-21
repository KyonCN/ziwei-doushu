/**
 * 将前十二神 / 岁前十二神 —— 按地支起的两组十二神
 *
 * 为什么要有这个文件（2026-08-12）：
 *   文墨盘上每个宫都带这两个神名，我们盘上一直是空的。
 *
 * ── 一处考古更正（重要，别再按旧结论走）──────────────────────────────
 *   之前的判断是「岁前十二神文墨自己不排，LNSQX 表 0 个调用点」。表确实零调用，
 *   但结论错了：文墨【排】，只是不查表、走公式。两个 setter 在同一个 .as 里紧挨着，
 *   各被调用 11 次（大限 / 流年 / 流月 / 流日 / 流时 / 小限 每层都调），且默认全开。
 *
 * 算法出处（逐字可核）WenMoTianJiKA4C55EF1504B4478AE8763899010481BK.as：
 *
 *   岁前十二神 :1446 —— 公式，不查表
 *       private function XXX(param1:int) : void {
 *          _loc2_ = 1;
 *          while(_loc2_ <= 12) {
 *             _loc3_ = 13 - param1 + _loc2_;
 *             if(_loc3_ > 12) { _loc3_ -= 12; }
 *             gong[_loc2_].lnSQX = _loc3_;
 *             _loc2_++;
 *          }
 *       }
 *       即「岁建落在 param1 宫，顺行十二宫」。与 LNSQX 表逐格等价（对拍脚本里一并验了）。
 *
 *   将前十二神 :1466 —— 查 LNJQX 表
 *       private function XXX(param1:int) : void {
 *          _loc3_ = 1;
 *          while(_loc3_ <= 12) {
 *             _loc2_ = int(gcs.<LNJQX>[_loc3_][param1]);
 *             gong[_loc2_].lnJQX = _loc3_;
 *             _loc3_++;
 *          }
 *       }
 *       即「神序 _loc3_ 落在宫 LNJQX[神序][param1]」。
 *
 *   ★ 两个函数的 param1 都是【地支】，且都是【该运限的地支】——追调用点定死的：
 *     每个运限入口（大限 FE9DBE31 / 流年 8FA5D9DA / 流月 5CA25605 / 流日 968018FB / 流时 6AD6C65E）
 *     都写成同一个形状：
 *         if(vars.<跟随运限开关>) 岁前(该层支); else 岁前(vars.bz[1]);   // bz[1] = 八字年柱地支 = 生年支
 *         if(vars.<跟随运限开关>) 将前(该层支); else 将前(vars.bz[1]);
 *     两个开关默认都是 true（WenMoTianJiK0EBD88484BBD4C528DD076D75E496D37K.as:1025-1026），
 *     即默认跟随运限；本命态（未选运限）在 :1253-1254 无条件用生年支起。
 *
 * 宫位编码：表内用【子起一】(1=子 … 12=亥)。本组自身可独立验：
 *   LNJQX 的将星列 = 三合帝旺（申子辰→子、寅午戌→午、巳酉丑→酉、亥卯未→卯）12/12 全中；
 *   岁驿列与天马表逐格相同、华盖列与华盖表相同、咸池列与咸池表相同。按寅起一则全错。
 *
 * 本文件对外一律用 0-11 地支索引（0=子）。
 *
 * 博士十二神（2026-08-14 实机）：从生年禄存起，阳男阴女顺、阴男阳女逆；不跟随运限。
 */

import { LUCUN_TABLE } from './constants';

/** 将前十二神，自将星起顺行。索引 0-11 = 神序。 */
export const JIANG_QIAN_SHEN = [
  '将星', '攀鞍', '岁驿', '息神', '华盖', '劫煞',
  '灾煞', '天煞', '指背', '咸池', '月煞', '亡神',
] as const;

/** 岁前十二神，自岁建起顺行。索引 0-11 = 神序。
 * 第 7 位文墨盘面写「岁破」（岁建对宫），不要写成「大耗」——顶栏年支大耗是另一颗星。 */
export const SUI_QIAN_SHEN = [
  '岁建', '晦气', '丧门', '贯索', '官符', '小耗',
  '岁破', '龙德', '白虎', '天德', '吊客', '病符',
] as const;

/**
 * 博士十二神。金标准：文墨 2.5.8 实机宫底第一行青绿字。
 * 从生年禄存起；阳男阴女顺、阴男阳女逆。不跟随运限（流年选中后仍落在生年禄存宫）。
 */
export const BOSHI_SHEN = [
  '博士', '力士', '青龙', '小耗', '将军', '奏书',
  '飞廉', '喜神', '病符', '大耗', '伏兵', '官符',
] as const;

/**
 * 将星落宫（0-11 地支索引）—— 三合局的帝旺位。
 * 申子辰→子、寅午戌→午、巳酉丑→酉、亥卯未→卯，即同三合组共用一个将星宫。
 * anchorBranch 为该运限的地支（本命态传生年支）。
 */
export function jiangXingBranch(anchorBranch: number): number {
  const b = ((anchorBranch % 12) + 12) % 12;
  // 子(0)/辰(4)/申(8) → 子(0)；丑(1)/巳(5)/酉(9) → 酉(9)；
  // 寅(2)/午(6)/戌(10) → 午(6)；卯(3)/未(7)/亥(11) → 卯(3)
  return [0, 9, 6, 3][b % 4];
}

/**
 * 将前十二神：返回长度 12 的数组，下标 = 宫地支（0-11），值 = 神序（0-11，0=将星）。
 * 将星起于三合帝旺位，其后十一神顺行。
 */
export function jiangQianShenByBranch(anchorBranch: number): number[] {
  const start = jiangXingBranch(anchorBranch);
  const out = new Array<number>(12);
  for (let shen = 0; shen < 12; shen++) out[(start + shen) % 12] = shen;
  return out;
}

/**
 * 岁前十二神：返回长度 12 的数组，下标 = 宫地支（0-11），值 = 神序（0-11，0=岁建）。
 * 岁建落在 anchorBranch 宫，其后十一神顺行。
 */
export function suiQianShenByBranch(anchorBranch: number): number[] {
  const a = ((anchorBranch % 12) + 12) % 12;
  const out = new Array<number>(12);
  for (let shen = 0; shen < 12; shen++) out[(a + shen) % 12] = shen;
  return out;
}

/** 便利函数：某一宫的将前十二神名。 */
export function jiangQianShenName(anchorBranch: number, palaceBranch: number): string {
  return JIANG_QIAN_SHEN[jiangQianShenByBranch(anchorBranch)[((palaceBranch % 12) + 12) % 12]];
}

/** 便利函数：某一宫的岁前十二神名。 */
export function suiQianShenName(anchorBranch: number, palaceBranch: number): string {
  return SUI_QIAN_SHEN[suiQianShenByBranch(anchorBranch)[((palaceBranch % 12) + 12) % 12]];
}

/** 阳男阴女顺，阴男阳女逆。年干阴阳与 calcYinYangGender 同一把尺子。 */
export function boshiReverse(yearStem: number, gender: 'male' | 'female'): boolean {
  const yangStem = ((yearStem % 10) + 10) % 10 % 2 === 0;
  return yangStem !== (gender === 'male');
}

/**
 * 博士十二神：返回长度 12 的数组，下标 = 宫地支（0-11），值 = 神序（0-11，0=博士）。
 * 起点 = 生年禄存。
 */
export function boshiShenByStem(yearStem: number, gender: 'male' | 'female'): number[] {
  const start = LUCUN_TABLE[((yearStem % 10) + 10) % 10];
  const reverse = boshiReverse(yearStem, gender);
  const out = new Array<number>(12);
  for (let shen = 0; shen < 12; shen++) {
    const branch = reverse ? (start - shen + 12) % 12 : (start + shen) % 12;
    out[branch] = shen;
  }
  return out;
}

export function boshiShenName(
  yearStem: number, gender: 'male' | 'female', palaceBranch: number,
): string {
  return BOSHI_SHEN[boshiShenByStem(yearStem, gender)[((palaceBranch % 12) + 12) % 12]];
}

/**
 * 十二神的英文名 —— 专用表
 *
 * 为什么单独一张表而不直接用共享短语词典 t()：
 * 词典是「词条→译文」一对一，而同一个中文词在不同语境下该有不同译法——
 * 「将星」作为将前十二神之一要拼音（与另外 23 个一致），但它在散文里是【七杀】的别称
 * （「囚星配将星」= 廉贞配七杀），那里译成 General Star 才读得通。共用一张表迟早打架。
 *
 * 2026-08-12 已把词典里的独立词条 大耗/将星/八座 统一成拼音（原为意译，是 25 个杂耀里的
 * 三个异类），所以此刻两边结果一致；这张表的意义在于把盘上的星名标签与散文词典解耦，
 * 之后谁再动词典也不会把这一列带歪。
 *
 * 口径：命理专名用拼音（见 /api/interpret 英文指令 "Keep 命理 proper nouns as pinyin+English"）。
 */
export const SHIER_SHEN_EN: Record<string, string> = {
  // 岁前十二神（岁破 = 文墨盘面用字；大耗留给顶栏年支星 / 博士第十二神）
  岁建: 'Sui Jian', 晦气: 'Hui Qi', 丧门: 'Sang Men', 贯索: 'Guan Suo',
  官符: 'Guan Fu', 小耗: 'Xiao Hao', 岁破: 'Sui Po', 大耗: 'Da Hao', 龙德: 'Long De',
  白虎: 'Bai Hu', 天德: 'Tian De', 吊客: 'Diao Ke', 病符: 'Bing Fu',
  // 将前十二神
  将星: 'Jiang Xing', 攀鞍: 'Pan An', 岁驿: 'Sui Yi', 息神: 'Xi Shen',
  华盖: 'Hua Gai', 劫煞: 'Jie Sha', 灾煞: 'Zai Sha', 天煞: 'Tian Sha',
  指背: 'Zhi Bei', 咸池: 'Xian Chi', 月煞: 'Yue Sha', 亡神: 'Wang Shen',
  // 博士十二神（与岁前重名的词共用拼音）
  博士: 'Bo Shi', 力士: 'Li Shi', 青龙: 'Qing Long', 将军: 'Jiang Jun',
  奏书: 'Zou Shu', 飞廉: 'Fei Lian', 喜神: 'Xi Shen', 伏兵: 'Fu Bing',
};

/** 按语言取十二神显示名；未收录则原样返回中文，绝不显示 undefined。 */
export function shierShenLabel(name: string, lang: string): string {
  return lang === 'en' ? (SHIER_SHEN_EN[name] ?? name) : name;
}
