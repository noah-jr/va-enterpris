import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'
import { JwtService } from '../Services/JwtService.js'
import db from '@adonisjs/lucid/services/db'

export default class NewAccountController {
  /**
   * @summary Registar Conta de Cliente
   * @description Cria uma nova conta de utilizador (CLIENTE) e associa ao registo de cliente com NIF.
   */
  async store({ request, response, serialize }: HttpContext) {
    const data = await request.validateUsing(signupValidator)
    const { fullName, email, password, nif, telefone } = data

    // Verify NIF uniqueness if provided
    if (nif) {
      const existingNif = await db.from('clientes').where('nif', nif).first()
      if (existingNif && existingNif.user_id) {
        return response.badRequest({ error: 'Já existe uma conta registada com este NIF / B.I.' })
      }
    }

    // Create User account with CLIENTE role
    const user = await User.create({
      fullName,
      email,
      password,
      role: 'CLIENTE',
    })

    // Create or update Cliente record
    let clienteId: number | null = null
    if (nif) {
      const existingCliente = await db.from('clientes').where('nif', nif).first()
      if (existingCliente) {
        await db
          .from('clientes')
          .where('id', existingCliente.id)
          .update({
            user_id: user.id,
            nome: fullName || existingCliente.nome,
            email: email || existingCliente.email,
            telefone: telefone || existingCliente.telefone,
            updated_at: new Date(),
          })
        clienteId = existingCliente.id
      } else {
        const [insertedId] = await db.table('clientes').insert({
          nome: fullName,
          nif: nif,
          email: email,
          telefone: telefone || null,
          user_id: user.id,
          classificacao: 'NOVO',
          is_lista_negra: false,
          created_at: new Date(),
          updated_at: new Date(),
        })
        clienteId = insertedId
      }
    } else {
      const [insertedId] = await db.table('clientes').insert({
        nome: fullName,
        nif: `NIF-AUTO-${user.id}`,
        email: email,
        telefone: telefone || null,
        user_id: user.id,
        classificacao: 'NOVO',
        is_lista_negra: false,
        created_at: new Date(),
        updated_at: new Date(),
      })
      clienteId = insertedId
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }
    const accessToken = JwtService.generateToken(tokenPayload, '15m')
    const refreshToken = JwtService.generateRefreshToken(tokenPayload, '7d')

    const transformedUser = {
      ...UserTransformer.transform(user),
      nif: nif || `NIF-AUTO-${user.id}`,
      clienteId,
    }

    return serialize({
      user: transformedUser,
      token: accessToken,
      refreshToken: refreshToken,
    })
  }
}
