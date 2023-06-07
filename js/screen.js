import { Util } from './helper.js';

const { naiveParser, toLocaleString } = Util;

export const Screen = class {
    resultScreen = document.querySelector('.input-area__input');
    historyScreen = document.querySelector('.input-area__history');
    
    constructor () {
        this.r = this.resultScreen;
        this.h = this.historyScreen;
        this.vR = [];  // virtual result
        this.vH = [];  // virtual history
        this.onHistory = false;
        this.sensitive = false;
    }
    
    _curBuffer () {
        return this.onHistory ? this.vH : this.vR;
    }
    
    _curExpr () {
        return this._curBuffer().join('');
    }
    
    get content () {
        return this._curExpr();
    }
    
    get isEmpty () {
        return this.content.length === 0;
    }
    
    effectChanges() {
        this.r.innerText = this.localeString(this.formatResult(this.vR.join('')));
        this.h.innerText = this.formatResult(this.vH.join(''));
    }
    
    reset() {
        this.vR = [];
        this.vH = [];
        this.onHistory = false;
        this.sensitive = false;
        this.effectChanges();
    }
    
    localeString (result) {
        result = String(result);
        if (isNaN(result)) return result
        else if (result === '') return '';
        else if (result.includes('E')) return result;
        else return toLocaleString(result);
    }
    
    mapLocale (expr) {
        expr = expr.map((el) => this.localeString(el)).join('');
        return expr;
    }
    
    updateResult () {
        let expr = naiveParser(this.content);
        expr = this.mapLocale(expr);
        this.r.innerText = expr;
    }
    
    updateHistory () {
        let expr = naiveParser(this.content);
        expr = this.mapLocale(expr);
        this.h.innerText = expr;
    }
    
    _put (token) {
        let rBuffer = this.onHistory ? this.h : this.r;
        this._curBuffer().push(token);
        this.onHistory ? this.updateHistory() : this.updateResult();
    }
    
    put (token) {
        if (this.sensitive) this.reset();
        this._put(token);
    }
    
    putOp (op) {
        this.sensitive = false;
        this._put(op);
    }
    
    slice () {
        let expr = this.content;
        this._curBuffer().splice(-1, 1);
        this.onHistory ? this.updateHistory() : this.updateResult();
    }
    
    replace(newRepl) {
        newRepl = String(newRepl).replace('e+', 'E');
        this.vH = [];
        this.vR = newRepl.split('');
        this.r.innerText = this.localeString(this.formatResult(newRepl));
    }
    
    writeResult (result) {
        this.reset();
        this.replace(result);
        this.sensitive = true;
    }
    
    formatResult (result) {
        if (isNaN(result) || !isFinite(result)) return result;
        
        const clipper = (num) => {
            if (num.length < 16) return num; // this corrects 600...0
            num = num.toUpperCase();
            let len = num.length - num.indexOf('E');
            return num.slice(0, 10) + '...' + num.slice(-len, num.length);
        }
        
        if ( String(result).length >= 16 && !isNaN(result) ) {
            result = String(Number(result).toExponential())
            result = clipper(result);
        }
        
        return String(result).toUpperCase().replace('+', '');
    }
    
    dynamicWrite (result) {
        result = String(result).replace('e+', 'E');
        this.r.innerText = this.localeString(this.formatResult(result));
    }
    
    switchToHistory () {
        let temp = this.content;
        this.onHistory = true;
        this.vH = temp.split('');
        this.vR = [];
        this.effectChanges()
    }
    
    switchToResult () {
        let temp = this.content;
        this.onHistory = false;
        this.vH = [];
        this.vR = temp.split('');
        this.effectChanges();
    }
}
