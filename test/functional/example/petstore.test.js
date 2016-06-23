'use strict'

const Tester = require('../../../lib')

describe('PetStore Example', function () {
  const test = new Tester('http://petstore.swagger.io/v2/swagger.json')
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

  test.post('/pet', pet).respondsWith(200, 'Pet')
  test.put('/pet', pet).respondsWith(200)

  test.get('/pet/20').respondsWith(200)
})
