const { describe, test, expect } = require('@jest/globals')
const User = require('../../../models/user')

describe('User Model', () => {
  test('should create a new user', async () => {
    const user = new User({
      username: 'test@test.com',
      password: 'password123',
      role: 'user',
    })

    await expect(user.validate()).resolves.not.toThrow()
  })
  test('should not create a user with invalid email', async () => {
    const user = new User({
      username: 'invalid-email',
      password: 'password123',
      role: 'user',
    })
    await expect(user.validate()).rejects.toThrow(
      'User validation failed: username: Please fill a valid email address'
    )
  })
  test('should not create a user with missing password', async () => {
    const user = new User({
      username: 'new@user.com',
      role: 'user',
    })
    await expect(user.validate()).rejects.toThrow(
      'User validation failed: password: Path `password` is required.'
    )
  })
})
