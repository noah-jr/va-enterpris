import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(6).maxLength(64)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  fullName: vine.string().minLength(2).maxLength(150),
  nif: vine.string().minLength(5).maxLength(20).optional(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  telefone: vine.string().optional(),
})

/**
 * Validator to use before validating user credentials
 * during login (supports email or NIF)
 */
export const loginValidator = vine.create({
  email: vine.string().minLength(3),
  password: vine.string(),
})
