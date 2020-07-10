const { parse } = require('f-calculus')
const { toHtml } = require('../src/toHtml')

describe('HTML', () => {
    test('toHtml', () => {
        const expression = parse('(λx.x x) (λy._)')
        expect(toHtml(expression).outerHTML).toMatchSnapshot()
    })
})