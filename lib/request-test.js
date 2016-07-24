'use strict'

const request = require('request-promise')
const Validator = require('swagger-model-validator')
const expect = require('chai').expect

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' }

const isDebug = !! process.env.DEBUG

class RequestTest {
  constructor(swaggerSpec, method, path, body, headers) {
    this.swaggerSpec = swaggerSpec
    this.method = method
    this.path = path
    this.body = body || null
    this.headers = headers || {}
  }

  respondsWith(statusCode, modelNameToValidate) {
    return this.execSwaggerTest(statusCode, modelNameToValidate)
  }

  *execSwaggerTest(statusCode, modelNameToValidate) {
    const swagger = yield this.swaggerSpec.contents()
    const baseUrl = yield this.swaggerSpec.baseUrl()
    const uriToTest = baseUrl + (swagger.basePath || '') + this.path
    const responseMeta = getSwaggerResponse(swagger, this.path, this.method, statusCode)

    const headers = Object.assign(
      DEFAULT_HEADERS, this.swaggerSpec.defaultHeaders || {}, this.headers || {})

    const requestOptions = {
      method: this.method,
      uri: uriToTest,
      headers,
      simple: false,
      resolveWithFullResponse: true,
      json: true,
    }

    if (this.body) {
      requestOptions.body = this.body
    }

    const response = yield request(requestOptions)

    if (isDebug) {
      console.log(`${this.method} ${uriToTest} returned ${JSON.stringify(response.body)}`)
    }

    expect(response.statusCode).to.equal(statusCode)

    let schema
    if (modelNameToValidate) {
      schema = swagger.definitions[modelNameToValidate]
    } else {
      schema = (responseMeta || {}).schema
    }

    if (!schema) {
      return response.body
    }

    if (isDebug) {
      console.log('Validating against model.')
    }

    const allowBlankTarget = false
    const disallowExtraProperties = true

    const validator = new Validator(swagger)
    const validation = validator.validate(response.body, schema, swagger.definitions,
      allowBlankTarget, disallowExtraProperties)

    expect(validation.errors || []).to.deep.equal([])

    return response.body
  }
}

function getSwaggerResponse(swagger, urlPath, method, statusCode) {
  let path = urlPath

  const position = urlPath.indexOf('?')
  if (position !== -1) {
    path = urlPath.substring(0, position)
  }

  const pathKey = Object.keys(swagger.paths).find(pathMatchesSwaggerKey.bind(null, path))
  if (!pathKey) {
    throw new Error(`Path ${path} cannot be found in the swagger spec.`)
  }

  const pathInfo = swagger.paths[pathKey]

  const routeInfo = pathInfo[method.toLowerCase()]
  if (!routeInfo) {
    throw new Error(`Route ${method} ${path} cannot be found in the swagger spec.`)
  }

  return routeInfo.responses[statusCode]
}

function pathMatchesSwaggerKey(actualPath, pathKey) {
  const actualPathSegments = actualPath.split('/')
  const pathKeySegments = pathKey.split('/')

  if (actualPathSegments.length !== pathKeySegments.length) {
    return false
  }

  for (let i = 0; i !== actualPathSegments.length; ++i) {
    if (/\{.*\}/.test(pathKeySegments[i])) {
      continue
    }

    if (actualPathSegments[i] !== pathKeySegments[i]) {
      return false
    }
  }

  return true
}

module.exports = RequestTest
