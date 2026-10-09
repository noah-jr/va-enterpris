import { IUserRepository } from '../repositories/IUserRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class LoginUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(email: string, password: string): Promise<{ user: any; token: string }> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token,
        };
    }
}
