class Expression {
    fullBetaReduce() {
        var lastExpression = undefined
        var currentExpression = this

        do {
            lastExpression = currentExpression
            currentExpression = currentExpression.betaReduced()
        } while (!lastExpression.equals(currentExpression))

        return currentExpression
    }

    betaReduced() {
        throw 'subclass responsibility'
    }

    equals(other) {
        throw 'subclass responsibility'
    }

    freeVariables() {
        throw 'subclass responsibility'
    }

    replaceFreeVariable(oldVariable, newValue) {
        throw 'subclass responsibility'
    }

    applyTo(argument) {
        throw 'subclass responsibility'
    }

    toString() {
        throw 'subclass responsibility'
    }

    toHtml() {
        throw 'subclass responsibility'
    }
}

class Hole extends Expression{
    initialize() {
        this.value = null
    }

    isEmpty() {
        return this.value == null
    }

    betaReduced() {
        if (this.isEmpty())
            return this
        else
            return this.value.betaReduced()
    }

    equals(other) {
        if (this.isEmpty())
            return other === this
        else
            return this.value.equals(other)
    }

    freeVariables() {
        if (this.isEmpty())
            return []
        else
            return this.value.freeVariables()
    }

    replaceFreeVariable(oldVariable, newValue) {
        if (this.isEmpty())
            return this
        else
            return this.value.replaceFreeVariable(oldVariable, newValue)
    }

    applyTo(argument) {
        if (this.isEmpty())
            return new Application(this, argument)
        else
            return this.value.applyTo(argument)
    }

    toString() {
        if (this.isEmpty())
            return '_'
        else
            return this.value.toString()
    }

    toHtml() {
        if (this.isEmpty()) {
            let element = htmlToElement(`<span class="hole">
                <span class="actions hidden">
                    <span class="insert-variable"></span>
                    <span class="insert-abstraction"></span>
                    <span class="insert-application"></span>
                </span>
            </span>`)
            element.astNode = this
            return element
        } else {
            return this.value.toHtml()
        }
    }
}

class Variable extends Expression {
    constructor(name) {
        super()
        this.name = name
    }

    betaReduced() {
        return this
    }

    equals(anotherVariable) {
        return anotherVariable instanceof Variable &&
            this.name === anotherVariable.name
    }

    replaceFreeVariable(oldVariable, newValue) {
        if (this.name === oldVariable.name) {
            return newValue
        } else {
            return this
        }
    }

    applyTo(argument) {
        return new Application(this, argument)
    }

    freeVariables() {
        return [this]
    }

    toString() {
        return this.name
    }

    toHtml() {
        let element = htmlToElement(`<span class="variable">${this.name}</span>`)
        element.astNode = this
        return element
    }
}

class Abstraction extends Expression {
    constructor(boundVariable, body) {
        super()
        this.boundVariable = boundVariable
        this.body = body
    }

    betaReduced() {
        return this
    }

    applyTo(argument) {
        return this.body.replaceFreeVariable(this.boundVariable, argument)
    }

    replaceFreeVariable(oldVariable, newValue) {
        if (oldVariable.equals(this.boundVariable)) {
            return this
        } else if (includes(newValue.freeVariables(), this.boundVariable)) {
            return this.alphaConvertNotToHave(newValue.freeVariables()).replaceFreeVariable(oldVariable, newValue);
        } else {
            return new Abstraction(this.boundVariable, this.body.replaceFreeVariable(oldVariable, newValue))
        }
    }

    alphaConvertNotToHave(notWantedVariables) {
        let allVariables = 'abcdefghijklmnopqrstuvwxyz'.split('')//.map(v => variable('_' + v));
        let newVariableName = allVariables.find(v => !includes(notWantedVariables, v));
        return this.alphaConvert(newVariableName);
    }

    alphaConvert(newVariableName) {
        let newVariable = variable(newVariableName);
        if (includes(this.body.freeVariables(), newVariable)) throw "The variable " + newVariableName + " is free in the body"
        return new Abstraction(newVariable, this.body.replaceFreeVariable(this.boundVariable, newVariable))
    }

    equals(anotherAbstraction) {
        // TODO: Cambiar esto!
        return anotherAbstraction instanceof Abstraction &&
            this.boundVariable.equals(anotherAbstraction.boundVariable) &&
            this.body.equals(anotherAbstraction.body)
    }

    freeVariables() {
        return this.body.freeVariables().
            filter(v => !v.equals(this.boundVariable))
    }

    toString() {
        return `(λ${this.boundVariable.toString()}.${this.body.toString()})`
    }

    toHtml() {
        let parameterElement = htmlToElement(`<span class="parameter"></span>`)
        parameterElement.appendChild(this.boundVariable.toHtml())

        let bodyElement = htmlToElement(`<span class="body"></span>`)
        bodyElement.appendChild(this.body.toHtml())

        let abstractionElement = htmlToElement(`<span class="abstraction"></span>`)
        abstractionElement.appendChild(parameterElement)
        abstractionElement.appendChild(bodyElement)
        abstractionElement.astNode = this

        return abstractionElement
    }
}

function includes(list, value) {
    return list.some(v => v.equals(value))
}

class Application extends Expression {
    constructor(abstraction, argument) {
        super()
        this.abstraction = abstraction
        this.argument = argument
    }

    betaReduced() {
        return this.abstraction.applyTo(this.argument)
    }

    applyTo(argument) {
        return new Application(this.betaReduced(), argument)
    }

    replaceFreeVariable(oldVariable, newValue) {
        return new Application(
            this.abstraction.replaceFreeVariable(oldVariable, newValue),
            this.argument.replaceFreeVariable(oldVariable, newValue)
        )
    }

    equals(anotherApplication) {
        return anotherApplication instanceof Application &&
            this.abstraction.equals(anotherApplication.abstraction) &&
            this.argument.equals(anotherApplication.argument)
    }

    freeVariables() {
        return [...new Set([...this.abstraction.freeVariables(), ...this.argument.freeVariables()])]
    }

    toString() {
        return `(${this.abstraction.toString()} ${this.argument.toString()})`
    }

    toHtml() {
        let functionElement = htmlToElement(`<span class="function"></span>`)
        functionElement.appendChild(this.abstraction.toHtml())

        let argumentElement = htmlToElement(`<span class="argument"></span>`)
        argumentElement.appendChild(this.argument.toHtml())

        let applicationElement = htmlToElement(`<span class="application"></span>`)
        applicationElement.appendChild(functionElement)
        applicationElement.appendChild(argumentElement)
        applicationElement.astNode = this

        return applicationElement
    }
}

function variable(name) {
    return new Variable(name)
}

function lambda(variableName, body) {
    return new Abstraction(variable(variableName), body)
}

function application(abstraction, argument) {
    return new Application(abstraction, argument)
}

function apply(abstraction, argument) {
    return application(abstraction, argument).betaReduced()
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

if (typeof module !== 'undefined') {
    module.exports = { Variable, Abstraction, Application, Hole, variable, application, lambda, apply }
}
