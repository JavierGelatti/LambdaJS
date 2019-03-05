const {endOfInput, parse, digit, letter, char, choice, recursiveParser, sequenceOf, many1, mapTo, pipeParsers, sepBy1} = require('arcsecond')
const { Variable, Abstraction, Application, Hole } = require('./ast')

const expressionParser = recursiveParser(() => pipeParsers([
    choice([applicationParser, lambdaParser, variableParser, parenthesesParser, holeParser])
]))

const variableParser = pipeParsers([
    many1(choice([digit, letter])),
    mapTo(x => new Variable(x.join('')))
])

const lambdaParser = pipeParsers([
    sequenceOf([
        char('λ'),
        variableParser,
        char('.'),
        expressionParser,
    ]),
    mapTo(([lambda, variable, dot, body]) => new Abstraction(variable, body))
])

const holeParser = pipeParsers([
    char('_'),
    mapTo((underscore) => new Hole())
])

const parenthesesParser = pipeParsers([
    sequenceOf([
        char('('),
        expressionParser,
        char(')'),
    ]),
    mapTo(([openParen, expression, closingParen]) => expression)
])

const applicationParser = pipeParsers([
    sequenceOf([
        choice([lambdaParser, variableParser, parenthesesParser, holeParser]),
        char(" "),
        sepBy1 (char(" ")) (choice([lambdaParser, variableParser, parenthesesParser, holeParser]))
    ]),
    mapTo(([abstraction, space, args]) => {
        const applications = [abstraction, ...args]
        return applications.reduce((previousApplication, currentArgument) => new Application(previousApplication, currentArgument))
    })
])

function parseExpression(text) {
    const completeExpression = pipeParsers([
        sequenceOf([
            expressionParser,
            endOfInput
        ]),
        mapTo(x => x[0])
    ])

    return parse(completeExpression)(text).value
}

module.exports = { parseExpression }
