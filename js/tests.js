'use strict';

import { Util } from './helper.js'
import { evalExpr } from './parser.js';

const expect = (expr) => {
    let result = evalExpr(expr);
    
    return {
        toBe (exp) {
            if (exp !== result) {
                console.error(`${expr}; Expected: ${exp}, Got: ${result}`)
            }
        },
        toBeNaN () {
            if (!isNaN(result)) {
                console.error(`${expr}; Expected: NaN, Got: ${result}`);
            }
        },
    }
}

const run = () => {
    expect("56.1+55.2").toBe(111.3);
    expect("5*6/2+18%-2+(3/2)*-4").toBe(7.18);
    expect("15+6-2÷(3+4/(5+2)+3)*-4").toBe(22.21739);
    expect("14+23%+55.2/8+4").toBe(25.13);
    expect("89*6+16*(8*6+10.2)/3.2+(1.25-1.25*2)/2").toBe(824.375);
    
    // Testing Bad Expressions.
    expect("3-2-%").toBeNaN();
}

// uncomment to run the tests
// run();
