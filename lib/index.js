'use strict'

require('co-mocha') // make sure it's registered for the generated tests
const urlParse = require('url').parse
const isValidUri = require('valid-url').isUri
const SwaggerParser = require('swagger-parser')
const SwaggerRequestTest = require('./request-test')

const BASE_URL_HELP = 'couldn\'t construct a correct looking base URL for this API' +
' using the swagger file contents or the URL to the swagger file. You can specify the' +
' base URL explicitly like so:\n' +
`
const tester = new Tester('./path/to/swagger.yml', { baseUrl: 'http://myhost.com' })
`

class Tester {
  constructor(swaggerUrl, options) {
    const baseUrl = (options || {}).baseUrl
    const baseHeaders = (options || {}).baseHeaders

    this.swaggerUrl = swaggerUrl
    this.baseHeaders = baseHeaders || {}
    this.cachedBaseUrl = baseUrl
    this.swagger = SwaggerParser.parse(swaggerUrl) // NOTE: this.swagger is a promise
  }

  baseUrl() {
    if (this.cachedBaseUrl) {
      return Promise.resolve(this.cachedBaseUrl)
    }

    return this.swagger.then((swaggerContents) => {
      let swaggerContentsUrl
      if (swaggerContents.host) {
        const scheme = (swaggerContents.schemes || [])[0] || 'http'
        swaggerContentsUrl = `${scheme}://${swaggerContents.host}`
      }

      const url = urlParse(swaggerContentsUrl || this.swaggerUrl)
      this.cachedBaseUrl = `${url.protocol}//${(url.auth ? (`${url.auth}@`) : '')}${url.host}`

      if (!isValidUri(this.cachedBaseUrl)) {
        throw new Error(`Invalid URI '${this.cachedBaseUrl}': ${BASE_URL_HELP}`)
      }

      return this.cachedBaseUrl
    })
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
