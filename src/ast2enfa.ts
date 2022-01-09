import { BuildE_NFA,E_NFA } from "./enfa";
import {ASTNode} from "./praser"

// 有了ast之后，从ast转到enfa还是很简单的
function ASTtoENFA(ast: ASTNode):E_NFA {
  switch (ast.label) {
    case "Expr":
      if (ast.child.length === 3) {
        // 此时为 trem "|" "exp"
        return BuildE_NFA.unionE_NFA(
          ASTtoENFA(ast.child[0]),
          ASTtoENFA(ast.child[2])
        );
      } else {
        return ASTtoENFA(ast.child[0]);
      }
    case "Term":
      if (ast.child.length === 2) {
        // 此时为 factor trem
        return BuildE_NFA.concatE_NFA(
          ASTtoENFA(ast.child[0]),
          ASTtoENFA(ast.child[1])
        );
      } else {
        return ASTtoENFA(ast.child[0]);
      }
    case "Factor":
      if (ast.child.length === 2) {
        // 此时为 factor "*"
        return BuildE_NFA.closureE_NFA(ASTtoENFA(ast.child[0]));
      } else {
        return ASTtoENFA(ast.child[0]);
      }
    case "Atom":
      if (ast.child.length === 3) {
        // 此时为 "(" exp ")"
        return ASTtoENFA(ast.child[1]);
      } else {
        return ASTtoENFA(ast.child[0]);
      }
    case "Char":
      return BuildE_NFA.creatE_NFA(ast.child[0].label);
    default:
      throw new Error("Ast to enfa error");
  }
}

export { ASTtoENFA };
