import type { IUserRepository, CreateUserDTO, UpdateUserDTO, UserFilters } from '@/domain/repositories';
import type { User } from '@/domain/entities';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

export class UserUseCases {
    constructor(private userRepository: IUserRepository) { }

    async createUser(data: CreateUserDTO): Promise<User> {
        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.userRepository.create({
            ...data,
            password: hashedPassword,
        });

        // Generate QR Code for employee
        if (user.id) {
            const qrCodeUrl = await this.generateQRCode(user.id);
            await this.userRepository.update(user.id, { qrCode: qrCodeUrl });
            user.qrCode = qrCodeUrl;
        }

        return user;
    }

    async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
        // Hash password if provided
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        return this.userRepository.update(id, data);
    }

    async deleteUser(id: string): Promise<void> {
        return this.userRepository.delete(id);
    }

    async getUserById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }

    async getAllUsers(filters?: UserFilters): Promise<User[]> {
        return this.userRepository.findAll(filters);
    }

    async countUsers(filters?: UserFilters): Promise<number> {
        return this.userRepository.count(filters);
    }

    async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    private async generateQRCode(userId: string): Promise<string> {
        const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/employee/${userId}`;
        return QRCode.toDataURL(profileUrl);
    }

    async regenerateQRCode(userId: string): Promise<string> {
        const qrCodeUrl = await this.generateQRCode(userId);
        await this.userRepository.update(userId, { qrCode: qrCodeUrl });
        return qrCodeUrl;
    }
}
