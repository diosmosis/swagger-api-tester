'use strict'

const expect = require('chai').expect
const path = require('path')
const Tester = require('../../lib')
const RequestTestGenerator = require('../../lib/request-test-generator')

const PATH_TO_VALID_SWAGGER = path.join(__dirname, '../resources/swagger.valid.yml')

const DUMMY_HEADERS = {
  header1: 'value1',
  header2: 'value2',
}

describe('TestGenerator', function () {
  let validTester
  beforeEach(function () {
    validTester = new Tester(PATH_TO_VALID_SWAGGER)
  })

  describe('#post()', function () {
    it('should correctly create a RequestTestGenerator instance', function () {
      const test = validTester.post('/path/to/somewhere', 'body text', DUMMY_HEADERS)
      expect(test).to.be.instanceof(RequestTestGenerator)
    })
  })

  describe('#put()', function () {
    it('should correctly create a RequestTestGenerator instance', function () {
      const test = validTester.put('/path/to/nowhere', 'body text 2', DUMMY_HEADERS)
      expect(test).to.be.instanceof(RequestTestGenerator)
    })
  })

  describe('#del()', function () {
    it('should correctly create a RequestTestGenerator instance', function () {
      const test = validTester.del('/path/to/intermediate-where', 'body text 3', DUMMY_HEADERS)
      expect(test).to.be.instanceof(RequestTestGenerator)
    })
  })

  describe('#get()', function () {
    it('should correctly create a RequestTestGenerator instance', function () {
      const test = validTester.get('/path/to/middleware', DUMMY_HEADERS)
      expect(test).to.be.instanceof(RequestTestGenerator)
    })
  })

  describe('#request()', function () {
    it('should correctly create a RequestTestGenerator instance', function () {
      const test = validTester.request('WEIRDMETHOD', '/path/to/strange/things', '@#$&!!!!', DUMMY_HEADERS)
      expect(test).to.be.instanceof(RequestTestGenerator)
    })
  })
})
