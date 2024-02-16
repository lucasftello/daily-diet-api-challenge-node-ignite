import { describe, afterAll, beforeAll, beforeEach, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { execSync } from 'node:child_process'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  test('create user', async () => {
    const response = await request(app.server).post('/users').send({
      name: 'Test user',
      email: 'user@test.com',
      password: 'test',
    })

    expect(response.statusCode).toEqual(201)
  })
})
