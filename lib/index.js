'use strict'

require('co-mocha') // make sure it's registered for the generated tests
const urlParse = require('url').parse
const SwaggerParser = require('swagger-parser')
const SwaggerRequestTest = require('./request-test')

class Tester {
  constructor(swaggerUrl, baseHeaders) {
    const url = urlParse(swaggerUrl)
    this.baseUrl = `${url.protocol}//${(url.auth ? (`${url.auth}@`) : '')}${url.host}`

    this.baseHeaders = baseHeaders || {}
    this.swagger = SwaggerParser.parse(swaggerUrl) // NOTE: this.swagger is a promise
  }

  post(path, body, headers) {
    return this.request('POST', path, body, headers)
  }

  put(path, body, headers) {
    return this.request('PUT', path, body, headers)
  }

  get(path, headers) {
    return this.request('GET', path, null, headers)
  }

  del(path, body, headers) {
    return this.request('DELETE', path, body, headers)
  }

  request(method, path, body, headers) {
    return new SwaggerRequestTest(this, method, path, body, headers)
  }
}

module.exports = Tester
