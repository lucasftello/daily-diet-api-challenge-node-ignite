import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { string, z } from 'zod'
import bcrypt from 'bcryptjs'
import { knex } from '../config/database'

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const loginBodySchema = z.object({
        email: string(),
        password: string(),
      })

      const body = loginBodySchema.safeParse(request.body)

      if (!body.success) {
        return reply.status(400).send({
          message: 'Email and password is required',
        })
      }

      const { email, password } = body.data

      const user = await knex('users').where('email', email).select().first()

      if (!user) {
        return reply.status(401).send({
          message: 'Email or password invalid',
        })
      }

      const validPassword = await bcrypt.compare(password, user.password)

      if (!validPassword) {
        return reply.status(401).send({
          message: 'Email or password invalid',
        })
      }

      const token = app.jwt.sign({ id: user.id })

      reply.status(200).send({
        user: {
          id: user.id,
          name: user.name,
          email,
        },
        token,
      })
    } catch (error) {
      console.error(error)

      return reply.status(500).send({
        message: 'Internal Server Error',
      })
    }
  })
}
