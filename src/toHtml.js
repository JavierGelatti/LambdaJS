if (typeof document === 'undefined') {
    const { JSDOM } = require('js' + 'dom') // Don't use browserify here
    document = new JSDOM(`<!DOCTYPE html>`).window.document
}

class VisitorHtml {
    constructor(options) {
        this.options = options
    }

    toHtml(expression) {
        return expression.accept(this)
    }

    visitAbstraction(abstraction) {
        let parameterElement = htmlToElement(`<span class="parameter"></span>`)
        parameterElement.appendChild(this.toHtml(abstraction.boundVariable))

        let bodyElement = htmlToElement(`<span class="body"></span>`)
        bodyElement.appendChild(this.toHtml(abstraction.body))

        let abstractionElement = htmlToElement(`<span class="abstraction"></span>`)
        abstractionElement.insertAdjacentHTML('beforeend', `<span class="actions-container">
            <span class="actions">
                <span class="delete"></span>
                <span class="wrap-lambda"></span>
                <span class="wrap-application-argument"></span>
                <span class="wrap-application-function"></span>
            </span>
        </span>`)
        abstractionElement.appendChild(parameterElement)
        abstractionElement.appendChild(bodyElement)
        abstractionElement.astNode = abstraction

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
                <span class="delete"></span>
                <span class="wrap-lambda"></span>
                <span class="wrap-application-argument"></span>
                <span class="wrap-application-function"></span>
            </span>
        </span>`)
        applicationElement.appendChild(functionElement)
        applicationElement.appendChild(argumentElement)
        applicationElement.astNode = application

        return applicationElement
    }

    visitHole(hole) {
        let element = htmlToElement(`<span class="hole">
            <span class="actions">
                ${this.options.insertVariable ? '<span class="insert-variable"></span>' : ''}
                ${this.options.insertAbstraction ? '<span class="insert-abstraction"></span>' : ''}
                ${this.options.insertApplication ? '<span class="insert-application"></span>' : ''}
            </span>
        </span>`)
        element.astNode = hole
        return element
    }

    visitVariable(variable) {
        let element = htmlToElement(`<span class="variable"></span>`)
        element.insertAdjacentHTML('beforeend', `<span class="actions-container">
            <span class="actions">
                ${this.options.delete ? '<span class="delete"></span>' : ''}
                ${this.options.wrapLambda ? '<span class="wrap-lambda"></span>' : ''}
                ${this.options.wrapApplicationArgument ? '<span class="wrap-application-argument"></span>' : ''}
                ${this.options.wrapApplicationFunction ? '<span class="wrap-application-function"></span>' : ''}
            </span>
        </span>`)
        element.appendChild(document.createTextNode(variable.name))
        element.astNode = variable
        return element
    }

    visitVariableToBeDefined(variable) {
        let element = htmlToElement(`<span class="variable-tbd"></span>`)
        element.appendChild(htmlToElement(`<span contenteditable="true"></span>`))
        element.astNode = variable
        return element
    }
}

function htmlToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

function toHtml(expression, options = {}) {
    return new VisitorHtml(options).toHtml(expression)
}

module.exports = { toHtml }
