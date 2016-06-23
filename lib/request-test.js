'use strict'

const request = require('request-promise')
const Validator = require('swagger-model-validator')
const expect = require('chai').expect

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' }

const isDebug = !! process.env.DEBUG

class SwaggerRequestTest {
  constructor(tester, method, path, body, headers) {
    this.tester = tester
    this.method = method
    this.path = path
    this.body = body || null
    this.headers = headers || {}
  }

  respondsWith(statusCode, modelNameToValidate) {
    this.createMochaTest(statusCode, modelNameToValidate)
  }

  createMochaTest(statusCode, modelNameToValidate) {
    const self = this
    it(`should respond to ${this.method} ${this.path} correctly`, function * () {
      const swagger = yield self.tester.swagger
      const uriToTest = self.tester.baseUrl + (swagger.basePath || '') + self.path
      const responseMeta = getSwaggerResponse(swagger, self.path, self.method, statusCode)

      const response = yield request({
        method: self.method,
        uri: uriToTest,
        headers: Object.assign(DEFAULT_HEADERS, self.tester.baseHeaders || {}, self.headers || {}),
        body: self.body,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
      })

      if (isDebug) {
        console.log(`${self.method} ${uriToTest} returned ${JSON.stringify(response.body)}`)
      }

      expect(response.statusCode).to.equal(statusCode)

      let scheme
      if (modelNameToValidate) {
        scheme = swagger.definitions[modelNameToValidate]
      } else {
        scheme = (responseMeta || {}).scheme
      }

      if (!scheme) {
        return
      }

      const allowBlankTarget = false
      const disallowExtraProperties = true

      const validator = new Validator(swagger)
      const validation = validator.validate(response.body, scheme, swagger.definitions,
        allowBlankTarget, disallowExtraProperties)

      expect(validation.errors || []).to.deep.equal([])
    })
  }
}

function getSwaggerResponse(swagger, path, method, statusCode) {
  const pathInfo = swagger.paths[path]
  if (!pathInfo) {
    throw new Error(`Path ${path} cannot be found in the swagger spec.`)
  }

  const routeInfo = pathInfo[method.toLowerCase()]
  if (!routeInfo) {
    throw new Error(`Route ${method} ${path} cannot be found in the swagger spec.`)
  }

  return routeInfo.responses[statusCode]
}

module.exports = SwaggerRequestTest
