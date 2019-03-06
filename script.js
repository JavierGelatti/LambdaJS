const { variable, application, lambda, hole } = require('./src/ast')
const { toHtml } = require('./src/toHtml')

function on(event, element, handler) {
    element.addEventListener(event, event => {
        handler()
        event.stopPropagation()
    })
}

function onClick(element, handler) {
    return on('click', element, handler)
}

class Editor {
    constructor(container, initialExpression = hole()) {
        this.expression = initialExpression
        this.undoQueue = []
        this.redoQueue = []
        this.undoButton = container.querySelector("button[name='undo']")
        this.redoButton = container.querySelector("button[name='redo']")
        this.container = container
        this.expressionContainer = container.querySelector(".expression")
    }

    updateExpression(newExpression) {
        if (this.expression !== newExpression) {
            this.undoQueue.push(this.expression)
            this.redoQueue = []
            this.undoButton.disabled = false
            this.redoButton.disabled = true
            this.expression = newExpression
            this.render()
        }
    }

    setUpActionsOn(selector, actions) {
        this.expressionContainer.querySelectorAll(selector).forEach(element => {
            on('click', element, () => {
                if (element.classList.contains('active')) {
                    this.deactivateAllNodes()
                } else {
                    this.deactivateAllNodes()
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
                    let newExpression = actions[action](element.astNode, this.expression)
                    this.updateExpression(newExpression)
                })
            }
        })
    }

    deactivateAllNodes() {
        this.expressionContainer.querySelectorAll('.active').
            forEach(a => a.classList.remove('active'))
    }

    render() {
        this.expressionContainer.innerHTML = ''
        this.expressionContainer.appendChild(toHtml(this.expression))

        this.setUpActionsOn('.hole', {
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

        this.setUpActionsOn('.abstraction, .application, *:not(.parameter) > .variable', {
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

    init() {
        document.body.addEventListener('click', () => this.deactivateAllNodes())

        onClick(this.container.querySelector("button[name='evaluate']"), () => {
            this.updateExpression(this.expression.fullBetaReduce())
        })

        onClick(this.undoButton, () => {
            this.redoQueue.push(this.expression)
            this.expression = this.undoQueue.pop()
            this.undoButton.disabled = this.undoQueue.length === 0
            this.redoButton.disabled = this.redoQueue.length === 0
            this.render()
        })

        onClick(this.redoButton, () => {
            this.undoQueue.push(this.expression)
            this.expression = this.redoQueue.pop()
            this.undoButton.disabled = this.undoQueue.length === 0
            this.redoButton.disabled = this.redoQueue.length === 0
            this.render()
        })

        this.render()
    }
}

document.
    getElementById("contenedor").
    querySelectorAll(".lambda-calculus-expression").
    forEach(container => {
        let expression = application(application(lambda('x', lambda('y', hole())), variable('a')), variable('b'))
        new Editor(container, expression).init()
    })

