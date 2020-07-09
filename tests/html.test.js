const { parse } = require('f-calculus')
const { toHtml } = require('../src/toHtml')

describe('HTML', () => {
    xtest('toHtml', () => {
        let expression = parse('(λx.x x) (λy.y)')
        assert.that(toHtml(expression).outerHTML).isEqualTo('...')
    })
})