import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../core/use-cases/RegisterUserUseCase';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { LoginUserUseCase } from '../../core/use-cases/LoginUserUseCase';

const userRepository = new PrismaUserRepository();
const registerUseCase = new RegisterUserUseCase(userRepository);
const loginUseCase = new LoginUserUseCase(userRepository);

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const user = await registerUseCase.execute(req.body);
            const { password, ...userWithoutPassword } = user as any;
            res.status(201).json(userWithoutPassword);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await loginUseCase.execute(email, password);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    }
}
