'use strict'

const helloWorld = require('../../lib')
const expect = require('chai').expect

describe('dummy', function () {
  it('should pass', function () {
    expect(helloWorld()).to.equal('hello world')
  })
})
