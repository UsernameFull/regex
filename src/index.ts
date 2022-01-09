import {strtoAST} from "./praser"
import {ASTtoENFA} from "./ast2enfa"
import { E_NFA2NFA, nfaRegexMatch } from "../src/enfa2nfa";

function match(pat:string,str:string) {
  let ast = strtoAST(pat);
  let enfa = ASTtoENFA(ast);
  let nfa = E_NFA2NFA(enfa);
  return nfaRegexMatch(nfa,str);
}

export {match}