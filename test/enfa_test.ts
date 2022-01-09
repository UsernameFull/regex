import {
  E_NFA,
  BuildE_NFA as B,
  enfaRegexMatch,
  enfaRegexMatchFast,
} from "../src/enfa";

// [abc]+@[abc]+\.com -> (a|b|c)(a|b|c)*@(a|b|c)(a|b|c)*\.com
function creatRegexE_NFA(): E_NFA {
  //(a|b|c)
  let c = B.creatE_NFA("c");
  let ab = B.unionE_NFA(B.creatE_NFA("a"), B.creatE_NFA("b"));
  let group1 = B.unionE_NFA(ab, c);

  //(a|b|c)*
  let c1 = B.creatE_NFA("c");
  let ab1 = B.unionE_NFA(B.creatE_NFA("a"), B.creatE_NFA("b"));
  let group2 = B.closureE_NFA(B.unionE_NFA(ab1, c1));
  //@
  let to = B.creatE_NFA("@");

  //(a|b|c)
  let c2 = B.creatE_NFA("c");
  let ab2 = B.unionE_NFA(B.creatE_NFA("a"), B.creatE_NFA("b"));
  let group3 = B.unionE_NFA(ab2, c2);

  //(a|b|c)*
  let c3 = B.creatE_NFA("c");
  let ab3 = B.unionE_NFA(B.creatE_NFA("a"), B.creatE_NFA("b"));
  let group4 = B.closureE_NFA(B.unionE_NFA(ab3, c3));

  //.com
  let charDot = B.creatE_NFA(".");
  let charC = B.creatE_NFA("c");
  let charO = B.creatE_NFA("o");
  let charM = B.creatE_NFA("m");
  let dotCOM = [charDot, charC, charO, charM].reduce((a, v) =>
    B.concatE_NFA(a, v)
  );

  return [group1, group2, to, group3, group4, dotCOM].reduce((a, v) =>
    B.concatE_NFA(a, v)
  );
}

let mynfa = creatRegexE_NFA();
// orderE_NFA(mynfa);
// dfsDraw(mynfa.start);

// jit
for (let i = 1; i < 10000; i++) {
  enfaRegexMatch(mynfa, "abababababab@abababababa.com");
  enfaRegexMatchFast(mynfa, "abababababab@abababababa.com");
}

function genstr(n: number) {
  let tmp = "";
  for (let i = 0; i < n; i++) {
    tmp = tmp + (Math.random() > 0.33 ? "a" : Math.random() > 0.5 ? "b" : "c");
  }
  return tmp + "@" + tmp + "com";
}

let teststr = genstr(10000);
console.time("normal");
for (let i = 1; i < 100; i++) {
  enfaRegexMatchFast(mynfa, teststr);
  enfaRegexMatchFast(
    mynfa,
    "abababababababababababababababababababababababababababababab@asdsadasd.com"
  );
  enfaRegexMatch(mynfa, "a@a.com");
}
console.timeEnd("normal");

console.time("fast??");
for (let i = 1; i < 100; i++) {
  enfaRegexMatchFast(mynfa, teststr);
  enfaRegexMatchFast(
    mynfa,
    "abababababababababababababababababababababababababababababab@asdsadasd.com"
  );
  enfaRegexMatchFast(mynfa, "a@a.com");
}
console.timeEnd("fast??");

// console.log(dfsRegexMatch(mynfa,"aacccd@abab.com"))
// console.log(dfsRegexMatchFast(mynfa,"aaccc@abab.com"))

console.assert(enfaRegexMatch(mynfa, "a@a.com"), "gg");
console.assert(enfaRegexMatch(mynfa, "ababcc@aa.com"), "gg");
console.assert(!enfaRegexMatch(mynfa, "ad@a.com"), "gg");
console.assert(!enfaRegexMatch(mynfa, "@a.com"), "gg");
