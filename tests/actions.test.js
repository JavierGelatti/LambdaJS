import { describe, expect, it } from "vitest";
import { ActionCollector } from "../src/actions";

import { ast } from "f-calculus";
const { identifier, application, lambda, hole } = ast;

describe('actions', () => {
    describe('delete', () => {
        it('replaces subexpression with hole', () => {
            const targetExpression = identifier("y")
            const expression = lambda(identifier("x"), targetExpression)

            expect(runAction('delete', { on: targetExpression, inContextOf: expression }))
                .toEqual({
                    expression: lambda(identifier("x"), hole()),
                    selection: hole()
                })
        })

        it('is not available for variables at lambda binding point', () => {
            const targetExpression = identifier("y")
            const expression = lambda(targetExpression, identifier("x"))

            expect(actionsFor(targetExpression, { inContextOf: expression }))
                .not.toHaveProperty('delete')
        })

        it('is not available if it is not in the options', () => {
            const targetExpression = identifier("y")
            const expression = lambda(identifier("x"), targetExpression)

            expect(actionsFor(targetExpression, { inContextOf: expression, withOptions: { ...defaultOptions, delete: false } }))
                .not.toHaveProperty('delete')
        })
    })

    describe('wrap with lambda', () => {
        it('wraps a subexpression with a lambda', () => {
            const targetExpression = identifier("y")
            const expression = lambda(identifier("x"), targetExpression)

            expect(runAction('wrapLambda', { on: targetExpression, inContextOf: expression }))
                .toEqual({
                    expression: lambda(identifier("x"), lambda(identifierBeingEdited(), identifier("y"))),
                    selection: identifierBeingEdited()
                })
        })

        it('is not available for variables at lambda binding point', () => {
            const targetExpression = identifier("y")
            const expression = lambda(targetExpression, identifier("x"))

            expect(actionsFor(targetExpression, { inContextOf: expression }))
                .not.toHaveProperty('wrapLambda')
        })

        it('is not available if it is not in the options', () => {
            const targetExpression = identifier("y")
            const expression = lambda(identifier("x"), targetExpression)

            expect(actionsFor(targetExpression, { inContextOf: expression, withOptions: { ...defaultOptions, wrapLambda: false } }))
                .not.toHaveProperty('wrapLambda')
        })
    })

    describe('apply to', () => {
        it('applies a subexpression to a hole', () => {
            const targetExpression = identifier("x")
            const expression = lambda(identifier("x"), targetExpression)

            expect(runAction('wrapApplicationFunction', { on: targetExpression, inContextOf: expression }))
                .toEqual({
                    expression: lambda(identifier("x"), application(identifier("x"), hole())),
                    selection: hole()
                })
        })

        it('is not available for variables at lambda binding point', () => {
            const targetExpression = identifier("y")
            const expression = lambda(targetExpression, identifier("x"))

            expect(actionsFor(targetExpression, { inContextOf: expression }))
                .not.toHaveProperty('wrapApplicationFunction')
        })

        it('is not available if it is not in the options', () => {
            const targetExpression = identifier("y")
            const expression = lambda(identifier("x"), targetExpression)

            expect(actionsFor(targetExpression, { inContextOf: expression, withOptions: { ...defaultOptions, wrapApplicationFunction: false } }))
                .not.toHaveProperty('wrapApplicationFunction')
        })
    })

    describe('be applied to', () => {
        it('converts a subexpression to a hole argument', () => {
            const targetExpression = identifier("x")
            const expression = lambda(identifier("x"), targetExpression)

            expect(runAction('wrapApplicationArgument', { on: targetExpression, inContextOf: expression }))
                .toEqual({
                    expression: lambda(identifier("x"), application(hole(), identifier("x"))),
                    selection: hole()
                })
        })

        it('is not available for variables at lambda binding point', () => {
            const targetExpression = identifier("y")
            const expression = lambda(targetExpression, identifier("x"))

            expect(actionsFor(targetExpression, { inContextOf: expression }))
                .not.toHaveProperty('wrapApplicationArgument')
        })

        it('is not available if it is not in the options', () => {
            const targetExpression = identifier("y")
            const expression = lambda(identifier("x"), targetExpression)

            expect(actionsFor(targetExpression, { inContextOf: expression, withOptions: { ...defaultOptions, wrapApplicationArgument: false } }))
                .not.toHaveProperty('wrapApplicationArgument')
        })
    })

    describe('insert variable', () => {
        it('converts a hole into a variable', () => {
            const targetExpression = hole()
            const expression = lambda(identifier("x"), targetExpression)

            expect(runAction('insertVariable', { on: targetExpression, inContextOf: expression }))
                .toEqual({
                    expression: lambda(identifier("x"), identifierBeingEdited()),
                    selection: identifierBeingEdited()
                })
        })

        it('is only available for holes', () => {
            const targetExpression = identifier("y")
            const expression = lambda(targetExpression, identifier("x"))

            expect(actionsFor(targetExpression, { inContextOf: expression }))
                .not.toHaveProperty('insertVariable')
        })

        it('is not available if it is not in the options', () => {
            const targetExpression = hole()
            const expression = lambda(identifier("x"), targetExpression)

            expect(actionsFor(targetExpression, { inContextOf: expression, withOptions: { ...defaultOptions, insertVariable: false } }))
                .not.toHaveProperty('insertVariable')
        })
    })

    describe('insert abstraction', () => {
        it('converts a hole into a lambda', () => {
            const targetExpression = hole()
            const expression = lambda(identifier("x"), targetExpression)

            expect(runAction('insertAbstraction', { on: targetExpression, inContextOf: expression }))
                .toEqual({
                    expression: lambda(identifier("x"), lambda(identifierBeingEdited(), hole())),
                    selection: identifierBeingEdited()
                })
        })

        it('is only available for holes', () => {
            const targetExpression = identifier("y")
            const expression = lambda(targetExpression, identifier("x"))

            expect(actionsFor(targetExpression, { inContextOf: expression }))
                .not.toHaveProperty('insertAbstraction')
        })

        it('is not available if it is not in the options', () => {
            const targetExpression = hole()
            const expression = lambda(identifier("x"), targetExpression)

            expect(actionsFor(targetExpression, { inContextOf: expression, withOptions: { ...defaultOptions, insertAbstraction: false } }))
                .not.toHaveProperty('insertAbstraction')
        })
    })

    describe('insert application', () => {
        it('converts a hole into an application', () => {
            const targetExpression = hole()
            const expression = lambda(identifier("x"), targetExpression)

            expect(runAction('insertApplication', { on: targetExpression, inContextOf: expression }))
                .toEqual({
                    expression: lambda(identifier("x"), application(hole(), hole())),
                    selection: hole()
                })
        })

        it('is only available for holes', () => {
            const targetExpression = identifier("y")
            const expression = lambda(targetExpression, identifier("x"))

            expect(actionsFor(targetExpression, { inContextOf: expression }))
                .not.toHaveProperty('insertApplication')
        })

        it('is not available if it is not in the options', () => {
            const targetExpression = hole()
            const expression = lambda(identifier("x"), targetExpression)

            expect(actionsFor(targetExpression, { inContextOf: expression, withOptions: { ...defaultOptions, insertApplication: false } }))
                .not.toHaveProperty('insertApplication')
        })
    })

    describe('rename', () => {
        it('renames the lambda parameter', () => {
            const targetExpression = identifier("x")
            const expression = lambda(targetExpression, identifier("y"))

            expect(rename("z", targetExpression, expression))
                .toEqual({
                    expression: lambda(identifier("z"), identifier("y")),
                    selection: identifier("z")
                })
        })

        it('renames the free ocurrences of the identifier in the lambda body', () => {
            const targetExpression = identifier("x")
            const expression = lambda(targetExpression, identifier("x"))

            expect(rename("z", targetExpression, expression))
                .toEqual({
                    expression: lambda(identifier("z"), identifier("z")),
                    selection: identifier("z")
                })
        })

        it('does not rename the bound ocurrences of the identifier in the lambda body', () => {
            const targetExpression = identifier("x")
            const expression = lambda(targetExpression, lambda(identifier("x"), identifier("x")))

            expect(rename("z", targetExpression, expression))
                .toEqual({
                    expression: lambda(identifier("z"), lambda(identifier("x"), identifier("x"))),
                    selection: identifier("z")
                })
        })

        it('does not rename the ocurrences of the identifier outside the lambda body', () => {
            const targetExpression = identifier("x")
            const expression = lambda(identifier("x"), lambda(targetExpression, identifier("y")))

            expect(rename("z", targetExpression, expression))
                .toEqual({
                    expression: lambda(identifier("x"), lambda(identifier("z"), identifier("y"))),
                    selection: identifier("z")
                })
        })

        function renameActionFor(targetIdentifier, expression) {
            const result = runAction('rename', { on: targetIdentifier, inContextOf: expression })

            return result.selection.whenEditingFinishes
        }

        function rename(newName, targetIdentifier, expression) {
            return renameActionFor(targetIdentifier, expression)(newName)(targetIdentifier, expression)
        }
    })

    function identifierBeingEdited(name = "") {
        const anIdentifier = identifier(name)
        anIdentifier.beingEdited = true
        return anIdentifier
    }


    function runAction(actionName, { on: subexpression, inContextOf: topLevelExpression }) {
        const actions = actionsFor(subexpression, { inContextOf: topLevelExpression })
        return actions[actionName](subexpression, topLevelExpression)
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

    function actionsFor(subexpression, { inContextOf: expression, withOptions: options = defaultOptions }) {
        const actions = new ActionCollector(options).allActionsFor(expression)

        return actions.get(subexpression)
    }
})