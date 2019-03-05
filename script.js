const { parseExpression } = require('./src/parser')
const { toHtml } = require('./src/toHtml')

function parse(x) { return parseExpression(x) }

let expression = parse("(λx.λy._) a b")
let contenedor = document.getElementById("contenedor")

function hideAllActions() {
    contenedor.querySelectorAll('.actions').forEach(a => a.classList.add('hidden'))
}

let render = () => {
    contenedor.innerHTML = ''
    contenedor.appendChild(toHtml(expression))

    contenedor.querySelectorAll('.hole').
        forEach(hole => hole.addEventListener('click', evt => {
            hideAllActions()
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

    contenedor.querySelectorAll('.abstraction').
        forEach(abstraction => abstraction.addEventListener('click', evt => {
            hideAllActions()
            abstraction.querySelector('.actions').classList.toggle('hidden')

            abstraction.querySelector('.delete').addEventListener('click', evt => {
                expression = expression.replace(abstraction.astNode, parse('_'))
                render()
                evt.stopPropagation()
            })
            abstraction.querySelector('.wrap-lambda').addEventListener('click', evt => {
                let variableName = prompt('Variable name?')
                let lambda = parse('λ' + variableName + '._')
                lambda.body = abstraction.astNode
                expression = expression.replace(abstraction.astNode, lambda)
                render()
                evt.stopPropagation()
            })
            abstraction.querySelector('.wrap-application-argument').addEventListener('click', evt => {
                let application = parse('(_ _)')
                application.argument = abstraction.astNode
                expression = expression.replace(abstraction.astNode, application)
                render()
                evt.stopPropagation()
            })
            abstraction.querySelector('.wrap-application-function').addEventListener('click', evt => {
                let application = parse('(_ _)')
                application.abstraction = abstraction.astNode
                expression = expression.replace(abstraction.astNode, application)
                render()
                evt.stopPropagation()
            })

            evt.stopPropagation()
        }))
    contenedor.querySelectorAll('.abstraction, .hole').
        forEach(abstraction => {
            abstraction.addEventListener('mouseover', evt => {
                contenedor.querySelectorAll('.abstraction, .hole').forEach(a => a.classList.remove('hovered'))
                abstraction.classList.add('hovered')
                evt.stopPropagation()
            })
            abstraction.addEventListener('mouseout', evt => abstraction.classList.remove('hovered'))
        })
}

document.body.addEventListener('click', evt => hideAllActions())

document.getElementById("evaluar").addEventListener("click", evt => {
    if (!expression.toString().includes("_")) {
        expression = expression.fullBetaReduce()
        render()
    } else {
        alert("La expresión no está completa!")
    }
})

render()
