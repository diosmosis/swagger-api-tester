'use strict'

const expect = require('chai').expect
const TestGenerator = require('../../../lib')

describe('PetStore Example', function () {
  const generate = new TestGenerator('http://petstore.swagger.io/v2/swagger.json')
  const test = generate.tester()
  const pet = {
    category: {
      id: 1,
      name: 'Sentient Dogs',
    },
    name: 'Sprocket',
    photoUrls: [
      'http://docspics.com/sprocket/1',
      'http://docspics.com/sprocket/2',
    ],
    tags: [
      {
        id: 1,
        name: 'best pet ever',
      },
      {
        id: 2,
        name: 'monster from outer space',
      },
    ],
    status: 'pending',
  }

  generate.put('/pet', pet).respondsWith(200)
  generate.get('/pet/20').respondsWith(200)

  let createdPetId
  it('should let me create my own tests', function * () {
    const response = yield test.post('/pet', pet).respondsWith(200, 'Pet')
    createdPetId = response.id

    expect(createdPetId).to.be.ok
  })

  it('should let me use test responses', function * () {
    // the petstore API responds w/ 404 for some reason...
    yield test.del(`/pet/${createdPetId}`).respondsWith(404)
  })
})
