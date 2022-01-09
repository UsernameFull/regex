import { E_NFAState, E_NFA } from "./enfa";

import { isEmpty } from "../util/util";

class NFAState {
  id: number = 0;
  isEnd: boolean = false;
  Next: { [key: string]: Set<NFAState> } = {};
}

class NFA {
  start: NFAState = new NFAState();
  end: NFAState = new NFAState();
}
// enfa->nfa
function E_NFA2NFA(enfa: E_NFA) {
  // 返回所有与当前节点通过ε相连的节点，采用bfs算法
  function neighbourState(current: E_NFAState) {
    // bfs算法中的队列
    let queue = [current];
    // 已经访问过的节点集合
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
    // 此时visted中已经包含所有与输入节点集合通过ε相连的*所有节点*
    return visted;
  }

  // dfs递归，将enfa转化为nfa
  function buildNFAStateBackup(
    states: Set<E_NFAState>,
    map: Map<E_NFAState, NFAState>
  ) {
    let node = new NFAState();
    // let isend = false;
    states.forEach((e) => {
      // 该节点在映射map内，则先将其加入映射map
      if (!map.has(e)) {
        map.set(e, node);
      }
      // 存在一般连接时，需要特殊对待
      if (!isEmpty(e.Next)) {
        // symbol 即为一般连接对应的字符
        let symbol = Object.keys(e.Next)[0];
        node.Next[symbol] = new Set();
        // 判断是否在map里，若在，则不用递归，只需要连接即可
        // 若不在，则意味着遇到了新的节点，需要递归遍历
        if (map.has(e.Next[symbol])) {
          node.Next[symbol].add(map.get(e.Next[symbol]) as NFAState);
        } else {
          let currentStates: Set<E_NFAState> = neighbourState(e.Next[symbol]);
          let next = buildNFAStateBackup(currentStates, map);
          node.Next[symbol].add(next);
        }
      }
      // 如果相邻节点为终点，则构造的新节点也应为终点
      if (e.isEnd) {
        node.isEnd = true;
      }
    });
    return node;
  }

  // dfs递归，将enfa转化为nfa
  function buildNFAState(
    node: E_NFAState,
    map: Map<E_NFAState, NFAState>
  ): NFA {
    let states = neighbourState(node);
    // nfaNode 即为新的NFA节点，end为NFA的终止节点
    let nfaNode = new NFAState();
    let nfaEnd = new NFAState();

    states.forEach((e) => {
      // 该节点在映射map内，则先将其加入映射map
      if (!map.has(e)) {
        map.set(e, nfaNode);
      }
      // 存在一般连接时，需要特殊对待
      if (!isEmpty(e.Next)) {
        // symbol 即为一般连接对应的字符
        let symbol = Object.keys(e.Next)[0];
        nfaNode.Next[symbol] = new Set();
        // 判断是否在map里，若在，则不用递归，只需要连接即可
        // 若不在，则意味着遇到了新的节点，需要递归遍历
        if (map.has(e.Next[symbol])) {
          nfaNode.Next[symbol].add(map.get(e.Next[symbol]) as NFAState);
        } else {
          // 开始递归，生成下一个新NFA节点并添加到当前节点
          let { start, end: myend } = buildNFAState(e.Next[symbol], map);
          nfaNode.Next[symbol].add(start);
          // 递归出栈时传递end节点
          if (myend.isEnd) {
            nfaEnd = myend;
          }
        }
      }
      // 如果相邻节点为终点，则构造的新节点也应为终点
      if (e.isEnd) {
        nfaNode.isEnd = true;
        nfaEnd = nfaNode;
      }
    });

    return { start: nfaNode, end: nfaEnd };
  }
  // 给id编号，同时找到end
  function OrderNFA(start: NFAState): NFA {
    let id = 0;
    let end = new NFAState();
    function dfsNFA(start: NFAState, visited: Set<NFAState>) {
      for (const symbol in start.Next) {
        start.Next[symbol].forEach((e) => {
          if (!visited.has(e)) {
            e.id = id;
            id++;
            visited.add(e);
            dfsNFA(e, visited);
          }
        });
      }
      //doSomething(start)
      if (start.isEnd) {
        end = start;
      }
    }
    dfsNFA(start, new Set());
    return { start: start, end: end };
  }

  // 初始化一个map，用于存放 E_NFAState->NFAState 对照表。
  let enfa2nfaMap: Map<E_NFAState, NFAState> = new Map();
  let currentStates: Set<E_NFAState> = neighbourState(enfa.start);
  // 开始递归
  let nfa = buildNFAState(enfa.start, enfa2nfaMap);
  return nfa;
}

function nfaRegexMatch(nfa: NFA, str: string): Boolean {
  function fn(state: NFAState, visited: Set<NFAState>, i: number): boolean {
    // 若已经到达过该节点，则返回false
    if (visited.has(state)) {
      return false;
    }
    visited.add(state);
    // nfa到达了终止条件，返回true
    if (state.isEnd) {
      return true;
    }
    // 当前节点是否能通过一般连接到达下一节点，如果不能则舍弃,若能则以下一个字符串作为判断条件开始dfs递归
    let currentChar = str[i];
    if (state.Next[currentChar]) {
      //注意，通过了一般连接后应该重置visited
      return [...state.Next[currentChar]].some((e) => fn(e, new Set(), i + 1));
    } else {
      return false;
    }
  }

  return fn(nfa.start, new Set(), 0);
}

export { E_NFA2NFA, nfaRegexMatch };
