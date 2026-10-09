import UserTransformer from '#transformers/user_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  /**
   * @summary Perfil do Utilizador
   * @description Retorna os dados do utilizador atualmente autenticado.
   * @responseBody 200 - {"id": 1, "fullName": "Nome", "email": "user@example.com"}
   * @responseBody 401 - {"error": "Não autorizado"}
   */
  async show({ auth, serialize }: HttpContext) {
    return serialize(UserTransformer.transform(auth.getUserOrFail()))
  }
}
