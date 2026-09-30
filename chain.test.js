'use strict';

const assert = require('assert');
const { findLongestChain } = require('./chain');

const tests = [
  ['空数组 → []', () => {
    assert.deepStrictEqual(findLongestChain([]), []);
  }],

  ['单元素 → 自身即一条链', () => {
    assert.deepStrictEqual(findLongestChain(['cat']), [['cat']]);
  }],

  ['无解（单词长度不一致，构不成等长链）→ []', () => {
    assert.deepStrictEqual(findLongestChain(['at', 'cat', 'dogs']), []);
  }],

  ['两条同长度最长链 → 都返回并按字典序排序', () => {
    // 分量1: abc-abd-cbd（abc 与 cbd 差 2 个字母，最长 3）
    // 分量2: xyz-xyw-zyw（xyz 与 zyw 差 2 个字母，最长 3）
    assert.deepStrictEqual(
      findLongestChain(['abc', 'abd', 'cbd', 'xyz', 'xyw', 'zyw']),
      [
        ['abc', 'abd', 'cbd'],
        ['xyz', 'xyw', 'zyw'],
      ]
    );
  }],

  ['含重复词 → 先去重（否则会用两个下标把同一个词走两遍）', () => {
    assert.deepStrictEqual(findLongestChain(['hot', 'hot', 'dot', 'dot']), [
      ['dot', 'hot'],
    ]);
  }],

  ['大小写混用 → 先统一小写再算', () => {
    // HOT/dot/dog → hot-dot-dog 长 3；链与其逆序视作同一条，规范形取字典序小者
    assert.deepStrictEqual(findLongestChain(['HOT', 'Dot', 'DOG']), [
      ['dog', 'dot', 'hot'],
    ]);
  }],

  ['链长 1（互不相邻）→ 每个词单独成链', () => {
    assert.deepStrictEqual(findLongestChain(['cat', 'dog', 'emu']), [
      ['cat'],
      ['dog'],
      ['emu'],
    ]);
  }],

  ['逆序视作同一条链（去重不重复报）', () => {
    assert.deepStrictEqual(findLongestChain(['hot', 'dot']), [['dot', 'hot']]);
  }],

  ['长短链共存 → 只返回最长的', () => {
    // abc-abd 只有长度 2；hot-dot-dog 长度 3 胜出
    assert.deepStrictEqual(
      findLongestChain(['abc', 'abd', 'HOT', 'dot', 'dog']),
      [['dog', 'dot', 'hot']]
    );
  }],
];

let pass = 0;
let fail = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    pass++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    fail++;
    console.log(`  ✗ ${name}`);
    console.log(`    ${e && e.message ? e.message : e}`);
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
