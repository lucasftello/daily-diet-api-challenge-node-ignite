import { describe, afterAll, beforeAll, beforeEach, expect, test } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { execSync } from 'node:child_process'

describe('Meals routes', () => {
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

  test('create a meal', async () => {
    await request(app.server).post('/users').send({
      name: 'Test user',
      email: 'user@test.com',
      password: 'test',
    })

    const loginResponse = await request(app.server).post('/auth/login').send({
      email: 'user@test.com',
      password: 'test',
    })

    const { token } = loginResponse.body

    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test meal',
        description: 'Lorem ipsum test',
        date: '2024-02-14',
        time: '21:18:00',
        diet: 'out',
      })

    expect(createMealResponse.statusCode).toEqual(201)
  })

  test('list all meals', async () => {
    await request(app.server).post('/users').send({
      name: 'Test user',
      email: 'user@test.com',
      password: 'test',
    })

    const loginResponse = await request(app.server).post('/auth/login').send({
      email: 'user@test.com',
      password: 'test',
    })

    const { token } = loginResponse.body

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test meal',
        description: 'Lorem ipsum test',
        date: '2024-02-14',
        time: '21:18:00',
        diet: 'out',
      })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Authorization', `Bearer ${token}`)

    expect(listMealsResponse.statusCode).toEqual(200)
  })

  test('get a specific meal', async () => {
    await request(app.server).post('/users').send({
      name: 'Test user',
      email: 'user@test.com',
      password: 'test',
    })

    const loginResponse = await request(app.server).post('/auth/login').send({
      email: 'user@test.com',
      password: 'test',
    })

    const { token } = loginResponse.body

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test meal',
        description: 'Lorem ipsum test',
        date: '2024-02-14',
        time: '21:18:00',
        diet: 'out',
      })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Authorization', `Bearer ${token}`)

    const mealId = listMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(getMealResponse.statusCode).toEqual(200)
  })

  test('update a meal', async () => {
    await request(app.server).post('/users').send({
      name: 'Test user',
      email: 'user@test.com',
      password: 'test',
    })

    const loginResponse = await request(app.server).post('/auth/login').send({
      email: 'user@test.com',
      password: 'test',
    })

    const { token } = loginResponse.body

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test meal',
        description: 'Lorem ipsum test',
        date: '2024-02-14',
        time: '21:18:00',
        diet: 'out',
      })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Authorization', `Bearer ${token}`)

    const mealId = listMealsResponse.body.meals[0].id

    const updateMeal = await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test update',
        description: 'Lorem ipsum test 1',
        date: '2024-02-15',
        time: '19:00:09',
        diet: 'in',
      })

    expect(updateMeal.statusCode).toEqual(200)
  })

  test('delete a meal', async () => {
    await request(app.server).post('/users').send({
      name: 'Test user',
      email: 'user@test.com',
      password: 'test',
    })

    const loginResponse = await request(app.server).post('/auth/login').send({
      email: 'user@test.com',
      password: 'test',
    })

    const { token } = loginResponse.body

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test meal',
        description: 'Lorem ipsum test',
        date: '2024-02-14',
        time: '21:18:00',
        diet: 'out',
      })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Authorization', `Bearer ${token}`)

    const mealId = listMealsResponse.body.meals[0].id

    const deleteMealResponse = await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(deleteMealResponse.statusCode).toEqual(204)
  })

  test('get metrics of all meals', async () => {
    await request(app.server).post('/users').send({
      name: 'Test user',
      email: 'user@test.com',
      password: 'test',
    })

    const loginResponse = await request(app.server).post('/auth/login').send({
      email: 'user@test.com',
      password: 'test',
    })

    const { token } = loginResponse.body

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test meal',
        description: 'Lorem ipsum test',
        date: '2024-02-14',
        time: '21:18:00',
        diet: 'in',
      })

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test meal 2',
        description: 'Lorem ipsum test 2',
        date: '2024-02-14',
        time: '21:18:00',
        diet: 'in',
      })

    await request(app.server)
      .post('/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test meal 3',
        description: 'Lorem ipsum test 3',
        date: '2024-02-14',
        time: '21:18:00',
        diet: 'out',
      })

    const response = await request(app.server)
      .get('/meals/metrics')
      .set('Authorization', `Bearer ${token}`)

    expect(response.body).toEqual(
      expect.objectContaining({
        totalMeals: 3,
        totalMealsInDiet: 2,
        totalMealsOutDiet: 1,
        bestOnDietSequence: 2,
      }),
    )
  })
})
