import Lexer from "./Lexer";
import Parser from "./Parser";

const code = 
`v = 100 + 5; 
AFISARE v ;`
const lexer = new Lexer(code);
lexer.analizaLex()

const parser = new Parser(lexer.tokenList);
const rootNode = parser.parseCode();
parser.run(rootNode);
