const { parseExpression } = require('./src/parser')
const { toHtml } = require('./src/toHtml')

function parse(x) { return parseExpression(x) }

let expression = parse("(λx.λy._) a b")
let contenedor = document.getElementById("contenedor")

function on(event, element, handler) {
    element.addEventListener(event, event => {
        handler()
        event.stopPropagation()
    })
}

function onClick(element, handler) {
    return on('click', element, handler)
}

function setUpActionsOn(selector, actions) {
    contenedor.querySelectorAll(selector).forEach(element => {
        on('click', element, () => {
            hideAllActions()
            element.querySelector('.actions').classList.toggle('hidden')
        })
        on('mouseover', element, () => {
            element.classList.add('hovered')
        })
        on('mouseout', element, () => {
            element.classList.remove('hovered')
        })

        for (const action in actions) {
            onClick(element.querySelector('.' + action), () => actions[action](element))
        }
    })
}

function hideAllActions() {
    contenedor.querySelectorAll('.actions').forEach(a => a.classList.add('hidden'))
}

let render = () => {
    contenedor.innerHTML = ''
    contenedor.appendChild(toHtml(expression))

    setUpActionsOn('.hole', {
        'insert-variable': hole => {
            let variableName = prompt('Variable name?')
            if (variableName !== null && variableName.length !== 0) {
                expression = expression.replace(hole.astNode, parse(variableName))
                render()
            }
        },
        'insert-abstraction': hole => {
            let variableName = prompt('Variable name?')
            if (variableName !== null && variableName.length !== 0) {
                expression = expression.replace(hole.astNode, parse('λ' + variableName + '._'))
                render()
            }
        },
        'insert-application': hole => {
            expression = expression.replace(hole.astNode, parse('_ _'))
            render()
        }
    })

    setUpActionsOn('.abstraction, .application, *:not(.parameter) > .variable', {
        'delete': node => {
            expression = expression.replace(node.astNode, parse('_'))
            render()
        },
        'wrap-lambda': node => {
            let variableName = prompt('Variable name?')
            if (variableName !== null && variableName.length !== 0) {
                let lambda = parse('λ' + variableName + '._')
                lambda.body = node.astNode
                expression = expression.replace(node.astNode, lambda)
                render()
            }
        },
        'wrap-application-argument': node => {
            let application = parse('(_ _)')
            application.argument = node.astNode
            expression = expression.replace(node.astNode, application)
            render()
        },
        'wrap-application-function': node => {
            let application = parse('(_ _)')
            application.abstraction = node.astNode
            expression = expression.replace(node.astNode, application)
            render()
        },
    })
}

document.body.addEventListener('click', evt => hideAllActions())

document.getElementById("evaluar").addEventListener("click", evt => {
    expression = expression.fullBetaReduce()
    render()
})

render()
