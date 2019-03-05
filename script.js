const { parseExpression } = require('./src/parser')
const { toHtml } = require('./src/toHtml')

function parse(x) { return parseExpression(x) }

let expression = parse("(λx.λy._) a b")
let contenedor = document.getElementById("contenedor")

let render = () => {
    contenedor.innerHTML = ''
    contenedor.appendChild(toHtml(expression))

    contenedor.querySelectorAll('.hole').
    forEach(hole => hole.addEventListener('click', evt => {
        hole.querySelector('.actions').classList.toggle('hidden')

        hole.querySelector('.insert-variable').addEventListener('click', evt => {
            let variableName = prompt('Variable name?')
            hole.astNode.value = parse(variableName)
            render()
            evt.stopPropagation()
        })
        hole.querySelector('.insert-abstraction').addEventListener('click', evt => {
            let variableName = prompt('Variable name?')
            hole.astNode.value = parse('λ' + variableName + '._')
            render()
            evt.stopPropagation()
        })
        hole.querySelector('.insert-application').addEventListener('click', evt => {
            hole.astNode.value = parse('_ _')
            render()
            evt.stopPropagation()
        })

        evt.stopPropagation()
    }))
}

document.body.addEventListener('click', evt => {
    return document.querySelectorAll('.actions').forEach(a => a.classList.add('hidden'))
})

document.getElementById("evaluar").addEventListener("click", evt => {
    if (!expression.toString().includes("_")) {
        expression = expression.fullBetaReduce()
        render()
    } else {
        alert("La expresión no está completa!")
    }
})

render()
