import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../config/database'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const createUserBodySchema = z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
      })

      const body = createUserBodySchema.safeParse(request.body)

      if (!body.success) {
        return reply.status(400).send({
          message: 'Name, email and password is required',
        })
      }

      const { name, email, password } = body.data

      const userExists = await knex('users')
        .where('email', email)
        .select()
        .first()

      if (userExists) {
        return reply.status(400).send({
          message: 'This email is already in use',
        })
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      await knex('users').insert({
        id: randomUUID(),
        name,
        email,
        password: hashedPassword,
      })

      return reply.status(201).send()
    } catch (error) {
      console.error(error)

      return reply.status(500).send({
        message: 'Internal Server Error',
      })
    }
  })
}
