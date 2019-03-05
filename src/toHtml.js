if (typeof document === 'undefined') {
    const { JSDOM } = require('js' + 'dom') // Don't use browserify here
    document = new JSDOM(`<!DOCTYPE html>`).window.document
}

class VisitorHtml {
    toHtml(expression) {
        return expression.accept(this)
    }

    visitAbstraction(abstraction) {
        let parameterElement = htmlToElement(`<span class="parameter"></span>`)
        parameterElement.appendChild(this.toHtml(abstraction.boundVariable))

        let bodyElement = htmlToElement(`<span class="body"></span>`)
        bodyElement.appendChild(this.toHtml(abstraction.body))

        let abstractionElement = htmlToElement(`<span class="abstraction"></span>`)
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
        applicationElement.appendChild(functionElement)
        applicationElement.appendChild(argumentElement)
        applicationElement.astNode = application

        return applicationElement
    }

    visitHole(hole) {
        if (hole.isEmpty()) {
            let element = htmlToElement(`<span class="hole">
                <span class="actions hidden">
                    <span class="insert-variable"></span>
                    <span class="insert-abstraction"></span>
                    <span class="insert-application"></span>
                </span>
            </span>`)
            element.astNode = hole
            return element
        } else {
            return this.toHtml(hole.value)
        }
    }

    visitVariable(variable) {
        let element = htmlToElement(`<span class="variable">${variable.name}</span>`)
        element.astNode = variable
        return element
    }
}

function htmlToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

function toHtml(expression) {
    return new VisitorHtml().toHtml(expression)
}

module.exports = { toHtml }
