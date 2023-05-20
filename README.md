# Calculator
- A project from [Odin Project](https://www.theodinproject.com).
- The expression parsing was implemented using shunting yard algorithm [Wikipedia](https://wiki.com)
- My implentation of the algorithm is in js/parser.js.

## Features
- Can handle complex mathematical expressions.
- The UI does not support bracket (), but it is supported through keyboard.
- Dynamically give correct answers while entering expressions.
- Made it very hard (impossible?) to enter invalid operators.

## Notes
- The calculator we were asked to implement is a much simpler one but I decided to up the complexity and build a functional clone of my mobile phone's inbuilt calculator.

## Navigation
- helper.js contains helper methods used in app.js
- mediator.js acts as a middle man between user input and the screen, it determines what and what does not go on the screen.
- screen.js contains an object representing the screen.
- parser.js contains the expression parsing algorithm and the shunting yard algorithm.
- app.js which is the main interface of the app.

## Live Link
You can try out the calculator [Here](https://samswag01.github.io/calculator/)
