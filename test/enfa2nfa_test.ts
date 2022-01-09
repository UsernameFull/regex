import { E_NFA, BuildE_NFA as B, enfaRegexMatch } from "../src/enfa";
import { E_NFA2NFA, nfaRegexMatch } from "../src/enfa2nfa";

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

let myenfa = creatRegexE_NFA();
let mynfa = E_NFA2NFA(myenfa);

console.log(mynfa.end);
// jit
for (let i = 0; i < 1000; i++) {
  enfaRegexMatch(myenfa, "a@a.com");
  nfaRegexMatch(mynfa, "a@a.com");
  2;
}

console.time("enfa");
for (let i = 0; i < 10000; i++) {
  enfaRegexMatch(
    myenfa,
    "ababababbabababbacbcbcbcbcbcababababbabababbacbcbcbcbcbc@acbcbcbcbcb.com"
  );
  enfaRegexMatch(myenfa, "ababcc@aa.com");
  enfaRegexMatch(myenfa, "ababababbabababbacbcbcbcbcbcs@a.com");
  enfaRegexMatch(myenfa, "@a.com");
}

console.timeEnd("enfa");

console.time("nfa");
for (let i = 0; i < 10000; i++) {
  nfaRegexMatch(
    mynfa,
    "ababababbabababbacbcbcbcbcbcababababbabababbacbcbcbcbcbc@acbcbcbcbcb.com"
  );
  nfaRegexMatch(mynfa, "ababcc@aa.com");
  nfaRegexMatch(mynfa, "ababababbabababbacbcbcbcbcbcs@a.com");
  nfaRegexMatch(mynfa, "@a.com");
}

console.timeEnd("nfa");

console.assert(nfaRegexMatch(mynfa, "a@a.com"), "gg");
console.assert(nfaRegexMatch(mynfa, "ababcc@aa.com"), "gg");
console.assert(!nfaRegexMatch(mynfa, "ad@a.com"), "gg");
console.assert(!nfaRegexMatch(mynfa, "@a.com"), "gg");
