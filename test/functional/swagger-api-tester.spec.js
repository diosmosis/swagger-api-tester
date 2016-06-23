'use strict'

const fs = require('fs')
const path = require('path')
const expect = require('chai').expect
const execSync = require('child_process').execSync

const PETSTORE_TEST_PATH = path.join(__dirname, 'example', 'petstore.test.js')
const TEST_COMMAND = `mocha --no-colors ${PETSTORE_TEST_PATH} 2>&1`

describe('swagger-api-tester', function () {
  it('should generate mocha test cases correctly', function () {
    const expectedResult = fs.readFileSync(path.join(__dirname, 'expected.out')).toString('UTF-8')
    const env = Object.assign({}, process.env, { DEBUG: true })

    let result
    try {
      result = execSync(TEST_COMMAND, { env })
    } catch (err) {
      result = err.stdout
    }

    result = result.toString('UTF-8')
    result = normalizeOutput(result)

    fs.writeFileSync(path.join(__dirname, 'processed.out'), result)

    expect(result).to.equal(expectedResult)
  })
})

function normalizeOutput(output) {
  let result = output
  result = result.replace(/\([0-9]+m?s\)/g, '')
  result = result.replace(/\n\n\n+/g, '\n\n')
  result = result.replace(/^\s+$/gm, '')
  result = result.replace(/([^\s])[ \t]+$/gm, '$1')
  return result
}
