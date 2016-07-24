'use strict'

const expect = require('chai').expect
const path = require('path')
const fs = require('fs')
const nock = require('nock')
const yaml = require('js-yaml')
const SwaggerSpec = require('../../lib/swagger-spec')

const PATH_TO_VALID_SWAGGER = path.join(__dirname, '../resources/swagger.valid.yml')
const PATH_TO_HOSTLESS_SWAGGER = path.join(__dirname, '../resources/swagger.invalid.yml')
const HOSTLESS_SWAGGER_CONTENTS = yaml.safeLoad(fs.readFileSync(PATH_TO_HOSTLESS_SWAGGER))

describe('SwaggerSpec', function () {
  afterEach(function () {
    nock.cleanAll()
  })

  describe('#constructor()', function () {
    it('should default the baseUrl/baseHeaders properties if not passed as options', function () {
      const spec = new SwaggerSpec({ swaggerUrl: './path/to/file.yml' })

      expect(spec.swaggerUrl).to.equal('./path/to/file.yml')
      expect(spec.defaultHeaders).to.deep.equal({})
      expect(spec.cachedBaseUrl).to.not.be.ok
    })

    it('should set the baseUrl/baseHeaders properties if passed in the constructor', function () {
      const defaultHeaders = {
        Authorization: 'myauth',
        'x-api-key': 'myapikey',
      }

      const spec = new SwaggerSpec({
        swaggerUrl: './path/file.yml',
        baseUrl: 'http://whatever.com',
        defaultHeaders,
      })

      expect(spec.swaggerUrl).to.equal('./path/file.yml')
      expect(spec.defaultHeaders).to.deep.equal(defaultHeaders)
      expect(spec.cachedBaseUrl).to.equal('http://whatever.com')
    })
  })

  describe('#baseUrl()', function () {
    it('should use the URL specified during construction when it is specified', function * () {
      const spec = new SwaggerSpec({
        swaggerUrl: PATH_TO_VALID_SWAGGER,
        baseUrl: 'http://whatever.com',
      })

      const baseUrl = yield spec.baseUrl()
      expect(baseUrl).to.equal('http://whatever.com')
    })

    it('should deduce the base URL from the swagger contents, if none is specified on construction', function * () {
      const spec = new SwaggerSpec({ swaggerUrl: PATH_TO_VALID_SWAGGER })

      const baseUrl = yield spec.baseUrl()
      expect(baseUrl).to.equal('https://mywhatever.com')
    })

    it('should deduce base URL from the swagger file URL, if no host is in the swagger file', function * () {
      mockSwaggerResponse('/ignore/this/path/api-docs')

      const spec = new SwaggerSpec({ swaggerUrl: 'http://host.com/ignore/this/path/api-docs' })

      const baseUrl = yield spec.baseUrl()
      expect(baseUrl).to.equal('http://host.com')
    })

    it('should throw a useful exception if the base URL to the API cannot be deduced', function * () {
      const spec = new SwaggerSpec({ swaggerUrl: PATH_TO_HOSTLESS_SWAGGER })

      let error
      try {
        yield spec.baseUrl()
      } catch (e) {
        error = e
      }

      expect(error).to.be.instanceof(Error)
      expect(error.message).to.match(/^Invalid URI.*couldn't construct a correct looking/)
    })
  })

  describe('#contents()', function () {
    it('should fetch and parse the swagger contents if a URL is supplied during construction', function * () {
      mockSwaggerResponse('/api-docs')

      const spec = new SwaggerSpec({ swaggerUrl: 'http://host.com/api-docs' })
      const contents = yield spec.contents()

      expect(contents).to.be.ok
      expect(contents.info).to.deep.equal({
        description: 'valid swagger',
        version: '1.0.0',
        title: 'valid swagger',
      })
    })

    it('should read and parse the swagger contents if a file path is supplied during construction', function * () {
      const spec = new SwaggerSpec({ swaggerUrl: PATH_TO_VALID_SWAGGER })
      const contents = yield spec.contents()

      expect(contents).to.be.ok
      expect(contents.info).to.deep.equal({
        description: 'valid swagger',
        version: '1.0.0',
        title: 'valid swagger',
      })
    })
  })

  function mockSwaggerResponse(urlPath) {
    nock('http://host.com')
      .get(urlPath)
      .reply(200, HOSTLESS_SWAGGER_CONTENTS)
  }
})
