'use strict';

import { Delegates, Util } from './helper.js';
import { Mediator } from './mediator.js';

const ctrl = new Mediator();
const { delegate, keyDelegate } = Delegates();
const { getOpName } = Util;

const Calc = {
    // contains part of App that deals with the DOM
    DOM: {
        calcBtns: document.getElementById('btns'),
    },
    handleNum (target) {
        let value = target.dataset.sym;
        let ident;
        let id = target.id;
        
        if (id == 'bO' || id == 'bC') ident = 'bracket';
        else if (id == 'percent') ident = 'percent';
        else if (id == 'dot') ident = 'dot';
        else ident = 'num';
        
        let data = { 
            ident, name: id, 
            type: 'num', value,
        };
        ctrl.receive(data);
    },
    handleOp (target) {
        let op = target.dataset.sym;
        ctrl.receive({ ident: 'op', name: target.id, type: 'op', value: op });
    },
    handleEval () {
        ctrl.evaluate();
    },
    handleDelete () {
        ctrl.del();
    },
    clearConsole () {
        ctrl.clear();
    },
    handleKeyboard (key) {
        let { handleNum, handleOp, handleEval, handleDelete, clearConsole } = Calc;
        
        if ( /[0-9]/.test(key) ) {
            handleNum({id: key, dataset: {sym: key}});
        } else if ( key == '.' ) { 
            handleNum( { id: 'dot', dataset: { sym: key } })
        } else if (/[()]/.test(key)) {
            let id = key == '(' ? 'bO' : 'bC';
            handleNum( { id, dataset: { sym: key } })
        } else if (key == '%') {
            handleNum( { id: 'percent', dataset: { sym: key } })
        } else if ('-/+x*'.includes(key)) {
            let keyMap = {'-': '−', '*': '×', 'x': '×', '/': '÷'}
            key = keyMap[key] || key;
            let id = getOpName(key);
            handleOp( { id, dataset: { sym: key } });
        } else if (key === 'Escape') {
            clearConsole();
        } else if (key === 'Backspace') {
            handleDelete();
        } else if (key === 'Enter' || key == " ") {
            handleEval();
        }
    },
    handleSwitch () {
        // global variables set by the browser.
        bO.classList.toggle('hid');
        bC.classList.toggle('hid');
        dot.classList.toggle('hid');
        percent.classList.toggle('hid');
    },
    init() {
        const { 
            DOM, handleNum, handleOp, handleEval, 
            clearConsole, handleDelete, handleKeyboard, 
            handleSwitch,
        } = Calc;
        const container = DOM.calcBtns;
        
        delegate(container, 'click', '.num', handleNum);
        delegate(container, 'click', '.op', handleOp);
        delegate(container, 'click', '.equal', handleEval);
        delegate(container, 'click', '.clear', clearConsole);
        delegate(container, 'click', '.del', handleDelete);
        
        delegate(swtch, 'click', '.hanger', handleSwitch);
        
        keyDelegate(handleKeyboard);
    }
}

Calc.init();
