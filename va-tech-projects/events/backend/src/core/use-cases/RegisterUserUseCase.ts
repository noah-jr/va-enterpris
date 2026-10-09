import { IUserRepository } from '../repositories/IUserRepository';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

export class RegisterUserUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(data: any): Promise<User> {
        const userExists = await this.userRepository.findByEmail(data.email);

        if (userExists) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.userRepository.create({
            ...data,
            password: hashedPassword,
        });

        return user;
    }
}
