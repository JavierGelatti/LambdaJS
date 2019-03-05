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
            if (element.classList.contains('active')) {
                deactivateAllNodes()
            } else {
                deactivateAllNodes()
                element.classList.add('active')
            }
        })
        on('mouseover', element, () => {
            element.classList.add('hovered')
        })
        on('mouseout', element, () => {
            element.classList.remove('hovered')
        })

        for (const action in actions) {
            onClick(element.querySelector('.' + action), () => actions[action](element.astNode))
        }
    })
}

function deactivateAllNodes() {
    contenedor.querySelectorAll('.active').forEach(a => a.classList.remove('active'))
}

document.body.addEventListener('click', deactivateAllNodes)

let render = () => {
    contenedor.innerHTML = ''
    contenedor.appendChild(toHtml(expression))

    setUpActionsOn('.hole', {
        'insert-variable': selectedHole => {
            let variableName = prompt('Variable name?')
            if (variableName !== null && variableName.length !== 0) {
                expression = expression.replace(selectedHole, variable(variableName))
                render()
            }
        },
        'insert-abstraction': selectedHole => {
            let variableName = prompt('Variable name?')
            if (variableName !== null && variableName.length !== 0) {
                expression = expression.replace(selectedHole, lambda(variableName, hole()))
                render()
            }
        },
        'insert-application': selectedHole => {
            expression = expression.replace(selectedHole, application(hole(), hole()))
            render()
        }
    })

    setUpActionsOn('.abstraction, .application, *:not(.parameter) > .variable', {
        'delete': node => {
            expression = expression.replace(node, hole())
            render()
        },
        'wrap-lambda': node => {
            let variableName = prompt('Variable name?')
            if (variableName !== null && variableName.length !== 0) {
                expression = expression.replace(node, lambda(variableName, node))
                render()
            }
        },
        'wrap-application-argument': node => {
            expression = expression.replace(node, application(hole(), node))
            render()
        },
        'wrap-application-function': node => {
            expression = expression.replace(node, application(node, hole()))
            render()
        },
    })
}

document.getElementById("evaluar").addEventListener("click", evt => {
    expression = expression.fullBetaReduce()
    render()
})

render()
