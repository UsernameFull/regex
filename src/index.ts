import  {E_NFAState,E_NFA,creatRegexE_NFA,dfsRegexMatch} from "./enfa"

function dfsRegexMatchFast(nfa: E_NFA, str: string) {
  // 当前状态所有ε相连的节点是同一类节点，均可加入current,此处采用bfs
  function neighbourState(current: Set<E_NFAState>) {
    let queue = [...current];
    let visted: Set<E_NFAState> = new Set();
    visted.add(queue[0]);
    while (queue.length != 0) {
      let state = queue.shift();
      state?.eNext.forEach((st) => {
        if (!visted.has(st)) {
          visted.add(st);
          queue.push(st);
        }
      });
    }
    return visted;
  }

  function fn(nfa: E_NFA, str: string) {
    // 如果已经遍历整个nfa，则返回false
    let currentStates: Set<E_NFAState> = neighbourState(new Set([nfa.start]));
    for (let symbol of str) {
      let nextStates: Set<E_NFAState> = new Set();
      for (const state of currentStates) {
        let nextState = state.Next[symbol];
        if (nextState) {
          nextStates = neighbourState(new Set([nextState]));
        }
      }
      currentStates = nextStates;
    }
    let res = false;
    currentStates.forEach((s) => {
      if (s.isEnd) {
        res = true;
        return;
      }
    });
    return res;
  }
  return fn(nfa, str);
}

let mynfa = creatRegexE_NFA();

console.assert(dfsRegexMatch(mynfa,"a@a.com"),"gg")
console.assert(dfsRegexMatch(mynfa,"ababcc@aa.com"),"gg")
console.assert(!dfsRegexMatch(mynfa,"ad@a.com"),"gg")
console.assert(!dfsRegexMatch(mynfa,"@a.com"),"gg")

console.assert(dfsRegexMatchFast(mynfa,"a@a.com"),"gg")
console.assert(dfsRegexMatchFast(mynfa,"ababcc@aa.com"),"gg")
console.assert(!dfsRegexMatchFast(mynfa,"ad@a.com"),"gg")
console.assert(!dfsRegexMatchFast(mynfa,"@a.com"),"gg")