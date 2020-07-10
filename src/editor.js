const { toHtml } = require('./toHtml')
const { parse } = require('f-calculus')
const { ActionCollector } = require('./actions')

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
        this.selectedNode = null
    }

    updateExpression(newExpression, selectedNode = null) {
        if (this.expression !== newExpression) {
            this.undoQueue.push(this.expression)
            this.redoQueue = []
            this.undoButton.disabled = false
            this.redoButton.disabled = true
            this.setExpression(newExpression)
            this.selectedNode = selectedNode
            this.render()
        }
    }

    setExpression(expression) {
        this.expression = expression
        this.actions = new ActionCollector(this.options).allActionsFor(this.expression)
        this.selectedNode = null
        if (expression.toString() === 'pepe') {
            this.container.classList.add('success')
        }
    }

    setUpActionsOn(selector) {
        this.expressionContainer.querySelectorAll(selector).forEach(element => {
            on('mouseover', element, () => {
                element.classList.add('hovered')
            })
            on('mouseout', element, () => {
                element.classList.remove('hovered')
            })
        })
    }

    actionsFor(expression) {
        return this.actions.get(expression)
    }

    selectNode(node) {
        this.selectedNode = (this.selectedNode === node) ? null : node
    }

    deactivateAllNodes() {
        this.expressionContainer.querySelectorAll('.active').
        forEach(a => a.classList.remove('active'))
    }

    render() {
        this.expressionContainer.innerHTML = ''
        this.expressionContainer.appendChild(toHtml(this.expression, this, this.options))

        const selectedElement = Array.from(this.expressionContainer.querySelectorAll("*")).
            find(element => element.astNode === this.selectedNode)

        if (selectedElement && selectedElement.firstChild && selectedElement.firstChild.focus) {
            selectedElement.firstChild.focus()
        }

        this.setUpActionsOn('.hole, .abstraction, .application, .variable')
    }

    bindTo(container) {
        this.container = container
        this.options = {
            insertVariable: true,
            insertAbstraction: !this.container.classList.contains('only-variables'),
            insertApplication: !this.container.classList.contains('only-variables'),
            delete: true,
            wrapLambda: !this.container.classList.contains('only-variables'),
            wrapApplicationArgument: !this.container.classList.contains('only-variables'),
            wrapApplicationFunction: !this.container.classList.contains('only-variables'),
        }
        this.setExpression(parse(this.container.innerText.trim()))

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
