/*
REGEX BNF

exp -> term | term "|" exp      ;// "|" 并联 或规则
term -> factor | factor term    ;// 串联 与规则
factor -> atom | atom "*"       ;// "*" 重复 可重规则
atom -> char | "(" exp ")"      ;// ()的优先级最高
char -> a|b|c|d....

*/

class ASTNode {
  id: number = 0;
  label: string;
  child: ASTNode[];
  constructor(label = "", child: ASTNode[] = []) {
    this.label = label;
    this.child = child;
  }
}

// 注意：
// 1.正则是同样有着算符优先级，例如对于a|b*，会被理解为a|(b*),而不是(a|b)*
// 2.在构建AST树的过程中，我们不会构建'('')'代表的节点，因为'('')'实质上是手动指定算符结合优先度，而这会表现在ast树结构而非节点上
function strtoAST(str: string) {
  let pos = 0;
  // 返回当前token
  const current = () => str[pos];
  const isEnd = () => pos >= str.length;

  // 返回当前的token并前进一步
  function next() {
    let ch = current();
    pos++;
    return ch;
  }
  // match(ch)的含义是下一个token应当是ch，并且匹配成功后前进一步
  const match = (ch: string) => {
    if (current() !== ch) {
      throw new Error(`Unexpected symbol ${ch} at position:${pos}`);
    }
    pos++;
  };

  // 匹配char
  function char() {
    // "*"不能单独使用
    if (current() == "*")
      throw new Error(`Unexpected "*" char at position:${pos}`);

    return new ASTNode("Char", [new ASTNode(next())]);
  }
  // 匹配atom
  function atom() {
    //atom 开头必为普通字符串或者"("，若为"("，则
    if (current() === "(") {
      match("(");
      const exp = expr();
      match(")");
      return new ASTNode("Atom", [new ASTNode("("), exp, new ASTNode(")")]);
    }
    const ch = char();
    return new ASTNode("Atom", [ch]);
  }
  // 匹配factor
  function factor() {
    const atm = atom();
    if (current() === "*") {
      let c = next();
      return new ASTNode("Factor", [atm, new ASTNode(c)]);
    }
    return new ASTNode("Factor", [atm]);
  }

  function term(): ASTNode {
    const factr = factor();
    // term 开头不可能是"|"或者")"
    if (!isEnd() && current() !== "|" && current() !== ")") {
      const trm = term();
      return new ASTNode("Term", [factr, trm]);
    }

    return new ASTNode("Term", [factr]);
  }

  function expr(): ASTNode {
    const trm = term();

    if (!isEnd() && current() === "|") {
      match("|");
      const exp = expr();
      return new ASTNode("Expr", [trm, new ASTNode("|"), exp]);
    }

    return new ASTNode("Expr", [trm]);
  }

  return expr();
}

export { ASTNode, strtoAST };
