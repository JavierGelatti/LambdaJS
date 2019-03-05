const { parseExpression } = require('./src/parser')
const { toHtml } = require('./src/toHtml')

function parse(x) { return parseExpression(x) }

let expression = parse("(λx.λy._) a b")
let contenedor = document.getElementById("contenedor")

function hideAllActions() {
    contenedor.querySelectorAll('.actions').forEach(a => a.classList.add('hidden'))
}

function on(event, element, handler) {
    element.addEventListener(event, event => {
        handler()
        event.stopPropagation()
    })
}

function onClick(element, handler) {
    return on('click', element, handler)
}

let render = () => {
    contenedor.innerHTML = ''
    contenedor.appendChild(toHtml(expression))

    contenedor.querySelectorAll('.hole').forEach(hole => {
        onClick(hole, () => {
            hideAllActions()
            hole.querySelector('.actions').classList.toggle('hidden')
        })

        onClick(hole.querySelector('.insert-variable'), () => {
            let variableName = prompt('Variable name?')
            if (variableName !== null && variableName.length !== 0) {
                expression = expression.replace(hole.astNode, parse(variableName))
                render()
            }
        })

        onClick(hole.querySelector('.insert-abstraction'), () => {
            let variableName = prompt('Variable name?')
            if (variableName !== null && variableName.length !== 0) {
                expression = expression.replace(hole.astNode, parse('λ' + variableName + '._'))
                render()
            }
        })

        onClick(hole.querySelector('.insert-application'), () => {
            expression = expression.replace(hole.astNode, parse('_ _'))
            render()
        })
    })

    contenedor.querySelectorAll('.abstraction, .application, *:not(.parameter) > .variable').forEach(node => {
        onClick(node, () => {
            hideAllActions()
            node.querySelector('.actions').classList.toggle('hidden')
        })

        onClick(node.querySelector('.delete'), () => {
            expression = expression.replace(node.astNode, parse('_'))
            render()
        })

        onClick(node.querySelector('.wrap-lambda'), () => {
            let variableName = prompt('Variable name?')
            if (variableName !== null && variableName.length !== 0) {
                let lambda = parse('λ' + variableName + '._')
                lambda.body = node.astNode
                expression = expression.replace(node.astNode, lambda)
                render()
            }
        })

        onClick(node.querySelector('.wrap-application-argument'), () => {
            let application = parse('(_ _)')
            application.argument = node.astNode
            expression = expression.replace(node.astNode, application)
            render()
        })

        onClick(node.querySelector('.wrap-application-function'), () => {
            let application = parse('(_ _)')
            application.abstraction = node.astNode
            expression = expression.replace(node.astNode, application)
            render()
        })
    })

    contenedor.querySelectorAll('.abstraction, .application, .hole, *:not(.parameter) > .variable').
        forEach(abstraction => {
            on('mouseover', abstraction, () => {
                contenedor.querySelectorAll('.abstraction, .application, .hole, *:not(.parameter) > .variable').
                    forEach(a => a.classList.remove('hovered'))
                abstraction.classList.add('hovered')
            })
            on('mouseout', abstraction, () => {
                abstraction.classList.remove('hovered')
            })
        })
}

document.body.addEventListener('click', evt => hideAllActions())

document.getElementById("evaluar").addEventListener("click", evt => {
    expression = expression.fullBetaReduce()
    render()
})

render()
