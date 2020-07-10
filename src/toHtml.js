const { VisitorToAddActions } = require('./actions')

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
        new VisitorToAddActions(this.options).addActionsTo(expression)
        return expression.accept(this)
    }

    visitLambda(abstraction) {
        let parameterElement = htmlToElement(`<span class="parameter"></span>`)
        parameterElement.appendChild(
            new VisitorHtmlForParameters(this.options, this.editor)
                .toHtml(abstraction.boundVariable)
        )

        let bodyElement = htmlToElement(`<span class="body"></span>`)
        bodyElement.appendChild(this.toHtml(abstraction.body))

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
        functionElement.appendChild(this.toHtml(application.abstraction))

        let argumentElement = htmlToElement(`<span class="argument"></span>`)
        argumentElement.appendChild(this.toHtml(application.argument))

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
        const actionsContainer = element.querySelector('.actions')
        for (const action in element.astNode.actions) {
            const actionButton = document.createElement('span')
            actionButton.classList.add(action)
            onClick(actionButton, () => {
                const result = element.astNode.actions[action](element.astNode, this.editor.expression)
                this.editor.updateExpression(result['expression'], result['selection'])
            })
            actionsContainer.appendChild(actionButton)
        }
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
        return element
    }
}

class VisitorHtmlForParameters extends VisitorHtml {
    commonActions() {
        return {}
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

function toHtml(expression, editor, options = {}) {
    return new VisitorHtml(options, editor).toHtml(expression)
}

module.exports = { toHtml }
