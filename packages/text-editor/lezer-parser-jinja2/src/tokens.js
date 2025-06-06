import { ExternalTokenizer } from '@lezer/lr'
import {
  RawText,
  stringContentSingleQuote,
  stringEndSingleQuote,
  stringContentDoubleQuote,
  stringEndDoubleQuote,
  JinjaExpressionEnd,
  JinjaStatementEnd,
  JinjaCommentEnd,
  JinjaText,
} from './index.terms'

// scan to {% endraw %}
const sequence = [ '{%', 'endraw', '%}' ]
const tokenizeRawText = new ExternalTokenizer((input) => {
  const first = sequence[0].charCodeAt(0)
  let len = 0
  let foundSequence = false

  while (true) {
    if (input.next < 0) {
      break
    }

    if (input.next === first) {
      let n = 0
      let index = 0
      for (; index < sequence.length; index++) {
        const segment = sequence[index]
        if (match(input, n, segment)) {
          n = n + segment.length
          if (index < sequence.length - 1) {
            const spaceLen = skipSpaces(input, n)
            n = n + spaceLen
          }
        } else {
          break
        }
      }

      // all match
      if (index === sequence.length) {
        foundSequence = true
        break
      } else {
        input.advance()
        len++
      }
    } else {
      input.advance()
      len++
    }
  }

  // not found at end
  if (!foundSequence && input.next < 0) {
    return
  }

  if (len > 0) {
    input.acceptToken(RawText)
  }
})

function match(input, from, text) {
  let i = 0
  let len = 0

  while (true) {
    if (input.peek(from + i) === text.charCodeAt(i) && len < text.length) {
      i++
      len++
    } else {
      break
    }
  }

  return len === text.length
}

const spaceReg = /^\s+$/
function skipSpaces(input, from) {
  let i = from
  let len = 0

  while (true) {
    const char = String.fromCharCode(input.peek(i))
    if (spaceReg.test(char)) {
      i++
      len++
    } else {
      break
    }
  }

  return len
}

const singleQuote = 39
const doubleQuote = 34
const tokenizeSingleQuoteString = scanString(singleQuote)
const tokenizeDoubleQuoteString = scanString(doubleQuote)

function scanString(quote) {
  const endToken = quote === singleQuote ?
    stringEndSingleQuote :
    stringEndDoubleQuote
  const contentToken = quote === singleQuote ?
    stringContentSingleQuote :
    stringContentDoubleQuote

  return new ExternalTokenizer((input) => {
    let len = 0
    while (true) {
      if (input.next < 0) {
        break;
      }
    
      if (
        // \\
        (input.next === 92 && input.peek(1) === 92) ||
        // \"
        (input.next === 92 && input.peek(1) === quote)
      ) {
        input.advance(2)
        len += 2
        continue
      }

      if (
        (input.next === quote) ||
        // % }
        (input.next === 37 && input.peek(1) === 125) ||
        // \n | \r
        (input.next === 10 || input.next === 13)
      ) {
        break
      }

      len++
      input.advance()
    }

    if (len > 0) {
      input.acceptToken(contentToken)
    }

    if (input.next === quote) {
      input.advance()
    }

    input.acceptToken(endToken)
  })
}

// {
const leftBracket = 123
// }
const rightBracket = 125
// #
const hash = 35
// %
const percent = 37
const minus = 45
const plus = 43

const tokenizeExpression = new ExternalTokenizer((input) => {
  if (input.next === minus || input.next === plus) {
    // skip spaces between -+ and }}
    const n = skipSpaces(input, 1)

    if (
      input.peek(n + 1) === rightBracket &&
      input.peek(n + 2) === rightBracket
    ) {
      input.advance(n + 3)
      input.acceptToken(JinjaExpressionEnd)
      return
    }
  }

  if (
    input.next === rightBracket && input.peek(1) === rightBracket
  ) {
    input.advance(2)
    input.acceptToken(JinjaExpressionEnd)
    return
  }

  if (input.next === leftBracket && input.peek(1) === hash) {
    input.acceptToken(JinjaExpressionEnd)
    return
  }

  if (input.next < 0) {
    input.acceptToken(JinjaExpressionEnd)
    return
  }
})

// function debug(input) {
//   console.log(
//     'next',
//     [
//       String.fromCharCode(input.peek(0)),
//       String.fromCharCode(input.peek(1)),
//       String.fromCharCode(input.peek(2)),
//       String.fromCharCode(input.peek(3)),
//       String.fromCharCode(input.peek(4)),
//       String.fromCharCode(input.peek(5)),
//     ]
//   )
// }

const tokenizeStatement = new ExternalTokenizer(input => {
  if (input.next === minus || input.next === plus) {
    // skip spaces between -+ and }}
    const n = skipSpaces(input, 1)

    if (
      input.peek(n + 1) === percent &&
      input.peek(n + 2) === rightBracket
    ) {
      input.advance(n + 3)
      input.acceptToken(JinjaStatementEnd)
      return
    }
  }

  if (
    input.next === percent &&
    input.peek(1) === rightBracket
  ) {
    input.advance(2)
    input.acceptToken(JinjaStatementEnd)
    return
  }

  if (input.next === leftBracket && input.peek(1) === hash) {
    input.acceptToken(JinjaStatementEnd)
    return
  }

  if (input.next < 0) {
    input.acceptToken(JinjaStatementEnd)
    return
  }
})

const tokenizeComment = new ExternalTokenizer(input => {
  if (
    input.next === hash &&
    input.peek(1) === rightBracket
  ) {
    input.advance(2)
    input.acceptToken(JinjaCommentEnd)
  } else if (
    input.next === leftBracket &&
    input.peek(1) === hash
  ) {
    input.acceptToken(JinjaCommentEnd)
  }
})

const tokenizeText = new ExternalTokenizer(input => {
  let offset = 0
  let len = 0

  while (true) {
    const next = input.peek(offset)

    // eof
    if (next < 0) {
      break
    }

    // ![{]
    if (next !== leftBracket) {
      offset++
      len++
    } else if (
      // { ![{#%]
      next === leftBracket &&
      input.peek(offset + 1) !== leftBracket &&
      input.peek(offset + 1) !== hash &&
      input.peek(offset + 1) !== percent
    ) {
      offset++
      len++
    } else if (
      // {{#
      next === leftBracket &&
      input.peek(offset + 1) === leftBracket &&
      (
        input.peek(offset + 2) === leftBracket ||
        input.peek(offset + 2) === hash ||
        input.peek(offset + 2) === percent
      )
    ) {
      offset++
      len++
    } else {
      break
    }
  }

  if (len > 0) {
    input.advance(len)
    input.acceptToken(JinjaText)
  }
})

export {
  tokenizeRawText,
  tokenizeSingleQuoteString,
  tokenizeDoubleQuoteString,
  tokenizeExpression,
  tokenizeStatement,
  tokenizeComment,
  tokenizeText,
}