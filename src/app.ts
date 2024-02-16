import Fastify from 'fastify'
import jwt from '@fastify/jwt'
import { usersRoutes } from './routes/users'
import { mealsRoutes } from './routes/meals'
import { authRoutes } from './routes/auth'

process.env.TZ = 'America/Sao_Paulo'

export const app = Fastify()

app.register(jwt, {
  secret: `${process.env.JWT_SECRET}`,
})
app.register(usersRoutes, {
  prefix: '/users',
})
app.register(authRoutes, {
  prefix: '/auth',
})
app.register(mealsRoutes, {
  prefix: '/meals',
})
