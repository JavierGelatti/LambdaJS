const { Editor } = require('../src/editor')

describe('HTML', () => {
    test('toHtml', () => {
        const container = document.createElement('div')
        container.innerText = '(λx.x x) (λy._)'
        const editor = new Editor()
        editor.bindTo(container)
        editor.render()

        expect(container.outerHTML).toMatchSnapshot()
    })
})