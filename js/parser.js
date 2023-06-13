'use strict';

import { Util } from './helper.js';

const { 
    parseExpr, precise, toNumber,
    zeroError, badExpr, getLast,
} = Util;

const op = {
    add (...args) { return args.reduce((a, b) => a + b, 0) },
    sub (...args) { return args.reduce((a, b) => b - a) },
    mul (...args) { return args.reduce((a, b) => a * b, 1) },
    div (...args) { 
        return args.reduce((a, b) => { 
            if (a === 0) throw new Error(zeroError);
            return b / a
        });
    },
    unary (args) { return args*-1 },
}

const exprMap = {
    '+': op.add,
    '-': op.sub,
    '*': op.mul,
    '/': op.div,
    'u': op.unary,
}

const precedence = {
    [op.div]: 2,
    [op.mul]: 2,
    [op.add]: 1,
    [op.sub]: 1,
    [op.unary]: 3,
}

export const evalExpr = (expr) => {
    const { shunt } = Eval; // using destructuring makes 'this' undefined.

    let curExpr = parseExpr(expr);
    curExpr = curExpr.map((el) => {
        if (exprMap.hasOwnProperty(el)) {
            el = exprMap[el];
        }
        return el instanceof Function ? el : toNumber(el);
    });
    let result = Eval.shunt(curExpr);
    return result.isInteger ? result : precise(result);
}

const Eval = {
    calculateAnswer (rpn) {
        const { unary, add } = op
        let result = [];
    
        for (let i = 0; i < rpn.length; i++) {
            if (rpn[i] === unary) { // handle cases of unary.
                result.push(unary(result.pop()));
            } else if (rpn[i] instanceof Function) {
                let func = rpn[i]
                result.push(func(result.pop(), result.pop()));
            } else if (rpn[i] === '%') {
            	if (i === rpn.length - 2 && result.length > 1 && (getLast(rpn) == op.add || getLast(rpn) == op.sub)) {
            		let percent = result.pop();
            		let lastVal = getLast(result);
            		result.push((percent/100)*lastVal);
            	} else {
                	result.push(result.pop() / 100);
                }
            } else {
                result.push(rpn[i]);
            }
        }
        return result.length > 1 ? add(...result) : result.pop();
    },
    shunt (expr) {
        let output = [];
        let operator = [];
    
        for (let i = 0; i < expr.length; i++) {
            if (!isNaN(expr[i])) { // a number
                output.push(expr[i]);
            } else if (expr[i] == '%') {
                output.push(expr[i]);
            } else if (expr[i] === '(') {
                operator.push(expr[i]);
            } else if (expr[i] === ')') {
                while (operator.length > 0 && operator[operator.length-1] !== '(') {
                    output.push(operator.pop());
                }
                if (operator.length === 0) {
                    throw new Error(badExpr);
                }
                operator.pop() // remove the trailing (
                
            } else { // an operator
                if (operator.length === 0 || operator[operator.length-1] === '(') {
                    operator.push(expr[i]);
                } else {
                    let curOp = operator[operator.length - 1];
                    while (curOp && (precedence[curOp] >= precedence[expr[i]])) {
                        output.push(operator.pop());
                        curOp = operator[operator.length - 1];
                    }
                    operator.push(expr[i]);
                }
            }
        }
        
        while (operator.length > 0) {
            let op = operator.pop();
            if (op === '(') {
                continue;
            }
            output.push(op);
        }
        return this.calculateAnswer(output);
    }
}
