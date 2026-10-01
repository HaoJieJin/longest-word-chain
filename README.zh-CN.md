# 最长单词链

**🌐 [English](README.md) | [简体中文](README.zh-CN.md)**

找出所有**最长单词链**，其中相邻单词恰好相差**一个字母**（汉明距离 = 1）。

一个纯 JavaScript、无任何依赖的实现，使用位掩码 DP 并配合连通分量拆分。

## 规则

1. 输入是一个字符串数组；非字符串和空字符串会被丢弃。
2. 求解前，所有单词都会转为小写并去重。
3. 所有有效单词必须具有**相同的长度**，否则不存在等长链 → 返回 `[]`。
4. 当且仅当两个单词恰好在一个位置不同（`hammingIs1`）时，二者相邻。
5. 链是一段相邻单词的序列。链与其反向被视为**同一条链**（规范形式 = 字典序较小的方向）并去重。
6. 返回**所有**最长链，按字典序排序。每条链是一个单词数组。

## 复杂度

- 图构建：**O(n² · L)**
- 每个连通分量的 DP：**O(2^m · m · deg)**，其中 `m` 是该连通分量的大小。
- 大于 `MAX_COMPONENT_SIZE = 20` 的连通分量会抛出 `RangeError`（以保持指数级 DP 可处理）。

## 用法

```js
const { findLongestChain } = require('./chain');

// hot ↔ dot (one letter apart) → one longest chain of length 2
console.log(findLongestChain(['hot', 'dot']));
// → [ [ 'dot', 'hot' ] ]
```

## 测试

```bash
node chain.test.js
```

## 许可证

MIT © 2026 HaoJieJin
