//parsarea codului 
import BinOperationNode from "./AST/BinOperationNode";
import ExpressionNode from "./AST/ExpressionNode";
import NumberNode from "./AST/NumberNode";
import StatementsNode from "./AST/StatementsNode";
import UnarOperationNode from "./AST/UnarOperationNode";
import VariableNode from "./AST/VariableNode";
import Token from "./Token";
import TokenType, { tokenTypeList } from "./TokenType";

export default class Lexer {
    tokens: Token[];
    pos: number = 0;
    scope: any = {};

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    match(...expected: TokenType[]): Token | null{
        if (this.pos < this.tokens.length){
            const currentToken = this.tokens[this.pos];
            if(expected.find(type => type.name === currentToken.type.name)){
                this.pos += 1;
                return currentToken;
            }
        }
        return null;
        //this.require(tokenTypeList.SEMICOLON);
    }

    require(...expected: TokenType[]): Token {
        const token = this.match(...expected);
        if(!token){
            throw new Error(`pe pozitia ${this.pos} se astepta ${expected[0].name}`)
        }
        return token;
    }

    
    //afisarea la ecran
    parsePrint(): ExpressionNode{
        const token = this.match(tokenTypeList.LOG);
        if(token != null){
            return new UnarOperationNode(token, this.parseFormula());
        }
        throw new Error(`Se asteapta operator AFISARE pe positia ${this.pos}`);
    }
    //parsarea formulelor in paranteze patrate
    parseBrace(): ExpressionNode{
        if(this.match(tokenTypeList.LBRA) != null){
            const nod = this.parseFormula();
            this.require(tokenTypeList.RBRA);
            return nod;
        } else {
            return this.parsePar();
        }
    }
    //parsarea formulelor in paranteze
    parsePar(): ExpressionNode {
        if(this.match(tokenTypeList.LPAR) !=null){
            const node = this.parseFormula();
            this.require(tokenTypeList.RPAR);
            return node;
        } else {
           return this.parseVariableOrNumber();
        }
    }
    //parsarea formulelor calculelor
    parseFormula(): ExpressionNode {
        let leftNod = this.parseBrace();
        let operator = this.match(tokenTypeList.MINUS, tokenTypeList.PLUS);
        while(operator != null){
            const rightNode = this.parseBrace();
            leftNod = new BinOperationNode(operator, leftNod, rightNode);
            operator = this.match(tokenTypeList.MINUS, tokenTypeList.PLUS);
        }
        return leftNod;
    }

    //parsarea unei variabile sau unei cifre
    parseVariableOrNumber(): ExpressionNode{
        const number = this.match(tokenTypeList.NUMBER);
        if(number != null){
            return new NumberNode(number);
        }
        const variable = this.match(tokenTypeList.VARIABLE);
        if(variable != null){
            return new VariableNode(variable);
        }
        throw new Error(`Se asteapta variabila sau numar pe pozitia ${this.pos}`);
    }
    //parsarea expresiei dintr-o linie de cod
    parseExpression(): ExpressionNode {
        if(this.match(tokenTypeList.VARIABLE) == null){
            const printNode = this.parsePrint();
            return printNode;
        }
        this.pos -=1;
        let variableNode = this.parseVariableOrNumber();
        const assignOperator = this.match(tokenTypeList.ASSIGN);
        if(assignOperator != null){
            const rightFormulaNode = this.parseFormula();
            const binaryNode = new BinOperationNode(assignOperator, variableNode, rightFormulaNode);
            return binaryNode;
        }
        throw new Error(`Dupa variabila se asteapta semnul egal???`);
    }
    //se incepe parsarea
    parseCode(): ExpressionNode {
        const root = new StatementsNode();
        while(this.pos < this.tokens.length){
            const codeStringNode = this.parseExpression();
            this.require(tokenTypeList.SEMICOLON);
            root.addNode(codeStringNode);
        }
        return root;
    }

    run(node: ExpressionNode): any{
        if(node instanceof NumberNode){
            return parseInt(node.number.text);
        }
        if(node instanceof UnarOperationNode){
            switch(node.operator.type.name){
                case tokenTypeList.LOG.name: console.log(this.run(node.operand)) 
                return;
            }
        }
        if(node instanceof BinOperationNode){
            switch(node.operator.type.name){
                case tokenTypeList.PLUS.name: return this.run(node.leftNode) + this.run(node.rightNode)
                case tokenTypeList.MINUS.name: return this.run(node.leftNode) - this.run(node.rightNode)
                case tokenTypeList.MULTIPLY.name: return this.run(node.leftNode) * this.run(node.rightNode)
                case tokenTypeList.ASSIGN.name:  
                const result = this.run(node.rightNode)
                const variableNod = <VariableNode>node.leftNode;
                this.scope[variableNod.variable.text] = result;
                return result;
            }
        }
        if(node instanceof VariableNode) {
            if(this.scope[node.variable.text]) {
                return this.scope[node.variable.text]
            } else {
                throw new Error(`Variabila cu numele ${node.variable.text} nu exista`)
            }
        }
        if(node instanceof StatementsNode){
            node.codeStrings.forEach(codeString => {
                this.run(codeString);
            })
            return;
        }
        throw new Error(`Eroare!`);
    }
}