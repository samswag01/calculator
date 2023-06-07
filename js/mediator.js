'use strict';

import { Screen } from './screen.js';
import { Util } from './helper.js';
import { evalExpr } from './parser.js';

const { 
    isNum, isEmpty, isOperator, opMap,
    operatorIsStacked, getLast, parseExpr,
    removeTrailingOp, getLastAst, badExpr,
    zeroError, 
} = Util;

export const Mediator = class {
    constructor () {
        this.scr = new Screen();
        this.empty = () => !this.scr.content;
        this.putScreen = expr => this.scr.put(expr);
        this.content = () => this.scr.content;
    }
    
    solve (expr) {
        try {
            return evalExpr(expr);
        } catch (err) {
            return err.message;
        }
    }
    
    dynamicEval () {
        if (this.scr.onHistory) {
            let expr = this.scr.content;
            expr = removeTrailingOp(expr);
            let answer = expr ? this.solve(expr) : '';
            answer = (isNaN(answer)) ? '' : answer;
            this.scr.dynamicWrite(answer);
        }
    }
    
    receive (data) {
        const { ident } = data,
            methods = { 
                num: this.writeNum,
                percent: this.writePercent,
                dot: this.writeDot,
                bracket: this.writeBracket,
                op: this.writeOp,
            };
            
        const func = methods[ident];
        func ? func.bind(this, data)() : null;
    }
    
    writeNum (ident) {
        let { value } = ident;
        let expr = this.content()
        let last = getLastAst(expr);
        let ast = parseExpr(expr);
        
        if (expr === '0' || last === '0') {
            this.scr.slice()
        }
        if ((ast.length === 1 && expr.includes('E') && !this.scr.sensitive)) {
            this.writeMul({ value: opMap('mul')})
        } else if ((ast.length === 2 && ast[1].includes('E') && !this.scr.sensitive)) {
            // when the content is a unary.
            this.writeMul({ value: opMap('mul')})
        }
        this.putScreen(value);
        this.dynamicEval();
    }
    
    writePercent () {
        let expr = this.content().split('');
        if (!this.scr.onHistory && !this.empty() && !(expr.every(ex => ex === '%'))) {
            this.scr.switchToHistory();
        }
        this.scr.sensitive = false;
        this.putScreen('%');
        this.dynamicEval();
    }
    
    writeDot () {
        let lastExpr = getLastAst(this.content());
        let value = '.';
        if (
            this.empty() 
            || isOperator(lastExpr) 
            || this.scr.sensitive
            || '()'.includes(lastExpr)
            || lastExpr === '%'
        ) {
            this.putScreen('0');
        } else if (lastExpr.includes('E')) {
            this.writeMul();
            return this.writeDot();
        } else if ( lastExpr.includes('.') ) {
            return;
        }
        this.putScreen(value);
    }
    
    writeBracket (data) {
        if (!this.scr.onHistory) this.scr.switchToHistory();
        this.putScreen(data.value);
    }
    
    writeGenericOp (data) {
        let expr = this.content();
        let last = getLast(expr);
        let s = opMap('sub');
        
        if (!expr || isOperator(expr)) { // when screen is empty or only - is on the screen
            this.clear(); return;
        } else if (last == s || expr == `(${s}` || isOperator(last)) {
            this.scr.slice();
        }
        if (!this.scr.onHistory) { this.scr.switchToHistory(); }
        this.scr.putOp(data.value);
    }
    
    writeSub (data) {
        let m = opMap('mul'), d = opMap('div');
        let s = data.value;
        let last = getLast(this.content());
        
        if (this.content() == s) { return; }
        if (isOperator(last) && (last != m && last != d)) {
            this.scr.slice();
        }
        if (!this.scr.onHistory && last) { this.scr.switchToHistory(); }
        this.scr.putOp(s);
    }
    
    writeMul (data={ value: opMap('mul') }) {
        this.writeGenericOp(data)
    }
    
    writeDiv (data) {
        this.writeGenericOp(data)
    }
    
    writeSum (data) {
        this.writeGenericOp(data)
    }
    
    writeOp (data) {
        const { name } = data,
        methods = {
            mul: this.writeMul,
            div: this.writeDiv,
            add: this.writeSum,
            sub: this.writeSub
        }
        
        if (operatorIsStacked(this.content())) {
            this.scr.slice();
        }
        
        const func = methods[name];
        func.bind(this, data)();
    }
    
    evaluate () {
        let expr = this.content();
        if (this.empty()) return;
        
        let answer = this.solve(expr);
        answer = answer == zeroError ? zeroError : (answer == badExpr || isNaN(answer)) ? badExpr : answer;
        if (answer == badExpr || answer == zeroError || !isFinite(answer)) {
            this.scr.dynamicWrite(answer);
        } else {
            this.scr.writeResult(answer);
        }
    }
    
    del () {
        let expr = this.content();
        
        if (this.scr.sensitive || this.empty()) {
            this.clear();
        }
        if (expr) {
            let ast = parseExpr(expr);
            if (ast.length === 1 && ast.pop().includes('E')) {
                this.clear();
            } else if (ast.length == 2 && (ast[1].includes('E'))) {
                this.clear();
            } else {
                this.scr.slice();
                this.dynamicEval();
            }
        }
        
         // Move to result screen when their is no operator or only unary.
         let ast = parseExpr(this.content());
         if (this.scr.onHistory && ast.length === 1 || (ast.length === 2 && ast[0] === 'u')) {
             this.scr.switchToResult();
         }
    }
    
    clear () {
        this.scr.reset();
    }
}
