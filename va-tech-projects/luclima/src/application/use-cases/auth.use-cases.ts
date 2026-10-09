import type { IUserRepository } from '@/domain/repositories';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string;
    };
    token: string;
}

export class AuthUseCases {
    constructor(private userRepository: IUserRepository) { }

    async login(data: LoginDTO): Promise<AuthResponse> {
        const user = await this.userRepository.findByEmail(data.email);

        if (!user) {
            throw new Error('Credenciais inválidas');
        }

        if (!user.isActive) {
            throw new Error('Utilizador inativo');
        }

        const userWithPassword = user as typeof user & { password: string };
        const isPasswordValid = await bcrypt.compare(data.password, userWithPassword.password);

        if (!isPasswordValid) {
            throw new Error('Credenciais inválidas');
        }

        const token = this.generateToken(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar ?? undefined,
            },
            token,
        };
    }

    async verifyToken(token: string): Promise<{ userId: string; email: string; role: string }> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                userId: string;
                email: string;
                role: string;
            };

            return decoded;
        } catch (error) {
            throw new Error('Token inválido');
        }
    }

    private generateToken(userId: string, email: string, role: string): string {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET is not configured');
        // 7 days in seconds
        const expiresIn = 7 * 24 * 60 * 60;
        return jwt.sign({ userId, email, role }, secret, { expiresIn }) as string;
    }

    async getCurrentUser(token: string) {
        const decoded = await this.verifyToken(token);
        const user = await this.userRepository.findById(decoded.userId);

        if (!user || !user.isActive) {
            throw new Error('Utilizador não encontrado');
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar ?? undefined,
            sectorId: user.sectorId,
        };
    }
}
