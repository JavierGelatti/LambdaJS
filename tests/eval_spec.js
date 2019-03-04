const { suite, test, assert } = require('@pmoo/testy')

const { variable, application, lambda, apply } = require('../src/ast')

suite('Beta reduction', () => {
    test('beta reduction of a variable is the variable', () => {
        assert.that(variable("x").betaReduced()).
            isEqualTo(variable("x"))
    })

    test('beta reduction of an abstraction is the abstraction', () => {
        let abstraction = lambda("x", variable("x"))

        assert.that(abstraction.betaReduced()).
            isEqualTo(abstraction)
    })

    test('application without replacing', () => {
        let abstraction = lambda("x", variable("z"))
        let argument = variable("y")

        assert.that(apply(abstraction, argument)).isEqualTo(variable("z"))
    })

    test('application replacing a variable', () => {
        let abstraction = lambda("x", variable("x"))
        let argument = variable("y")

        assert.that(apply(abstraction, argument)).isEqualTo(argument)
    })

    test('application replacing a free variable inside a lambda', () => {
        let abstraction = lambda("x", lambda("y", variable("x")))
        let argument = variable("z")

        assert.that(apply(abstraction, argument)).isEqualTo(lambda("y", variable("z")))
    })

    test('application not replacing a bound variable inside a lambda', () => {
        let abstraction = lambda("x", lambda("x", variable("x")))
        let argument = variable("z")

        assert.that(apply(abstraction, argument)).isEqualTo(lambda("x", variable("x")))
    })

    test('application not replacing variables on an application', () => {
        let abstraction = lambda("x", application(variable("x"), variable("x")))

        assert.isTrue(apply(abstraction, variable("y")).equals(application(variable("y"), variable("y"))))
    })

    test('nested application on nested lambda', () => {
        let abstraction = lambda("x", lambda("y", variable("x")))

        assert.isTrue(
            application(
                application(abstraction, variable("a")),
                variable("b")
            ).betaReduced().betaReduced().equals(
                variable("a")
            )
        )
    })

    test('application of free variables', () => {
        assert.isTrue(
            application(
                variable("a"),
                variable("b")
            ).betaReduced().equals(
                application(
                    variable("a"),
                    variable("b")
                )
            )
        )
    })

    test('full beta reduce', () => {
        let abstraction = lambda("x", lambda("y", variable("y")))

        assert.isTrue(
            application(
                application(abstraction, variable("a")),
                application(variable("p"), variable("q"))
            ).fullBetaReduce().equals(
                application(variable("p"), variable("q"))
            )
        )
    })

    test('free vs bound while reducing', () => {
        let abstraction = lambda("x", lambda("y", variable("x")))

        assert.isTrue(
            application(
                application(abstraction, variable("y")),
                variable("z")
            ).fullBetaReduce().equals(
                variable("y")
            )
        )
    })

    test('alpha conversion ok', () => {
        let abstraction = lambda("x", variable("x"))

        assert.isTrue(abstraction.alphaConvert("y").
            equals(lambda("y", variable("y"))))
    })

    test('alpha conversion error', () => {
        let abstraction = lambda("x", variable("y"))

        assert.that(() => abstraction.alphaConvert("y")).raises("The variable y is free in the body")
    })
})