[![Build Status](https://travis-ci.org/diosmosis/swagger-api-tester.svg?branch=master)](https://travis-ci.org/diosmosis/swagger-api-tester)

# swagger-api-tester

Create lightweight smoke tests against HTTP APIs using swagger docs to inform validations.

## Example

```
'use strict'

const Tester = require('swagger-api-tester')

describe('My API', function () {
  const test = new Tester('http://petstore.swagger.io/v2/swagger.json')

  test.post('/pet', pet).respondsWith(200, 'Pet')
  test.put('/pet', pet).respondsWith(200)

  test.get('/pet/20').respondsWith(200)
})
```
