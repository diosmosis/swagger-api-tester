'use strict'

const expect = require('chai').expect
const path = require('path')
const fs = require('fs')
const nock = require('nock')
const yaml = require('js-yaml')
const Tester = require('../../lib')

const PATH_TO_VALID_SWAGGER = path.join(__dirname, '../resources/swagger.valid.yml')
const PATH_TO_HOSTLESS_SWAGGER = path.join(__dirname, '../resources/swagger.invalid.yml')
const HOSTLESS_SWAGGER_CONTENTS = yaml.safeLoad(fs.readFileSync(PATH_TO_HOSTLESS_SWAGGER))

const DUMMY_HEADERS = {
  header1: 'value1',
  header2: 'value2',
}

describe('Tester', function () {
  afterEach(function () {
    nock.cleanAll()
  })

  let validTester
  beforeEach(function () {
    validTester = new Tester(PATH_TO_VALID_SWAGGER)
  })

  describe('#constructor()', function () {
    it('should default the baseUrl/baseHeaders properties if not passed as options', function () {
      const tester = new Tester('./path/to/file.yml')

      expect(tester.swaggerUrl).to.equal('./path/to/file.yml')
      expect(tester.baseHeaders).to.deep.equal({})
      expect(tester.cachedBaseUrl).to.not.be.ok
    })

    it('should set the baseUrl/baseHeaders properties if passed in the constructor', function () {
      const baseHeaders = {
        Authorization: 'myauth',
        'x-api-key': 'myapikey',
      }

      const tester = new Tester('./path/file.yml', {
        baseUrl: 'http://whatever.com',
        baseHeaders,
      })

      expect(tester.swaggerUrl).to.equal('./path/file.yml')
      expect(tester.baseHeaders).to.deep.equal(baseHeaders)
      expect(tester.cachedBaseUrl).to.equal('http://whatever.com')
    })
  })

  describe('#baseUrl()', function () {
    it('should use the URL specified during construction when it is specified', function * () {
      const tester = new Tester(PATH_TO_VALID_SWAGGER, {
        baseUrl: 'http://whatever.com',
      })

      const baseUrl = yield tester.baseUrl()
      expect(baseUrl).to.equal('http://whatever.com')
    })

    it('should deduce the base URL from the swagger contents, if none is specified on construction', function * () {
      const tester = new Tester(PATH_TO_VALID_SWAGGER)

      const baseUrl = yield tester.baseUrl()
      expect(baseUrl).to.equal('https://mywhatever.com')
    })

    it('should deduce base URL from the swagger file URL, if no host is in the swagger file', function * () {
      nock('http://host.com')
        .get('/ignore/this/path/api-docs')
        .reply(200, HOSTLESS_SWAGGER_CONTENTS)

      const tester = new Tester('http://host.com/ignore/this/path/api-docs')

      const baseUrl = yield tester.baseUrl()
      expect(baseUrl).to.equal('http://host.com')
    })

    it('should throw a useful exception if the base URL to the API cannot be deduced', function * () {
      const tester = new Tester(PATH_TO_HOSTLESS_SWAGGER)

      let error
      try {
        yield tester.baseUrl()
      } catch (e) {
        error = e
      }

      expect(error).to.be.instanceof(Error)
      expect(error.message).to.match(/^Invalid URI.*couldn't construct a correct looking/)
    })
  })

  describe('#post()', function () {
    it('should correctly create a SwaggerRequestTest instance', function () {
      const test = validTester.post('/path/to/somewhere', 'body text', DUMMY_HEADERS)

      expect(test.tester).to.be.instanceof(Tester)
      expect(test.method).to.equal('POST')
      expect(test.path).to.equal('/path/to/somewhere')
      expect(test.body).to.equal('body text')
      expect(test.headers).to.equal(DUMMY_HEADERS)
    })
  })

  describe('#put()', function () {
    it('should correctly create a SwaggerRequestTest instance', function () {
      const test = validTester.put('/path/to/nowhere', 'body text 2', DUMMY_HEADERS)

      expect(test.tester).to.be.instanceof(Tester)
      expect(test.method).to.equal('PUT')
      expect(test.path).to.equal('/path/to/nowhere')
      expect(test.body).to.equal('body text 2')
      expect(test.headers).to.equal(DUMMY_HEADERS)
    })
  })

  describe('#del()', function () {
    it('should correctly create a SwaggerRequestTest instance', function () {
      const test = validTester.del('/path/to/intermediate-where', 'body text 3', DUMMY_HEADERS)

      expect(test.tester).to.be.instanceof(Tester)
      expect(test.method).to.equal('DELETE')
      expect(test.path).to.equal('/path/to/intermediate-where')
      expect(test.body).to.equal('body text 3')
      expect(test.headers).to.equal(DUMMY_HEADERS)
    })
  })

  describe('#get()', function () {
    it('should correctly create a SwaggerRequestTest instance', function () {
      const test = validTester.get('/path/to/middleware', DUMMY_HEADERS)

      expect(test.tester).to.be.instanceof(Tester)
      expect(test.method).to.equal('GET')
      expect(test.path).to.equal('/path/to/middleware')
      expect(test.body).to.be.null
      expect(test.headers).to.equal(DUMMY_HEADERS)
    })
  })

  describe('#request()', function () {
    it('should correctly create a SwaggerRequestTest instance', function () {
      const test = validTester.request('WEIRDMETHOD', '/path/to/strange/things', '@#$&!!!!', DUMMY_HEADERS)

      expect(test.tester).to.be.instanceof(Tester)
      expect(test.method).to.equal('WEIRDMETHOD')
      expect(test.path).to.equal('/path/to/strange/things')
      expect(test.body).to.equal('@#$&!!!!')
      expect(test.headers).to.equal(DUMMY_HEADERS)
    })
  })
})
