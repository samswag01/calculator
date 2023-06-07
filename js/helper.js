'use strict';

export const Util = {
    zeroError: 'Can\'t divide by 0',
    badExpr: 'Bad Expression!',
    precise (x) {
        return parseFloat(x.toFixed(5));
    },
    toNumber (num) {
        if (num === '') return NaN;
        if (num === '(' || num === ')' || num === '%') return num;
        return Number(num);
    },
    normalize (expr) {
        let repl = { '×': '*', '÷': '/', '−': '-' };
        Object.entries(repl).forEach(([el, val]) => {
            expr = expr.replaceAll(el, val);
        });
        return expr;
    },
    isEmpty (input) { // input is empty?
        return input.length === 0;
    },
    isNum (item) {
        return (!isNaN(item) && item.length) || item === 'e';
    },
    getLast (expr) {
        return expr.length ? expr[expr.length - 1] : '';
    },
    getLastAst (expr) {
        expr = Util.parseExpr(expr);
        return Util.getLast(expr);
    },
    isOperator (tok) {
        let opList = '+-−*×÷/u'.split('');
        return opList.includes(tok);
    },
    opMap (opName) {
        let opSymbol = { add: '+', sub: '−', mul: '×', div: '÷' }
        return opSymbol[opName];
    },
    getOpName (sym) {
        let opName = { '-': 'sub', '−': 'sub', '+': 'add', '÷': 'div', '×': 'mul' };
        return opName[sym];
    },
    noOperator (expr) {
        const { isNum } = Util;
        let ast = parse(expr);
        return ast.every(el => isNum(el));
    },
    operatorIsStacked (expr) {
        const { isOperator, parseExpr } = Util;
        let ast = parseExpr(expr);
        let count = 0;
    
        let first = ast.pop();
        let second = ast.pop();
        return (isOperator(first) && isOperator(second));
    },
    removeTrailingOp (expr) {
        const { parseExpr, isOperator, getLast } = Util;
        
        let ast = parseExpr(expr);
        let last = getLast(ast);
        
        while (ast.length && isOperator(last)) {
            ast.pop();
            last = ast[ast.length-1];
        }
        
        return ast.join('');
    },
    toLocaleString (number) {
        const strNumber = String(number); // Convert the number to a string
        const parts = strNumber.split('.'); // Split into integer and decimal parts
        let integerPart = parts[0];
        const decimalPart = parts[1] || ''; // Handle decimal part if present
          
        const separator = ',';
        const pattern = /(\d+)(\d{3})/;
          
        while (pattern.test(integerPart)) {
            integerPart = integerPart.replace(pattern, `$1${separator}$2`);
        }
          
        let toReturn = `${integerPart}${decimalPart !== '' ? `.${decimalPart}` : ''}`;
        return strNumber.endsWith('.') ? toReturn+'.' : toReturn;
    },
    getStructure (expr) {
        const { isNum, isOperator, getOpName } = Util;
        let struct = expr.split("").map((el) => {
            if (isNum(el)) {
                return { name: el, type: 'num', value: el };
            } else if (el === '.') {
                return { name: 'dot', type: 'dot', value: el };
            } else if (el === '(' || el === ')') {
                let name = el === '(' ? 'bO' : 'bC';
                return { name, type: 'bracket', value: el };
            } else if (isOperator(el)) {
                return { type: 'op', value: el, name: getOpName(el) };
            } else if (el === '%') {
                return { name: 'type', type: 'percent', value: el };
            } else {
                return { name: null, type: null, value: el };
            }
        });
        return struct;
    },
    naiveParser (expr) {
        const { getLast } = Util;
        expr = expr.replace('e+', 'E');
        let parsed = [];

        expr.split('').forEach((el, idx) => {
            let len = parsed.length;

            if (!len || (isNaN(el) && el !== '.')) {
                parsed.push(el);
            } else if (isNaN(getLast(parsed)) && getLast(parsed) != '.') {
                parsed.push(el);
            } else {
                parsed[len - 1] += el;
            }
        });
        return parsed;
    },
    parseExpr (expr) {
        const { getLast, isOperator, isNum, normalize } = Util;

        expr = expr.replace('e+', 'e');
        expr = normalize(expr);
        let funcs = new Set("-+/*()%u".split(""));
        let parsed = [];

        expr.split('').forEach((el, idx) => {
            let len = parsed.length;

            if (getLast(parsed) === '%' && isNum(el)) {
                parsed.push('*');
                parsed.push(el);
            } else if (len && (el === '(' && isNum(getLast(parsed)))) {
                parsed.push('*');
                parsed.push(el);
            } else if (len && (el === ')' && isNum(expr[idx+1]))) {
                parsed.push(el);
                parsed.push('*');
            } else if (el === '-' && (!len || getLast(parsed) == '(' || isOperator(getLast(parsed)))) {
                parsed.push('u');
            } else if (!len || funcs.has(el) || funcs.has(getLast(parsed))) {
                parsed.push(el);
            } else {
                parsed[len - 1] += el;
            }
        });
        return parsed;
    },
}

export const Delegates = () => {
    const delegate = (parentElement, eventType, selector, callback) => {
        parentElement.addEventListener(eventType, (event) => {
            let target = event.target;
            if (target.matches(selector)) {
                callback(target);
            }
        });
    }
    // Handles Keyboard Insert
    const keyDelegate = (callback) => {
        window.addEventListener('keyup', (event) => {
            let key = event.key;
            callback(key);
        });
    }
    
    return { delegate, keyDelegate }
}
