class NFAState {
    depth:number=0;
    isEnd: boolean=false;
    Next: { [key: string]: NFAState; }={};
    eNext: NFAState[]=[];
}

function linkState(from: NFAState, to: NFAState, symbol: string) {
    from.Next[symbol] = to;
}
function elinkState(from: NFAState, to: NFAState) {
    from.eNext.push(to)
}

class NFA {
    start: NFAState=new NFAState();
    end: NFAState=new NFAState();
}

function concatNFA(first: NFA, second: NFA):NFA {
    first.end.isEnd = false;
    elinkState(first.end, second.start);
    return { start:first.start, end:second.end };
}
//并联
function unionNFA(first: NFA, second: NFA):NFA {
    let newstart = new NFAState();
    let newend = new NFAState();
    newstart.isEnd = false;
    newend.isEnd = true;

    elinkState(newstart, first.start)
    elinkState(newstart, second.start)
    elinkState(first.end, newend);
    elinkState(second.end, newend);
    first.end.isEnd = false;
    second.end.isEnd = false;

    return { start:newstart, end:newend };
}
//重
function closure(first: NFA):NFA {
    let newstart = new NFAState();
    let newend = new NFAState();
    newstart.isEnd = false;
    newend.isEnd = true;

    elinkState(newstart, first.start)
    elinkState(first.start, first.end)
    elinkState(first.end, newend)
    elinkState(newstart, newend)
    first.end.isEnd = false;

    return { start:newstart, end:newend };
}
function creatNFA(symbol: string):NFA {
    let nfa = new NFA();
    linkState(nfa.start, nfa.end, symbol);
    nfa.end.isEnd = true;
    return nfa;
}

function creatRegexNFA():NFA {
    //(a|b|c)
    let c = creatNFA("c");
    let ab = unionNFA(creatNFA("a"),creatNFA("b"));
    let group1= unionNFA(ab,c);
    
    //(a|b|c)*
    let c1 = creatNFA("c");
    let ab1 = unionNFA(creatNFA("a"),creatNFA("b"));
    let group2= closure(unionNFA(ab1,c1));
    //@
    let to = creatNFA("@");

    //(a|b|c)
    let c2 = creatNFA("c");
    let ab2 = unionNFA(creatNFA("a"),creatNFA("b"));
    let group3= unionNFA(ab2,c2);

    //(a|b|c)*
    let c3 = creatNFA("c");
    let ab3 = unionNFA(creatNFA("a"),creatNFA("b"));
    let group4= closure(unionNFA(ab3,c3));

    //.com
    let charDot = creatNFA(".");
    let charC = creatNFA("c");
    let charO = creatNFA("o");
    let charM = creatNFA("m");
    let dotCOM = [charDot,charC,charO,charM].reduce((a,v)=>(concatNFA(a,v)))

    return ([group1,group2,to,group3,group4,dotCOM].reduce((a,v)=>(concatNFA(a,v))))
}

function dfs(state:NFAState,visited:NFAState[],depth:number){
    if(state.isEnd){
        return true
    }
    for(let item of state.eNext){
        if (visited.includes(item)){
            // console.log(item.depth);
            return false;
        }
        item.depth = depth;
        depth++;
        visited.push(item)
        dfs(item,visited,depth)
    }
    for(let item in state.Next){
        if (visited.includes(state.Next[item])){
            // console.log(state.Next[item].depth);
            return false;
        }
        state.Next[item].depth = depth;
        depth++;
        visited.push(state.Next[item])
        dfs(state.Next[item],visited,depth)
    }
}
interface Position{
    x: number;
    y: number;
}

function dfsDraw(state:NFAState){
    let position:{x:number,y:number} ={x:0,y:0}
    let drawLine = '';
    function clgdrawLine(){
        if(drawLine===''){
            return;
        }
        console.log(drawLine);
        drawLine = '';
    }
    function dfsfn(state:NFAState,visited: NFAState[]) {
        if(state.isEnd){
            console.log("$$$");
            return true
        }
        for(let item of state.eNext){
            if (visited.includes(item)){
                clgdrawLine()
                return false;
            }
            drawLine = drawLine+item.depth+"-"
            visited.push(item)
            dfsfn(item,visited)
        }
        for(let key in state.Next){
            if (visited.includes(state.Next[key])){
                clgdrawLine()
                return false;
            }
            drawLine = drawLine+state.Next[key].depth+"+"+key.toLocaleUpperCase()+"+"
            visited.push(state.Next[key])
            dfsfn(state.Next[key],visited)
        }
        clgdrawLine()
    }
    dfsfn(state,[])
}

function dfsRegexMatch(nfa:NFA,str:string){

    function fn(state:NFAState,visited:NFAState[],i:number):boolean{
        // 如果已经遍历整个nfa，则返回false
        if (visited.includes(state)){
            return false
        }
        // nfa到达了终止条件，返回true
        if(state.isEnd){
            return true
        }
        visited.push(state);
        // 找与当前节点通过ε相连的节点,如果其中有到达了终止条件的，返回true
        if(state.eNext.some(e=>fn(e,visited,i))){
            return true
        }
        // 当前节点是否能通过一般连接到达下一节点，如果不能则舍弃,若能则开始下一轮搜索
        let currentChar = str[i]
        if(state.Next[currentChar]){
            return (fn(state.Next[currentChar],visited,i+1))
        }else{
            return false
        }
    }

    return fn(nfa.start,[],0)
}


let mynfa = creatRegexNFA();
// dfs(mynfa.start,[],0);
// dfsDraw(mynfa.start);
// let t=0;
console.log(dfsRegexMatch(mynfa,"ab@a.com"))
console.log(dfsRegexMatch(mynfa,"abd@a.com"))
console.log(dfsRegexMatch(mynfa,"d@a.com"))