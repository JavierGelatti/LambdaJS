const { variable, variableTBD, application, lambda, hole } = require('./ast')
const { toHtml } = require('./toHtml')
const { parseExpression } = require('./parser')

function on(event, element, handler) {
    if (element === null) return
    element.addEventListener(event, event => {
        handler(event)
        event.stopPropagation()
    })
}

function onClick(element, handler) {
    return on('click', element, handler)
}

class Editor {
    constructor() {
        this.undoQueue = []
        this.redoQueue = []
    }

    updateExpression(newExpression) {
        if (this.expression !== newExpression) {
            this.undoQueue.push(this.expression)
            this.redoQueue = []
            this.undoButton.disabled = false
            this.redoButton.disabled = true
            this.setExpression(newExpression)
            this.render()
        }
    }

    setExpression(expression) {
        this.expression = expression
        if (expression.toString() === 'pepe') {
            this.container.classList.add('success')
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
        const options = {
            insertVariable: true,
            insertAbstraction: !this.container.classList.contains('only-variables'),
            insertApplication: !this.container.classList.contains('only-variables'),
            delete: true,
            wrapLambda: !this.container.classList.contains('only-variables'),
            wrapApplicationArgument: !this.container.classList.contains('only-variables'),
            wrapApplicationFunction: !this.container.classList.contains('only-variables'),
        }
        this.expressionContainer.appendChild(toHtml(this.expression, options))

        this.setUpActionsOn('.hole', {
            'insert-variable': (selectedHole, expression) => {
                return expression.replace(selectedHole, variableTBD())
            },
            'insert-abstraction': (selectedHole, expression) => {
                return expression.replace(selectedHole, lambda(variableTBD(), hole()))
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
                return expression.replace(node, lambda(variableTBD(), node))
            },
            'wrap-application-argument': (node, expression) => {
                return expression.replace(node, application(hole(), node))
            },
            'wrap-application-function': (node, expression) => {
                return expression.replace(node, application(node, hole()))
            },
        })

        this.expressionContainer.querySelectorAll('.variable-tbd').forEach(element => {
            on('click', element, () => {
                // Do nothing
            })
            on('keypress', element, event => {
                if (event.keyCode === 13) {
                    this.updateExpression(this.expression.replace(element.astNode, variable(element.innerText)))
                }
            })
        })
    }

    bindTo(container) {
        this.container = container
        this.expression = parseExpression(this.container.innerText.trim())

        const showUndoAndRedo = !this.container.classList.contains('without-undo')
        const undoAndRedo = `<span class="actions">
            <button name="undo" title="Undo" disabled>
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 485.215 485.215">
                    <path d="M257.751,113.708c-74.419,0-140.281,35.892-181.773,91.155L0,128.868v242.606h242.606l-82.538-82.532c21.931-66.52,84.474-114.584,158.326-114.584c92.161,0,166.788,74.689,166.788,166.795C485.183,215.524,383.365,113.708,257.751,113.708z"/>
                </svg>
            </button>
            <button name="redo" title="Redo" disabled>
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 485.215 485.215">
                    <path d="M227.443,113.724c74.421,0,140.283,35.892,181.773,91.155l75.999-75.994v242.606H242.592l82.523-82.532c-21.921-66.52-84.465-114.584-158.326-114.584C74.659,174.375,0,249.064,0,341.17C0,215.541,101.817,113.724,227.443,113.724z"/>
                </svg>
            </button>
        </span>`
        const showEvaluate = !this.container.classList.contains('without-evaluate')
        let evaluate = `<span class="actions">
            <button name="evaluate">¡Evaluar!</button>
        </span>`
        this.container.innerHTML = `
            ${showUndoAndRedo ? undoAndRedo : ''}
            <span class="expression"></span>
            ${showEvaluate ? evaluate : ''}
        `
        this.undoButton = this.container.querySelector("button[name='undo']") || document.createElement('button')
        this.redoButton = this.container.querySelector("button[name='redo']") || document.createElement('button')
        this.expressionContainer = this.container.querySelector(".expression")

        document.body.addEventListener('click', () => this.deactivateAllNodes())

        onClick(this.container.querySelector("button[name='evaluate']"), () => {
            this.updateExpression(this.expression.fullBetaReduce())
        })

        onClick(this.undoButton, () => {
            this.redoQueue.push(this.expression)
            this.setExpression(this.undoQueue.pop())
            this.undoButton.disabled = this.undoQueue.length === 0
            this.redoButton.disabled = this.redoQueue.length === 0
            this.render()
        })

        onClick(this.redoButton, () => {
            this.undoQueue.push(this.expression)
            this.setExpression(this.redoQueue.pop())
            this.undoButton.disabled = this.undoQueue.length === 0
            this.redoButton.disabled = this.redoQueue.length === 0
            this.render()
        })

        this.render()
    }
}

module.exports = { Editor }
