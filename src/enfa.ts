class E_NFAState {
  id: number = 0;
  isEnd: boolean = false;
  Next: { [key: string]: E_NFAState } = {};
  eNext: E_NFAState[] = [];
}

function linkState(from: E_NFAState, to: E_NFAState, symbol: string) {
  from.Next[symbol] = to;
}
function elinkState(from: E_NFAState, to: E_NFAState) {
  from.eNext.push(to);
}

class E_NFA {
  start: E_NFAState = new E_NFAState();
  end: E_NFAState = new E_NFAState();
}

const BuildE_NFA = {
  /**
   * 串联
   */
  concatE_NFA(first: E_NFA, second: E_NFA): E_NFA {
    first.end.isEnd = false;
    elinkState(first.end, second.start);
    return { start: first.start, end: second.end };
  },
  /**
   * 并联
   */
  unionE_NFA(first: E_NFA, second: E_NFA): E_NFA {
    let newstart = new E_NFAState();
    let newend = new E_NFAState();
    newstart.isEnd = false;
    newend.isEnd = true;

    elinkState(newstart, first.start);
    elinkState(newstart, second.start);
    elinkState(first.end, newend);
    elinkState(second.end, newend);
    first.end.isEnd = false;
    second.end.isEnd = false;

    return { start: newstart, end: newend };
  },
  /**
   * 闭包操作，即"*"
   */
  closureE_NFA(nfa: E_NFA): E_NFA {
    let newstart = new E_NFAState();
    let newend = new E_NFAState();
    newstart.isEnd = false;
    newend.isEnd = true;

    elinkState(newstart, nfa.start);
    elinkState(nfa.end, nfa.start);
    elinkState(nfa.end, newend);
    elinkState(newstart, newend);
    nfa.end.isEnd = false;

    return { start: newstart, end: newend };
  },
  /**
   * 单字符
   */
  creatE_NFA(symbol: string): E_NFA {
    let nfa = new E_NFA();
    linkState(nfa.start, nfa.end, symbol);
    nfa.end.isEnd = true;
    return nfa;
  },
};

function enfaRegexMatch(nfa: E_NFA, str: string): Boolean {
  function fn(state: E_NFAState, visited: E_NFAState[], i: number): boolean {
    // 若已经到达过该节点，则返回false
    if (visited.includes(state)) {
      return false;
    }
    visited.push(state);
    // nfa到达了终止条件，返回true
    if (state.isEnd) {
      return true;
    }
    // 对ε相连的节点全部执行dfs递归，如果其中有到达了终止条件的，返回true
    if (state.eNext.some((e) => fn(e, visited, i))) {
      return true;
    }
    // 当前节点是否能通过一般连接到达下一节点，如果不能则舍弃,若能则以下一个字符串作为判断条件开始dfs递归
    let currentChar = str[i];
    if (state.Next[currentChar]) {
      //注意，通过了一般连接后应该重置visited
      return fn(state.Next[currentChar], [], i + 1);
    } else {
      return false;
    }
  }

  return fn(nfa.start, [], 0);
}

function enfaRegexMatchFast(nfa: E_NFA, str: string) {
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

export { E_NFAState, E_NFA, BuildE_NFA, enfaRegexMatch, enfaRegexMatchFast };
