const { variable, application, lambda, hole } = require('./src/ast')
const { toHtml } = require('./src/toHtml')

let expression = application(application(lambda('x', lambda('y', hole())), variable('a')), variable('b'))
let contenedor = document.getElementById("contenedor").querySelector(".lambda-calculus-expression > .expression")

let undoQueue = []
let redoQueue = []

function on(event, element, handler) {
    element.addEventListener(event, event => {
        handler()
        event.stopPropagation()
    })
}

function onClick(element, handler) {
    return on('click', element, handler)
}

function updateExpression(newExpression) {
    if (expression !== newExpression) {
        undoQueue.push(expression)
        redoQueue = []
        undoButton.disabled = false
        redoButton.disabled = true
        expression = newExpression
        render()
    }
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
            onClick(element.querySelector('.' + action), () => {
                let newExpression = actions[action](element.astNode, expression)
                updateExpression(newExpression)
            })
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
        'insert-variable': (selectedHole, expression) => {
            let variableName = prompt('Variable name?')
            if (variableName) {
                return expression.replace(selectedHole, variable(variableName))
            } else {
                return expression
            }
        },
        'insert-abstraction': (selectedHole, expression) => {
            let variableName = prompt('Variable name?')
            if (variableName) {
                return expression.replace(selectedHole, lambda(variableName, hole()))
            } else {
                return expression
            }
        },
        'insert-application': (selectedHole, expression) => {
            return expression.replace(selectedHole, application(hole(), hole()))
        }
    })

    setUpActionsOn('.abstraction, .application, *:not(.parameter) > .variable', {
        'delete': (node, expression) => {
            return expression.replace(node, hole())
        },
        'wrap-lambda': (node, expression) => {
            let variableName = prompt('Variable name?')
            if (variableName) {
                return expression.replace(node, lambda(variableName, node))
            } else {
                return expression
            }
        },
        'wrap-application-argument': (node, expression) => {
            return expression.replace(node, application(hole(), node))
        },
        'wrap-application-function': (node, expression) => {
            return expression.replace(node, application(node, hole()))
        },
    })
}

onClick(document.getElementById("contenedor").querySelector("button[name='evaluate']"), () => {
    updateExpression(expression.fullBetaReduce())
})

let undoButton = document.getElementById("contenedor").querySelector("button[name='undo']")
onClick(undoButton, () => {
    redoQueue.push(expression)
    redoButton.disabled = false
    expression = undoQueue.pop()
    undoButton.disabled = !(undoQueue.length > 0)
    render()
})

let redoButton = document.getElementById("contenedor").querySelector("button[name='redo']")
onClick(redoButton, () => {
    undoQueue.push(expression)
    undoButton.disabled = false
    expression = redoQueue.pop()
    redoButton.disabled = !(redoQueue.length > 0)
    render()
})

render()
