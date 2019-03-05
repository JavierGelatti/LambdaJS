const { suite, test, assert } = require('@pmoo/testy')
const { parseExpression } = require('../src/parser')
const { toHtml } = require('../src/toHtml')

suite('HTML', () => {
    /* ignored * /
    test('toHtml', () => {
        let expression = parseExpression('(λx.x x) (λy.y)')
        assert.that(toHtml(expression).outerHTML).isEqualTo('...')
    })
    /**/
})