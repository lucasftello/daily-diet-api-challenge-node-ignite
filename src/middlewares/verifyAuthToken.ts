import { FastifyReply, FastifyRequest } from 'fastify'

export async function verifyAuthToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { authorization } = request.headers

  if (!authorization) {
    return reply.status(401).send({
      message: 'Token is missing',
    })
  }

  try {
    await request.jwtVerify()
  } catch (error) {
    return reply.status(401).send({
      message: 'Token invalid',
    })
  }
}
