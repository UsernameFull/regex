class NFAState {
  id: number = 0;
  isEnd: boolean = false;
  Next: { [key: string]: NFAState } = {};
  eNext: NFAState[] = [];
}

function linkState(from: NFAState, to: NFAState, symbol: string) {
  from.Next[symbol] = to;
}
function elinkState(from: NFAState, to: NFAState) {
  from.eNext.push(to);
}

class NFA {
  start: NFAState = new NFAState();
  end: NFAState = new NFAState();
}

function concatNFA(first: NFA, second: NFA): NFA {
  first.end.isEnd = false;
  elinkState(first.end, second.start);
  return { start: first.start, end: second.end };
}
//并联
function unionNFA(first: NFA, second: NFA): NFA {
  let newstart = new NFAState();
  let newend = new NFAState();
  newstart.isEnd = false;
  newend.isEnd = true;

  elinkState(newstart, first.start);
  elinkState(newstart, second.start);
  elinkState(first.end, newend);
  elinkState(second.end, newend);
  first.end.isEnd = false;
  second.end.isEnd = false;

  return { start: newstart, end: newend };
}
//重
function closure(first: NFA): NFA {
  let newstart = new NFAState();
  let newend = new NFAState();
  newstart.isEnd = false;
  newend.isEnd = true;

  elinkState(newstart, first.start);
  elinkState(first.start, first.end);
  elinkState(first.end, newend);
  elinkState(newstart, newend);
  first.end.isEnd = false;

  return { start: newstart, end: newend };
}
function creatNFA(symbol: string): NFA {
  let nfa = new NFA();
  linkState(nfa.start, nfa.end, symbol);
  nfa.end.isEnd = true;
  return nfa;
}

function creatRegexNFA(): NFA {
  //(a|b|c)
  let c = creatNFA("c");
  let ab = unionNFA(creatNFA("a"), creatNFA("b"));
  let group1 = unionNFA(ab, c);

  //(a|b|c)*
  let c1 = creatNFA("c");
  let ab1 = unionNFA(creatNFA("a"), creatNFA("b"));
  let group2 = closure(unionNFA(ab1, c1));
  //@
  let to = creatNFA("@");

  //(a|b|c)
  let c2 = creatNFA("c");
  let ab2 = unionNFA(creatNFA("a"), creatNFA("b"));
  let group3 = unionNFA(ab2, c2);

  //(a|b|c)*
  let c3 = creatNFA("c");
  let ab3 = unionNFA(creatNFA("a"), creatNFA("b"));
  let group4 = closure(unionNFA(ab3, c3));

  //.com
  let charDot = creatNFA(".");
  let charC = creatNFA("c");
  let charO = creatNFA("o");
  let charM = creatNFA("m");
  let dotCOM = [charDot, charC, charO, charM].reduce((a, v) => concatNFA(a, v));

  return [group1, group2, to, group3, group4, dotCOM].reduce((a, v) =>
    concatNFA(a, v)
  );
}

function orderNFA(nfa:NFA){
    let id = 0
    function dfs(state: NFAState, visited: Set<NFAState>) {
        if (state.isEnd) {
          return true;
        }
        for (let item of state.eNext) {
          if (visited.has(item)) {
            return false;
          }
          item.id = id;
          id++;
          visited.add(item);
          dfs(item, visited);
        }
        for (let item in state.Next) {
          if (visited.has(state.Next[item])) {
            // console.log(state.Next[item].id);
            return false;
          }
          state.Next[item].id = id;
          id++;
          visited.add(state.Next[item]);
          dfs(state.Next[item], visited);
        }
      }
      dfs(nfa.start,new Set())
}


interface Position {
  x: number;
  y: number;
}

function dfsDraw(state: NFAState) {
  let position: { x: number; y: number } = { x: 0, y: 0 };
  let drawLine = "";
  let olayer =0 
  function clgdrawLine(layer:number) {
    // if (drawLine === "") {
    //   return;
    // }
    console.log(drawLine);
    olayer++
    console.log({layer:layer})
    drawLine = "";
  }
  
  function dfsfn(state: NFAState, visited: NFAState[],layer:number) {
    if (state.isEnd) {
      console.log("$$$");
      return true;
    }
    for (let item of state.eNext) {
      if (visited.includes(item)) {
        clgdrawLine(layer);
        return false;
      }
      drawLine = drawLine + item.id + "-";
      visited.push(item);
      dfsfn(item, visited,layer);
      layer++
    }
    for (let key in state.Next) {
      if (visited.includes(state.Next[key])) {
        clgdrawLine(layer);
        return false;
      }
      drawLine =
        drawLine + state.Next[key].id + "+" + key.toLocaleUpperCase() + "+";
      visited.push(state.Next[key]);
      dfsfn(state.Next[key], visited,layer);
      layer++
    }
    clgdrawLine(layer);
    
  }
  dfsfn(state, [],0);
}

function dfsRegexMatch(nfa: NFA, str: string) {
  function fn(state: NFAState, visited: NFAState[], i: number): boolean {
    // 如果已经遍历整个nfa，则返回false
    if (visited.includes(state)) {
      return false;
    }
    // nfa到达了终止条件，返回true
    if (state.isEnd) {
      return true;
    }
    visited.push(state);
    // 找与当前节点通过ε相连的节点,如果其中有到达了终止条件的，返回true
    if (state.eNext.some((e) => fn(e, visited, i))) {
      return true;
    }
    // 当前节点是否能通过一般连接到达下一节点，如果不能则舍弃,若能则开始下一轮搜索
    let currentChar = str[i];
    if (state.Next[currentChar]) {
      return fn(state.Next[currentChar], visited, i + 1);
    } else {
      return false;
    }
  }

  return fn(nfa.start, [], 0);
}

function dfsRegexMatchFast(nfa:NFA,str:string){
  // 当前状态所有ε相连的节点是同一类节点，均可加入current,此处采用bfs
  function neighbourState(current:Set<NFAState>){
    let queue = [...current];
    let visted:Set<NFAState> = new Set();
    while(queue.length!=0){
      let state = queue.shift();
      state?.eNext.forEach((st)=>{
        if(!visted.has(st)){
          visted.add(st);
          queue.push(st);
        }
      })
    }
    return visted
  }

  function fn(nfa:NFA,str:string) {
    // 如果已经遍历整个nfa，则返回false
    let currentStates:Set<NFAState> = neighbourState(new Set([nfa.start]));
    for(let symbol of str){
      let nextStates:Set<NFAState> = new Set();
      for (const state of currentStates) {
        let nextState  = state.Next[symbol]
        if(nextState){
          nextStates = neighbourState(new Set([nextState]))
        }
      }
      currentStates = nextStates;
    }
    currentStates.forEach(s=>{
      if(s.isEnd){
        return true
      }
    })
    return false
  }
  return fn(nfa,str)
}

let mynfa = creatRegexNFA();
// orderNFA(mynfa);
// dfsDraw(mynfa.start);

console.log(dfsRegexMatchFast(mynfa, "a@a.com"));

console.log(dfsRegexMatch(mynfa, "ab@a.com"));
console.log(dfsRegexMatch(mynfa, "abd@a.com"));
console.log(dfsRegexMatch(mynfa, "d@a.com"));
