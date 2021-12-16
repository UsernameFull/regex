import { E_NFAState, E_NFA, creatRegexE_NFA } from "./enfa";

import {isEmpty} from "../util/util"

class NFAState {
  id: number = 0;
  isEnd: boolean = false;
  Next: { [key: string]: Set<NFAState> } = {};
}

function trasE_NFA2NFA(enfa: E_NFA) {
  //
  let id = 0;

  // 返回当前状态所有ε相连的节点是同一类节点，均可加入current,此处采用bfs
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
  
  // 将
  function buildNFAState(states:Set<E_NFAState>,map:Map<E_NFAState,NFAState>) {
    let tmp = new NFAState()
    tmp.id = id;
    id++
    states.forEach((e)=>{
      // 该节点在映射map内，则先将其加入映射map
      if(!map.has(e)){
        map.set(e,tmp)
      }
      // 存在一般连接时，需要特殊对待
      if(!isEmpty(e.Next)){
        let symbol = Object.keys(e.Next)[0];
        tmp.Next[symbol] = new Set();

        if(map.has(e.Next[symbol])){
          tmp.Next[symbol].add(map.get(e.Next[symbol]) as NFAState)
        }else{
          let currentStates: Set<E_NFAState> = neighbourState(e.Next[symbol]);
          tmp.Next[symbol].add(buildNFAState(currentStates,map)) //************这里还有大问题****** */
        }
      }
      // 如果相邻节点为终点，则构造的新节点也应为终点
      if(e.isEnd){
        tmp.isEnd = true;
      }
    })
    return tmp
  }

  function dfs(eNfaState:E_NFAState ):NFAState {
    let enfa2nfaMap = new Map();
    let currentStates: Set<E_NFAState> = neighbourState(eNfaState);
    let root = buildNFAState(currentStates,enfa2nfaMap);
    // for (const symbol in root.Next) {
    //   root.Next[symbol].forEach(e=>{
    //     e = dfs(e)
    //   })
    // }
    return root
  }
  return dfs(enfa.start)
}


let a = creatRegexE_NFA()
let b = trasE_NFA2NFA(a)

console.log(b)