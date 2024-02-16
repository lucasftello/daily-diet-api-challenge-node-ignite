import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { verifyAuthToken } from '../middlewares/verifyAuthToken'
import { z } from 'zod'
import { knex } from '../config/database'
import { randomUUID } from 'node:crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    { onRequest: verifyAuthToken },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user.id

        const meals = await knex('meals').where('user_id', userId).select()

        return reply.status(200).send({ meals })
      } catch (error) {
        console.error(error)

        return reply.status(500).send({
          message: 'Internal Server Error',
        })
      }
    },
  )

  app.get(
    '/:id',
    { onRequest: verifyAuthToken },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const getMealParamsSchema = z.object({
          id: z.string().uuid(),
        })

        const { id } = getMealParamsSchema.parse(request.params)
        const userId = request.user.id

        const meal = await knex('meals')
          .where('id', id)
          .andWhere('user_id', userId)
          .first()

        if (!meal) {
          return reply.status(404).send({
            message: 'Meal not found',
          })
        }

        return reply.status(200).send({ meal })
      } catch (error) {
        console.error(error)

        return reply.status(500).send({
          message: 'Internal Server Error',
        })
      }
    },
  )

  app.post(
    '/',
    { onRequest: verifyAuthToken },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const createMealBodySchema = z.object({
          name: z.string(),
          description: z.string(),
          date: z.string(),
          time: z.string(),
          diet: z.enum(['in', 'out']),
        })

        const body = createMealBodySchema.safeParse(request.body)

        if (!body.success) {
          return reply.status(400).send({
            message:
              'Name, description, date, time and diet information are required',
          })
        }

        const { name, description, date, time, diet } = body.data
        const userId = request.user.id

        await knex('meals').insert({
          id: randomUUID(),
          user_id: userId,
          name,
          description,
          date,
          time,
          diet,
        })

        return reply.status(201).send()
      } catch (error) {
        console.error(error)

        return reply.status(500).send({
          message: 'Internal Server Error',
        })
      }
    },
  )

  app.put(
    '/:id',
    { onRequest: verifyAuthToken },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const getMealParamsSchema = z.object({
          id: z.string().uuid(),
        })

        const createMealBodySchema = z.object({
          name: z.string(),
          description: z.string(),
          date: z.string(),
          time: z.string(),
          diet: z.enum(['in', 'out']),
        })

        const body = createMealBodySchema.safeParse(request.body)

        if (!body.success) {
          return reply.status(400).send({
            message:
              'Name, description, date, time and diet information are required',
          })
        }

        const { name, description, date, time, diet } = body.data
        const { id } = getMealParamsSchema.parse(request.params)
        const userId = request.user.id

        const meal = await knex('meals')
          .where('id', id)
          .andWhere('user_id', userId)
          .first()

        if (!meal) {
          return reply.status(404).send({
            message: 'Meal not found',
          })
        }

        await knex('meals').where('id', id).andWhere('user_id', userId).update({
          name,
          description,
          date,
          time,
          diet,
          updated_at: knex.fn.now(),
        })

        return reply.status(200).send()
      } catch (error) {
        console.error(error)

        return reply.status(500).send({
          message: 'Internal Server Error',
        })
      }
    },
  )

  app.delete(
    '/:id',
    { onRequest: verifyAuthToken },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const getMealParamsSchema = z.object({
          id: z.string().uuid(),
        })

        const { id } = getMealParamsSchema.parse(request.params)
        const userId = request.user.id

        const meal = await knex('meals')
          .where('id', id)
          .andWhere('user_id', userId)
          .first()

        if (!meal) {
          return reply.status(404).send({
            message: 'Meal not found',
          })
        }

        await knex('meals').where('id', id).andWhere('user_id', userId).del()

        return reply.status(204).send()
      } catch (error) {
        console.error(error)

        return reply.status(500).send({
          message: 'Internal Server Error',
        })
      }
    },
  )

  app.get(
    '/metrics',
    { onRequest: verifyAuthToken },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user.id

        const totalMeals = await knex('meals')
          .where('user_id', userId)
          .orderBy('date', 'desc')
          .select()

        const totalMealsInDiet = await knex('meals')
          .where('user_id', userId)
          .andWhere('diet', 'in')
          .select()

        const totalMealsOutDiet = await knex('meals')
          .where('user_id', userId)
          .andWhere('diet', 'out')
          .select()

        const { bestOnDietSequence } = totalMeals.reduce(
          (acc, meal) => {
            if (meal.diet === 'in') {
              acc.currentSequence += 1
            } else {
              acc.currentSequence = 0
            }

            if (acc.currentSequence > acc.bestOnDietSequence) {
              acc.bestOnDietSequence = acc.currentSequence
            }

            return acc
          },
          { bestOnDietSequence: 0, currentSequence: 0 },
        )

        return reply.status(200).send({
          totalMeals: totalMeals.length,
          totalMealsInDiet: totalMealsInDiet.length,
          totalMealsOutDiet: totalMealsOutDiet.length,
          bestOnDietSequence,
        })
      } catch (error) {
        console.error(error)

        return reply.status(500).send({
          message: 'Internal Server Error',
        })
      }
    },
  )
}
