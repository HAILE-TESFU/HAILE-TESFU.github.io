
"use strict";
/* global assert egg*/
describe("parser tests", function () {

    it("remove spaces from code", function () {
        assert.equal(egg.skipSpace("    a string without space in front"), "a string without space in front");
    });


    it("test of parse +(a , 10) expression", function () {
        let parseResult = egg.parse("+(a, 10)");
        // → {type: "apply",
        //    operator: {type: "word", name: "+"},
        //    args: [{type: "word", name: "a"},
        //           {type: "value", value: 10}]}
        assert.equal(parseResult.type, "apply");
        assert.equal(parseResult.operator.type, "word");
        assert.equal(parseResult.args.length, 2);
    });

    it("test of parseExpression +(a, 10)", function() {
        let result = egg.parseExpression("+(a, 10)");
        assert.equal(result.expr.type, "apply");
        assert.equal(result.expr.operator.name, "+");
        assert.equal(result.rest.length, 0);
    });



});

//====================================================================================================
describe("parser tests", function () {
    it("test of parse +(a , 10) expression", function () {
        //let parseResult = egg.parse("+(a, 10)");
        assert.equal(egg.run(`
        do(define(total, 0),
           define(count, 1),
           while(<(count, 11),
                 do(define(total, +(total, count)),
                    define(count, +(count, 1)))),
           print(total))
        `), 55);
        
    });
});
//======================================================================================
describe("parser tests", function () {
    it("test of parse +(a , 10) expression", function () {
        //let parseResult = egg.parse("+(a, 10)");
        assert.equal(egg.run(`
        do(define(plusOne, fun(a, +(a, 1))),
           print(plusOne(10)))`), 11);    
    });
});
//======================================================================================
describe("parser tests", function () {
    it("test of parse +(a , 10) expression", function () {
        //let parseResult = egg.parse("+(a, 10)");
        assert.equal(egg.run(`
        do(define(pow, fun(base, exp, if(==(exp, 0),1,*(base, pow(base, -(exp, 1)))))),
           print(pow(2, 10)))
        `), 1024);    
    });
});
//=============================================================================
describe("parser tests", function () {
    it("test of parse +(a , 10) expression", function () {
        //let parseResult = egg.parse("+(a, 10)");
        assert.equal(egg.run(`
        do(define(sum, fun(array,
             do(define(i, 0),
                define(sum, 0),
                while(<(i, length(array)),
                  do(define(sum, +(sum, element(array, i))),
                     define(i, +(i, 1)))),
                sum))),
           print(sum(array(1, 2, 3))))
        `), 6);    
    });
});
//===============================================================================
describe("parser tests", function () {
    it("test of parse +(a , 10) expression", function () {
        //let parseResult = egg.parse("+(a, 10)");
        assert.equal(egg.run(`
        do(define(f, fun(a, fun(b, +(a, b)))),
           print(f(4)(5)))
        `), 9);    
    });
});
