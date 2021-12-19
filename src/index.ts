import { E_NFAState, E_NFA, creatRegexE_NFA, dfsRegexMatch } from "./enfa";
import { trasE_NFA2NFA, nfaRegexMatch } from "./enfa2nfa";

let myenfa = creatRegexE_NFA();
let mynfa = trasE_NFA2NFA(myenfa);

// jit
for (let i = 0; i < 1000; i++) {
  dfsRegexMatch(myenfa, "a@a.com");
  nfaRegexMatch(mynfa, "a@a.com");
}

console.time("enfa");
for (let i = 0; i < 10000; i++) {
  dfsRegexMatch(myenfa, "ababababbabababbacbcbcbcbcbcababababbabababbacbcbcbcbcbc@acbcbcbcbcb.com");
  dfsRegexMatch(myenfa, "ababcc@aa.com");
  dfsRegexMatch(myenfa, "ababababbabababbacbcbcbcbcbcs@a.com");
  dfsRegexMatch(myenfa, "@a.com");
}

console.timeEnd("enfa");

console.time("nfa");
for (let i = 0; i < 10000; i++) {
  nfaRegexMatch(mynfa, "ababababbabababbacbcbcbcbcbcababababbabababbacbcbcbcbcbc@acbcbcbcbcb.com");
  nfaRegexMatch(mynfa, "ababcc@aa.com");
  nfaRegexMatch(mynfa, "ababababbabababbacbcbcbcbcbcs@a.com");
  nfaRegexMatch(mynfa, "@a.com");
}

console.timeEnd("nfa");

// console.assert(dfsRegexMatchFast(mynfa,"a@a.com"),"gg")
// console.assert(dfsRegexMatchFast(mynfa,"ababcc@aa.com"),"gg")
// console.assert(!dfsRegexMatchFast(mynfa,"ad@a.com"),"gg")
// console.assert(!dfsRegexMatchFast(mynfa,"@a.com"),"gg")
