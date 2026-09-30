'use strict';

/**
 * findLongestChain(words) —— 求所有最长「换一字」链（word chain）。
 *
 * 规则与约定：
 *  1. 输入为字符串数组；先把所有单词统一转小写并去重。
 *  2. 非字符串 / 空串视为无效项直接丢弃；有效词为空 → 返回 []。
 *  3. 所有有效词必须等长，否则无法构成等长链 → 返回 []（无解）。
 *  4. 两个词「相邻」⇔ 恰好一个位置上的字母不同（Hamming 距离 = 1），方向无关。
 *  5. 链 = 首尾相连的相邻词序列；同一条链的正序/逆序视为同一条
 *     （统一取字典序较小的形式做规范形），据此去重。
 *  6. 返回所有最长链（数组的数组），按链的字典序升序排列。
 *  7. 精确求解用位掩码 DP，按连通分量拆分；单个分量最多 20 个词，超出抛 RangeError。
 *
 * 复杂度：构图 O(n²·L)，单分量 DP O(2^m·m·deg)。
 */

const MAX_COMPONENT_SIZE = 20;

/** 归一化：只保留非空字符串，转小写并去重（保持首次出现顺序，仅影响中间过程）。 */
function normalize(words) {
  if (!Array.isArray(words)) return [];
  const seen = new Set();
  const out = [];
  for (const w of words) {
    if (typeof w !== 'string' || w.length === 0) continue;
    const lw = w.toLowerCase();
    if (seen.has(lw)) continue;
    seen.add(lw);
    out.push(lw);
  }
  return out;
}

/** 是否恰好差一个字母（Hamming 距离为 1；相同串返回 false）。 */
function hammingIs1(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    if (a.charCodeAt(i) !== b.charCodeAt(i)) {
      if (++diff > 1) return false;
    }
  }
  return diff === 1;
}

/** 序列字典序比较（先逐元素，再比长度）。 */
function cmpSeq(a, b) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return a.length - b.length;
}

/** 规范形：正序与逆序里取字典序较小者（正逆视为同一条链）。 */
function canonical(seq) {
  const rev = seq.slice().reverse();
  return cmpSeq(seq, rev) <= 0 ? seq : rev;
}

/**
 * 求一个连通分量内的最长链及全部同长链。
 * @param {number[]} members 分量内各词在 uniq 中的全局下标
 * @param {number[][]} adj 全局邻接表
 */
function longestChainsOfComponent(members, adj) {
  const m = members.length;
  if (m > MAX_COMPONENT_SIZE) {
    throw new RangeError(
      `连通分量含 ${m} 个词，超过精确求解上限 ${MAX_COMPONENT_SIZE}`
    );
  }

  // 局部化索引
  const toLocal = new Map();
  members.forEach((g, i) => toLocal.set(g, i));
  const localAdj = Array.from({ length: m }, () => []);
  for (let i = 0; i < m; i++) {
    for (const g of adj[members[i]]) localAdj[i].push(toLocal.get(g));
  }

  // bestFrom(mask, last) = 当前已在 mask 中、位于 last 时，还能再接上的最多词数
  const memo = new Map();
  function bestFrom(mask, last) {
    const key = mask * m + last;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;
    let best = 0;
    for (const nb of localAdj[last]) {
      if (mask & (1 << nb)) continue;
      const v = 1 + bestFrom(mask | (1 << nb), nb);
      if (v > best) best = v;
    }
    memo.set(key, best);
    return best;
  }

  // 分量内最长链长度
  let maxLen = 1;
  for (let s = 0; s < m; s++) {
    const v = 1 + bestFrom(1 << s, s);
    if (v > maxLen) maxLen = v;
  }

  // 枚举所有恰好达到 maxLen 的链（入口处恒有 pathLen + bestFrom == maxLen）
  const chains = [];
  const path = [];
  function dfs(mask, last) {
    path.push(last);
    if (path.length === maxLen) {
      chains.push(path.map((i) => members[i]));
    } else {
      for (const nb of localAdj[last]) {
        if (mask & (1 << nb)) continue;
        if (path.length + 1 + bestFrom(mask | (1 << nb), nb) === maxLen) {
          dfs(mask | (1 << nb), nb);
        }
      }
    }
    path.pop();
  }
  for (let s = 0; s < m; s++) {
    if (1 + bestFrom(1 << s, s) === maxLen) dfs(1 << s, s);
  }

  return { maxLen, chains };
}

/**
 * @param {string[]} words 原始单词数组
 * @returns {string[][]} 所有最长链（去重、按字典序排序）；无解/空输入返回 []
 */
function findLongestChain(words) {
  const uniq = normalize(words);
  if (uniq.length === 0) return [];

  const wordLen = uniq[0].length;
  if (uniq.some((w) => w.length !== wordLen)) return []; // 长度不齐 → 无解

  // 邻接表（两两比较 Hamming 距离）
  const n = uniq.length;
  const adj = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (hammingIs1(uniq[i], uniq[j])) {
        adj[i].push(j);
        adj[j].push(i);
      }
    }
  }

  // 连通分量拆分：链不可能跨分量
  const compId = new Array(n).fill(-1);
  const comps = [];
  for (let i = 0; i < n; i++) {
    if (compId[i] !== -1) continue;
    const id = comps.length;
    const members = [];
    const stack = [i];
    compId[i] = id;
    while (stack.length) {
      const v = stack.pop();
      members.push(v);
      for (const u of adj[v]) {
        if (compId[u] === -1) {
          compId[u] = id;
          stack.push(u);
        }
      }
    }
    comps.push(members);
  }

  // 各分量求最长链，取全局最大
  let globalMax = 0;
  const perComp = [];
  for (const members of comps) {
    const r = longestChainsOfComponent(members, adj);
    perComp.push(r);
    if (r.maxLen > globalMax) globalMax = r.maxLen;
  }

  // 汇总：只留全局最长的，规范形去重，按字典序排序
  const seen = new Set();
  const out = [];
  for (const r of perComp) {
    if (r.maxLen !== globalMax) continue;
    for (const chain of r.chains) {
      const c = canonical(chain.map((g) => uniq[g])); // 全局下标 → 单词
      const key = JSON.stringify(c);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
  }
  out.sort(cmpSeq);
  return out;
}

module.exports = { findLongestChain };
