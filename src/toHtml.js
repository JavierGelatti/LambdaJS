const { ast: { identifier } } = require('f-calculus')

if (typeof document === 'undefined') {
    const { JSDOM } = require('js' + 'dom') // Don't use browserify here
    document = new JSDOM(`<!DOCTYPE html>`).window.document
}

class VisitorHtml {
    constructor(options, editor) {
        this.options = options
        this.editor = editor
    }

    toHtml(expression) {
        return expression.accept(this)
    }

    visitLambda(abstraction) {
        let parameterElement = htmlToElement(`<span class="parameter"></span>`)
        parameterElement.appendChild(abstraction.boundVariable.accept(this))

        let bodyElement = htmlToElement(`<span class="body"></span>`)
        bodyElement.appendChild(abstraction.body.accept(this))

        let abstractionElement = htmlToElement(`<span class="abstraction"></span>`)
        abstractionElement.insertAdjacentHTML('beforeend', `<span class="actions-container">
            <span class="actions">
            </span>
        </span>`)
        abstractionElement.appendChild(parameterElement)
        abstractionElement.appendChild(bodyElement)
        abstractionElement.astNode = abstraction

        this.addActionsTo(abstractionElement)

        return abstractionElement
    }

    visitApplication(application) {
        let functionElement = htmlToElement(`<span class="function"></span>`)
        functionElement.appendChild(application.abstraction.accept(this))

        let argumentElement = htmlToElement(`<span class="argument"></span>`)
        argumentElement.appendChild(application.argument.accept(this))

        let applicationElement = htmlToElement(`<span class="application"></span>`)
        applicationElement.insertAdjacentHTML('beforeend', `<span class="actions-container">
            <span class="actions">
            </span>
        </span>`)
        applicationElement.appendChild(functionElement)
        applicationElement.appendChild(argumentElement)
        applicationElement.astNode = application

        this.addActionsTo(applicationElement)

        return applicationElement
    }

    visitHole(holeElement) {
        let element = htmlToElement(`<span class="hole">
            <span class="actions"></span>
        </span>`)
        element.astNode = holeElement

        this.addActionsTo(element)

        return element
    }

    addActionsTo(element) {
        if (this.editor.selectedNode == element.astNode) element.classList.add('active')
        const actionsContainer = element.querySelector('.actions')
        const actionsForElement = this.editor.actionsFor(element.astNode)
        for (const action in actionsForElement) {
            const actionButton = document.createElement('span')
            actionButton.classList.add(action)
            onClick(actionButton, () => {
                const result = actionsForElement[action](element.astNode, this.editor.expression)
                this.editor.updateExpression(result['expression'], result['selection'])
            })
            actionsContainer.appendChild(actionButton)
        }

        on('click', element, () => {
            this.editor.deactivateAllNodes()
            if (this.editor.selectedNode !== element.astNode) {
                element.classList.add('active')
            }
            this.editor.selectNode(element.astNode)
        })
    }

    visitVariable(variable) {
        return variable.beingEdited ? this.visitVariableToBeDefined(variable) : this.visitDefinedVariable(variable)
    }

    visitDefinedVariable(variable) {
        let element = htmlToElement(`<span class="variable"></span>`)
        element.insertAdjacentHTML('beforeend', `<span class="actions-container">
            <span class="actions"></span>
        </span>`)
        element.appendChild(document.createTextNode(variable.name))
        element.astNode = variable

        this.addActionsTo(element)

        return element
    }

    visitVariableToBeDefined(variable) {
        let element = htmlToElement(`<span class="variable-tbd"></span>`)
        element.appendChild(htmlToElement(`<span tabindex="0" contenteditable="true" autocapitalize="none">&nbsp;</span>`))
        element.astNode = variable

        on('click', element, () => {
            // Do nothing
        })
        on('keypress', element, event => {
            if (event.keyCode !== 13) return;

            this.editor.updateExpression(this.editor.expression.replace(variable, identifier(element.innerText.trim())))
        })

        return element
    }
}

function onClick(element, handler) {
    return on('click', element, handler)
}

function on(event, element, handler) {
    element.addEventListener(event, event => {
        handler(event)
        event.stopPropagation()
    })
}

function htmlToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

const defaultOptions = {
    insertVariable: true,
    insertAbstraction: true,
    insertApplication: true,
    delete: true,
    wrapLambda: true,
    wrapApplicationArgument: true,
    wrapApplicationFunction: true
}

function toHtml(expression, editor, options = defaultOptions) {
    return new VisitorHtml(options, editor).toHtml(expression)
}

module.exports = { toHtml }
