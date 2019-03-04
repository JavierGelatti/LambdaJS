const { suite, test, assert } = require('@pmoo/testy')
const { variable, application, lambda } = require('../src/ast')
const { parseExpression } = require('../src/parser')

suite('Parser', () => {
    test('variables', () => {
        assert.that(parseExpression("asd")).isEqualTo(variable("asd"))
    })

    test('lambdas', () => {
        assert.that(parseExpression("λx.x")).isEqualTo(lambda("x", variable("x")))
    })

    test('application', () => {
        assert.that(parseExpression("x y")).isEqualTo(application(variable("x"), variable("y")))
    })

    test('application inside lambda', () => {
        assert.that(parseExpression("λx.x x")).isEqualTo(lambda("x", application(variable("x"), variable("x"))))
    })

    test('nested lambdas', () => {
        assert.that(parseExpression("λx.λy.x")).
            isEqualTo(lambda("x", lambda("y", variable("x"))))
    })

    test('nested application', () => {
        assert.that(parseExpression("x y z")).
            isEqualTo(application(application(variable("x"), variable("y")), variable("z")))
    })

    test('parentheses in application function', () => {
        assert.that(parseExpression("(λx.x) y")).
            isEqualTo(application(lambda("x", variable("x")), variable("y")))
    })

    test('parentheses in application argument', () => {
        assert.that(parseExpression("(λx.x) (y)")).
            isEqualTo(application(lambda("x", variable("x")), variable("y")))
    })

    test('parentheses in variables', () => {
        assert.that(parseExpression("(x)")).
            isEqualTo(variable("x"))
    })

    test('nested parentheses', () => {
        assert.that(parseExpression("((λx.((x))))")).
            isEqualTo(lambda("x", variable("x")))
    })
})