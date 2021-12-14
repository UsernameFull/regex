function orderE_NFA(nfa: E_NFA) {
    let id = 0;
    function dfs(state: E_NFAState, visited: Set<E_NFAState>) {
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
    dfs(nfa.start, new Set());
  }
function dfsDraw(state: E_NFAState) {
    let position: { x: number; y: number } = { x: 0, y: 0 };
    let drawLine = "";
    let olayer = 0;
    function clgdrawLine(layer: number) {
      // if (drawLine === "") {
      //   return;
      // }
      console.log(drawLine);
      olayer++;
      console.log({ layer: layer });
      drawLine = "";
    }
  
    function dfsfn(state: E_NFAState, visited: E_NFAState[], layer: number) {
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
        dfsfn(item, visited, layer);
        layer++;
      }
      for (let key in state.Next) {
        if (visited.includes(state.Next[key])) {
          clgdrawLine(layer);
          return false;
        }
        drawLine =
          drawLine + state.Next[key].id + "+" + key.toLocaleUpperCase() + "+";
        visited.push(state.Next[key]);
        dfsfn(state.Next[key], visited, layer);
        layer++;
      }
      clgdrawLine(layer);
    }
    dfsfn(state, [], 0);
}