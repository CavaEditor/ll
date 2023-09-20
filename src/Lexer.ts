// file pentru analiza lexiconului

import Token from "./Token";
import TokenType, { tokenTypeList } from "./TokenType";

export default class Lexer{
    //pentru codul care se va efectua analiza lexiconului
    code: string;
    pos: number = 0;
    tokenList: Token[] = [];

    constructor(code: string) {
        this.code = code;
    }


    analizaLex(): Token[] {
        
        while (this.nextToken()){}
        this.tokenList = this.tokenList.filter(token => token.type.name != tokenTypeList.SPACE.name);
        return this.tokenList;
    }
    nextToken(): boolean {
        if (this.pos >= this.code.length) {
            return false;
        }
        //intoarcem toate tipurile care le avem pentru valori
        const tokenTypesValuess = Object.values(tokenTypeList);
        for(let i = 0; i < tokenTypesValuess.length; i++) {
            const tokenType = tokenTypesValuess[i];
            console.log(tokenTypesValuess[i]);
            // ^ = inceputul liniei de cod
            const regex = new RegExp('^' + tokenType.regex);
            const result = this.code.substr(this.pos).match(regex);
           if(result && result[0]) {
                const token = new Token(tokenType, result[0], this.pos);
                this.pos += result[0].length;
                this.tokenList.push(token);
                return true;
           }
           
        }
        //throw new Error(`Pe pozitia ${this.pos} este o eroare de sintaxa!`)
        return true;
    }
}