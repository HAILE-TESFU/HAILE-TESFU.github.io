
        /* eslint-disable no-cond-assign */
"use strict";



/**
 * The egg namespace is obeys the Global namespace. Here we creat a null object called egg
 * and move all the codes from the egg.js and refactoring it to make properly works.
 * 
 * @namespace egg
 */
//
let egg = Object.create(null);


/**
 * 
 * @param {string} program is a string which is passed as arguement to be parsed to is syntax tree.
 * the parametres "match" and "expr" are regular expression and the syntax tree representation respectively.
 * If the "string" matches with the regular expression it creates it syntax tree.
 * @returns {object} the syntax tree of the data structure.
 */
egg.parseExpression =function(program) {
  program = this.skipSpace(program);
  let match, expr;
  if (match = /^"([^"]*)"/.exec(program)) {  //string
    expr = { type: "value", value: match[1] };
  } else if (match = /^\d+\b/.exec(program)) {  //number
    expr = { type: "value", value: Number(match[0]) };
  } else if (match = /^[^\s(),#"]+/.exec(program)) {  //word
    expr = { type: "word", name: match[0] };
  } else {
    throw new SyntaxError("Unexpected syntax: " + program);
  }

  return this.parseApply(expr, program.slice(match[0].length));
};

/**
 * 
 * @param {string} string it takes the string which means the "program" to deduct the character
 * determined it type of data structure.
 * 
 * @returns {string} returns the deducted string for parameter for the "program"
 */
egg.skipSpace = function(string) {
  let first = string.search(/\S/);
  if (first == -1) return "";
  return string.slice(first);
};

egg.skipSpace = function(string) {
  let first = string.search(/\S/);
  if (string[first] == "#") {
      let eol = string.search(/$/m);
      return this.skipSpace(string.slice(eol + 1));
  }
  if (first == -1) return "";
  return string.slice(first);
};

/**
 * 
 * @param {string} expr is the syntax tree formed for each character from the string.
 * @param {string} program is the remaining string after the skipSapce function worked.
 * @returns {object} am object with property expr holding the syntax tree expression for the input expr string and property rest containing the remainder of the unparsed program
 * @throws {SyntaxError} if there is a malfromed application expression
 */
egg.parseApply = function(expr, program) {
  program = this.skipSpace(program);
  if (program[0] != "(") {
    return { expr: expr, rest: program };
  }

  program = this.skipSpace(program.slice(1));
  expr = { type: "apply", operator: expr, args: [] };
  while (program[0] != ")") {
    let arg = this.parseExpression(program);
    expr.args.push(arg.expr);
    program = this.skipSpace(arg.rest);
    if (program[0] == ",") {
      program = this.skipSpace(program.slice(1));
    } else if (program[0] != ")") {
      throw new SyntaxError("Expected ',' or ')'");
    }
  }
  return this.parseApply(expr, program.slice(1));
};

/**
 * 
 * @param {string} program is the egg program code
 * @returns {object} is the syntax tree for the program
 * @throws {SyntaxError} if parse the program and then find there are still characters remaining
 */
egg.parse = function(program) {
  let { expr, rest } = this.parseExpression(program);
  if (this.skipSpace(rest).length > 0) {
    throw new SyntaxError("Unexpected text after program");
  }
  return expr;
};

/* quick test of parser */
console.log(egg.parse("+(a, 10)"));
// → {type: "apply",
//    operator: {type: "word", name: "+"},
//    args: [{type: "word", name: "a"},
//           {type: "value", value: 10}]}


egg.specialForms = Object.create(null);

/**
 * 
 * @param {object} expr is an object to be evaluated
 * @param {object} scope is an object "map" of variable name bindings -- name value pairs that does not inherit from Object
 * @returns {value} whatever the expression evaluates to
 * @throws {ReferenceError} if there is a word expression but no binding in scope
 * @throws {TypeError} if there is an apply expression that is not a special form or function
 */
egg.evaluate = function(expr, scope) {
  if (expr.type == "value") {
    return expr.value;
  } else if (expr.type == "word") {
    if (expr.name in scope) {
      return scope[expr.name];
    } else {
      throw new ReferenceError(
        `Undefined binding: ${expr.name}`);
    }
  } else if (expr.type == "apply") {
    let { operator, args } = expr;
    if (operator.type == "word" &&
      operator.name in this.specialForms) {
      return this.specialForms[operator.name](expr.args, scope);
    } else {
      let op = this.evaluate(operator, scope);
      if (typeof op == "function") {
        return op(...args.map(arg => this.evaluate(arg, scope)));
      } else {
        throw new TypeError("Applying a non-function.");
      }
    }
  }
};

/**
 * if takes 3 arguments and returns the whatever the 2nd evaluates to if the first evaluates to 'true', else it evaluates the 3rd and returns its value
 * @param {array} args is array of arguments to if special form
 * @param {object} scope is object map of variables in local? scope
 * @returns {value} returns whatever the 2nd or 3rd argument evaluate to
 */
