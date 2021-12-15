import { E_NFAState, E_NFA, creatRegexE_NFA } from "./enfa";

import {isEmpty} from "../util/util"

class NFAState {
  id: number = 0;
  isEnd: boolean = false;
  Next: { [key: string]: Set<NFAState> } = {};
}

function trasE_NFA2NFA(enfa: E_NFA) {
  // 当前状态所有ε相连的节点是同一类节点，均可加入current,此处采用bfs
  function neighbourState(current: Set<E_NFAState>) {
    //bfs算法中的队列
    let queue = [...current];
    //已经访问过的节点集合
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
    // 我们需要筛选出有一般连接的节点并返回这类的集合
    return new Set([...visted].filter((e)=>!isEmpty(e.Next)));

  }

  function dfs(enfa: E_NFA) {}

  trasE_NFA2NFA(enfa);
}
