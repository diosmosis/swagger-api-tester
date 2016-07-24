'use strict'

const urlParse = require('url').parse
const isValidUri = require('valid-url').isUri
const SwaggerParser = require('swagger-parser')

const BASE_URL_HELP = 'couldn\'t construct a correct looking base URL for this API' +
' using the swagger file contents or the URL to the swagger file. You can specify the' +
' base URL explicitly like so:\n' +
`
const tester = new Tester('./path/to/swagger.yml', { baseUrl: 'http://myhost.com' })
`

class SwaggerSpec {
  constructor(options) {
    this.swaggerUrl = options.swaggerUrl
    this.defaultHeaders = options.defaultHeaders || {}
    this.cachedBaseUrl = options.baseUrl
  }

  contents() {
    if (this.cachedSwagger) {
      return Promise.resolve(this.cachedSwagger)
    }

    return SwaggerParser.parse(this.swaggerUrl)
      .then((swaggerContents) => {
        this.cachedSwagger = swaggerContents
        return swaggerContents
      })
  }

  baseUrl() {
    if (this.cachedBaseUrl) {
      return Promise.resolve(this.cachedBaseUrl)
    }

    return this.contents().then((swaggerContents) => {
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
}

module.exports = SwaggerSpec
