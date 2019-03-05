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

    contenedor.querySelectorAll('.hole').forEach(hole => {
        hole.addEventListener('click', evt => {
            hideAllActions()
            hole.querySelector('.actions').classList.toggle('hidden')
            evt.stopPropagation()
        })

        hole.querySelector('.insert-variable').addEventListener('click', evt => {
            hideAllActions()
            let variableName = prompt('Variable name?')
            if (variableName !== null && variableName.length !== 0) {
                expression = expression.replace(hole.astNode, parse(variableName))
                render()
            }
            evt.stopPropagation()
        })
        hole.querySelector('.insert-abstraction').addEventListener('click', evt => {
            hideAllActions()
            let variableName = prompt('Variable name?')
            if (variableName !== null && variableName.length !== 0) {
                expression = expression.replace(hole.astNode, parse('λ' + variableName + '._'))
                render()
            }
            evt.stopPropagation()
        })
        hole.querySelector('.insert-application').addEventListener('click', evt => {
            hideAllActions()
            expression = expression.replace(hole.astNode, parse('_ _'))
            render()
            evt.stopPropagation()
        })
    })

    contenedor.querySelectorAll('.abstraction, .application').forEach(node => {
        node.addEventListener('click', evt => {
            hideAllActions()
            node.querySelector('.actions').classList.toggle('hidden')
            evt.stopPropagation()
        })

        node.querySelector('.delete').addEventListener('click', evt => {
            hideAllActions()
            expression = expression.replace(node.astNode, parse('_'))
            render()
            evt.stopPropagation()
        })
        node.querySelector('.wrap-lambda').addEventListener('click', evt => {
            hideAllActions()
            let variableName = prompt('Variable name?')
            if (variableName !== null && variableName.length !== 0) {
                let lambda = parse('λ' + variableName + '._')
                lambda.body = node.astNode
                expression = expression.replace(node.astNode, lambda)
                render()
            }
            evt.stopPropagation()
        })
        node.querySelector('.wrap-application-argument').addEventListener('click', evt => {
            hideAllActions()
            let application = parse('(_ _)')
            application.argument = node.astNode
            expression = expression.replace(node.astNode, application)
            render()
            evt.stopPropagation()
        })
        node.querySelector('.wrap-application-function').addEventListener('click', evt => {
            hideAllActions()
            let application = parse('(_ _)')
            application.abstraction = node.astNode
            expression = expression.replace(node.astNode, application)
            render()
            evt.stopPropagation()
        })
    })
    contenedor.querySelectorAll('.abstraction, .application, .hole').
        forEach(abstraction => {
            abstraction.addEventListener('mouseover', evt => {
                contenedor.querySelectorAll('.abstraction, .application, .hole').forEach(a => a.classList.remove('hovered'))
                abstraction.classList.add('hovered')
                evt.stopPropagation()
            })
            abstraction.addEventListener('mouseout', evt => abstraction.classList.remove('hovered'))
        })
}

document.body.addEventListener('click', evt => hideAllActions())

document.getElementById("evaluar").addEventListener("click", evt => {
    expression = expression.fullBetaReduce()
    render()
})

render()
