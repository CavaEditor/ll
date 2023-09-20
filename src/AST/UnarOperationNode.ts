import Token from "../Token";
import ExpressionNode from "./ExpressionNode";

//operator care are un singur nod, in cazul nostru afisarea
export default class UnarOperationNode {
    operator: Token
    operand: ExpressionNode;

    constructor(operator: Token, operand: ExpressionNode){
        this.operator = operator;
        this.operand = operand;
    }
}