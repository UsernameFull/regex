class NFAState {
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
    start: NFAState=new NFAState;
    end: NFAState=new NFAState;
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
    let dotCOM = unionNFA(unionNFA(charDot,charC),unionNFA(charDot,charC));

    return ([group1,group2,to,group3,group4,dotCOM].reduce((a,v)=>(concatNFA(a,v))))
}