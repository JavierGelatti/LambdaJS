import { ast } from "f-calculus";

const { identifier, application, lambda, hole } = ast;

export class VisitorToAddActions {
    constructor(options) {
        this.options = options
        this.holeActions = this.activeActionsFrom({
            insertVariable(selectedHole, expression) {
                const newVariable = identifier("")
                newVariable.beingEdited = true
                return {
                    expression: expression.replace(selectedHole, newVariable),
                    selection: newVariable,
                }
            },
            insertAbstraction(selectedHole, expression) {
                const newVariable = identifier("")
                newVariable.beingEdited = true
                return {
                    expression: expression.replace(selectedHole, lambda(newVariable, hole())),
                    selection: newVariable,
                }
            },
            insertApplication(selectedHole, expression) {
                const abstractionHole = hole()
                return {
                    expression: expression.replace(selectedHole, application(abstractionHole, hole())),
                    selection: abstractionHole,
                }
            }
        })
        this.commonActions = this.activeActionsFrom({
            delete(node, expression) {
                const newHole = hole()
                return {
                    expression: expression.replace(node, newHole),
                    selection: newHole,
                }
            },
            wrapLambda(node, expression) {
                const newVariable = identifier("")
                newVariable.beingEdited = true
                return {
                    expression: expression.replace(node, lambda(newVariable, node)),
                    selection: newVariable,
                }
            },
            wrapApplicationArgument(node, expression) {
                const newHole = hole()
                return {
                    expression: expression.replace(node, application(newHole, node)),
                    selection: newHole,
                }
            },
            wrapApplicationFunction(node, expression) {
                const newHole = hole()
                return {
                    expression: expression.replace(node, application(node, newHole)),
                    selection: newHole,
                }
            },
        })
    }

    activeActionsFrom(someActions) {
        return Object.fromEntries(
            Object.entries(someActions)
                .filter(([key, _]) => this.options[key])
        )
    }

    allActionsFor(expression) {
        this.actions = new Map()

        expression.accept(this)

        return this.actions
    }

    registerActionsFor(expression, actions) {
        this.actions.set(expression, actions)
    }

    visitLambda(abstraction) {
        this.actions = new Map([
            ...this.actions,
            ...new VisitorToAddActionsForParameters(this.options).allActionsFor(abstraction.boundVariable)
        ])
        abstraction.body.accept(this)

        this.registerActionsFor(abstraction, this.commonActions)

        return abstraction
    }

    visitApplication(application) {
        application.abstraction.accept(this)
        application.argument.accept(this)

        this.registerActionsFor(application, this.commonActions)

        return application
    }

    visitHole(holeElement) {
        this.registerActionsFor(holeElement, this.holeActions)

        return holeElement
    }

    visitVariable(variable) {
        return variable.beingEdited ? this.visitVariableToBeDefined(variable) : this.visitDefinedVariable(variable)
    }

    visitDefinedVariable(variable) {
        this.registerActionsFor(variable, this.commonActions)

        return variable
    }

    visitVariableToBeDefined(variable) {
        return variable
    }
}

class VisitorToAddActionsForParameters extends VisitorToAddActions {
    constructor(options) {
        super(options)
        this.commonActions = {}
    }
}