egg.specialForms.if = (args, scope) => {
  if (args.length != 3) {
    throw new SyntaxError("Wrong number of args to if");
  } else if (egg.evaluate(args[0], scope) !== false) {
    return egg.evaluate(args[1], scope);
  } else {
    return egg.evaluate(args[2], scope);
  }
};

/**
 * JSdoc needed here
 */
egg.specialForms.while = (args, scope) => {
  if (args.length != 2) {
    throw new SyntaxError("Wrong number of args to while");
  }
  while (egg.evaluate(args[0], scope) !== false) {
    egg.evaluate(args[1], scope);
  }

  // Since undefined does not exist in Egg, we return false,
  // for lack of a meaningful result.
  return false;
};

/**
 * JSdoc needed here
 */
egg.specialForms.do = (args, scope) => {
  let value = false;
  for (let arg of args) {
    value = egg.evaluate(arg, scope);
  }
  return value;
};

/**
 * JSdoc needed here
 */
egg.specialForms.define = (args, scope) => {
  if (args.length != 2 || args[0].type != "word") {
    throw new SyntaxError("Incorrect use of define");
  }
  let value = egg.evaluate(args[1], scope);
  scope[args[0].name] = value;
  return value;
};


egg.topScope = Object.create(null);

egg.topScope.true = true;
egg.topScope.false = false;

/*
A way to output values is also useful, so we’ll wrap console.log in a function and call it print.
*/
egg.topScope.print = value => {
  console.log(value);
  return value;
};

/* quick test of parse and evaluate */
// eslint-disable-next-line quotes
let prog = egg.parse(`if(true, false, true)`);
console.log("expecting false: " + egg.evaluate(prog, egg.topScope));
// → false


/*
To supply basic arithmetic and comparison operators, we will also add some function values to the scope. In 
the interest of keeping the code short, we’ll use Function to synthesize a bunch of operator functions in a loop, 
instead of defining them individually.
*/
for (let op of ["+", "-", "*", "/", "==", "<", ">"]) {
  egg.topScope[op] = Function("a, b", `return a ${op} b;`);
}

/**
 * provides a convenient way to parse a program and run it in a fresh scope:
 * @param {*} program is the egg program to  run
 * @returns {value} the output of the program
 */
egg.run = function(program) {
  return this.evaluate(this.parse(program), Object.create(egg.topScope));
};

/* test small program with no functions -- should print 55 to console */
egg.run(`
do(define(total, 0),
   define(count, 1),
   while(<(count, 11),
         do(define(total, +(total, count)),
            define(count, +(count, 1)))),
   print(total))
`);
// → 55

/**
 * fun construct, which treats its last argument as the function’s body and uses all arguments before that as the names of the function’s parameters.
 * Functions in Egg get their own local scope. The function produced by the fun form creates this local scope and adds the argument bindings to it. It 
 * then evaluates the function body in this scope and returns the result
 * @param {array} args is array of arguments and body of function
 * @param {array} scope is array of local bindings for the function
 * @return {function} returns a javascript function that will evaluate the egg function when called
 */
egg.specialForms.fun = (args, scope) => {
  if (!args.length) {
    throw new SyntaxError("Functions need a body");
  }
  let body = args[args.length - 1];
  let params = args.slice(0, args.length - 1).map(expr => {
    if (expr.type != "word") {
      throw new SyntaxError("Parameter names must be words");
    }
    return expr.name;
  });

  return function() {
    if (arguments.length != params.length) {
      throw new TypeError("Wrong number of arguments");
    }
    let localScope = Object.create(scope);
    for (let i = 0; i < arguments.length; i++) {
      localScope[params[i]] = arguments[i];
    }
    return egg.evaluate(body, localScope);
  };
};

console.log("Test plusOne function, expect 11: " );
egg.run(`
do(define(plusOne, fun(a, +(a, 1))),
   print(plusOne(10)))
`);
// → 11

console.log("Test pow function, expecting 1024: " );
egg.run(`
do(define(pow, fun(base, exp,
     if(==(exp, 0),
        1,
        *(base, pow(base, -(exp, 1)))))),
   print(pow(2, 10)))
`);
// → 1024

egg.topScope.array = function (...values) {
  return values;
};

egg.topScope.length = function (values) {
  return values.length;
};

egg.topScope.element = function (values, n) {
  return values[n];
};

egg.run(`
do(define(sum, fun(array,
     do(define(i, 0),
        define(sum, 0),
        while(<(i, length(array)),
          do(define(sum, +(sum, element(array, i))),
             define(i, +(i, 1)))),
        sum))),
   print(sum(array(1, 2, 3))))
`);
// → 6

egg.run(`
do(define(f, fun(a, fun(b, +(a, b)))),
   print(f(4)(5)))
`);
// → 9




console.log(egg.parse("# hello\nx"));
// → {type: "word", name: "x"}

console.log(egg.parse("a # one\n   # two\n()"));
// → {type: "apply",
//    operator: {type: "word", name: "a"},
//    args: []}
  
