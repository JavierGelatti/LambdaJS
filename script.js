const { variable, application, lambda, hole } = require('./src/ast')
const { toHtml } = require('./src/toHtml')

let expression = application(application(lambda('x', lambda('y', hole())), variable('a')), variable('b'))
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
        'insert-variable': selectedHole => {
            let variableName = prompt('Variable name?')
            if (variableName !== null && variableName.length !== 0) {
                expression = expression.replace(selectedHole.astNode, variable(variableName))
                render()
            }
        },
        'insert-abstraction': selectedHole => {
            let variableName = prompt('Variable name?')
            if (variableName !== null && variableName.length !== 0) {
                expression = expression.replace(selectedHole.astNode, lambda(variableName, hole()))
                render()
            }
        },
        'insert-application': selectedHole => {
            expression = expression.replace(selectedHole.astNode, application(hole(), hole()))
            render()
        }
    })

    setUpActionsOn('.abstraction, .application, *:not(.parameter) > .variable', {
        'delete': node => {
            expression = expression.replace(node.astNode, hole())
            render()
        },
        'wrap-lambda': node => {
            let variableName = prompt('Variable name?')
            if (variableName !== null && variableName.length !== 0) {
                expression = expression.replace(node.astNode, lambda(variableName, node.astNode))
                render()
            }
        },
        'wrap-application-argument': node => {
            expression = expression.replace(node.astNode, application(hole(), node.astNode))
            render()
        },
        'wrap-application-function': node => {
            expression = expression.replace(node.astNode, application(node.astNode, hole()))
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
