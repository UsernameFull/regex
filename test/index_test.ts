import {match} from "../src/index"

// simple
console.assert(match("a@a.com", "a@a.com"), "gg");
console.assert(!match("a@a.com", "a@b.com"), "gg");

// with "*"
console.assert(match("(a|b)@a.com", "a@a.com"), "gg");
console.assert(match("a*@a.com", "a@a.com"), "gg");
console.assert(match("a*@a.com", "@a.com"), "gg");
console.assert(!match("a*@a.com", "aaab@a.com"), "gg");


// with "|"
console.assert(match("(a|b)*@a.com", "a@a.com"), "gg");
console.assert(match("(a|b)*@a.com", "ababa@a.com"), "gg");
console.assert(!match("(a|b)*@a.com", "a@b.com"), "gg");
