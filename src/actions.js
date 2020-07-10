const { ast: { identifier, application, lambda, hole } } = require('f-calculus')

class VisitorToAddActions {
    constructor(options) {
        this.options = options
    }

    commonActions() {
        return {
            'delete': (node, expression) => {
                const newHole = hole()
                return {
                    expression: expression.replace(node, newHole),
                    selection: newHole,
                }
            },
            'wrap-lambda': (node, expression) => {
                const newVariable = hole()
                return {
                    expression: expression.replace(node, lambda(newVariable, node)),
                    selection: newVariable,
                }
            },
            'wrap-application-argument': (node, expression) => {
                const newHole = hole()
                return {
                    expression: expression.replace(node, application(newHole, node)),
                    selection: newHole,
                }
            },
            'wrap-application-function': (node, expression) => {
                const newHole = hole()
                return {
                    expression: expression.replace(node, application(node, newHole)),
                    selection: newHole,
                }
            },
        }
    }

    addActionsTo(expression) {
        return expression.accept(this)
    }

    visitLambda(abstraction) {
        new VisitorToAddActionsForParameters(this.options).addActionsTo(abstraction.boundVariable)
        this.addActionsTo(abstraction.body)

        abstraction.actions = this.commonActions()

        return abstraction
    }

    visitApplication(application) {
        this.addActionsTo(application.abstraction)
        this.addActionsTo(application.argument)

        application.actions = this.commonActions()

        return application
    }

    visitHole(holeElement) {
        const actions = {
            ...this.options.insertVariable && {
                'insert-variable': (selectedHole, expression) => {
                    const newVariable = identifier("")
                    newVariable.beingEdited = true
                    return {
                        expression: expression.replace(selectedHole, newVariable),
                        selection: newVariable,
                    }
                }
            },
            ...this.options.insertAbstraction && {
                'insert-abstraction': (selectedHole, expression) => {
                    const newVariable = identifier("")
                    newVariable.beingEdited = true
                    return {
                        expression: expression.replace(selectedHole, lambda(newVariable, hole())),
                        selection: newVariable,
                    }
                }
            },
            ...this.options.insertApplication && {
                'insert-application': (selectedHole, expression) => {
                    const abstractionHole = hole()
                    return {
                        expression: expression.replace(selectedHole, application(abstractionHole, hole())),
                        selection: abstractionHole,
                    }
                }
            }
        }

        holeElement.actions = actions

        return holeElement
    }

    visitVariable(variable) {
        return variable.beingEdited ? this.visitVariableToBeDefined(variable) : this.visitDefinedVariable(variable)
    }

    visitDefinedVariable(variable) {
        variable.actions = this.commonActions()

        return variable
    }

    visitVariableToBeDefined(variable) {
        return variable
    }
}

class VisitorToAddActionsForParameters extends VisitorToAddActions {
    commonActions() {
        return {}
    }
}

module.exports = { VisitorToAddActions }