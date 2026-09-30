# Longest Word Chain

Find all **longest word chains** where adjacent words differ by exactly **one letter** (Hamming distance = 1).

A pure, dependency-free JavaScript implementation using bitmask DP with connected-component splitting.

## Rules

1. Input is an array of strings; non-strings and empty strings are dropped.
2. All words are lowercased and deduplicated before solving.
3. All valid words must have the **same length**, otherwise no equal-length chain exists → returns `[]`.
4. Two words are adjacent iff they differ at exactly one position (`hammingIs1`).
5. A chain is a sequence of adjacent words. A chain and its reverse are treated as **the same chain** (canonical form = lexicographically smaller direction) and deduplicated.
6. Returns **all** longest chains, sorted lexicographically. Each chain is an array of words.

## Complexity

- Graph construction: **O(n² · L)**
- DP per connected component: **O(2^m · m · deg)**, where `m` is the component size.
- Components larger than `MAX_COMPONENT_SIZE = 20` throw a `RangeError` (to keep the exponential DP tractable).

## Usage

```js
const { findLongestChain } = require('./chain');

// hot ↔ dot (one letter apart) → one longest chain of length 2
console.log(findLongestChain(['hot', 'dot']));
// → [ [ 'dot', 'hot' ] ]
```

## Test

```bash
node chain.test.js
```

## License

MIT © 2026 HaoJieJin
