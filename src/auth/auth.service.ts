import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { Prisma} from '../generated/prisma/client';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

    async register(data: RegisterDto) {
        const email = data.email.trim().toLowerCase();

        const passwordHash = await argon2.hash(data.password);

        try {
            return await this.prisma.user.create({
                data: {
                    email: email,
                    passwordHash: passwordHash,
                },
                select: {
                    id: true,
                    email: true,
                    createdAt: true,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Bu e-posta adresi zaten kullanılıyor.');
            }
            throw error;
        }
    }
    async login(data: LoginDto) {
        const email = data.email.trim().toLowerCase();

        const user = await this.prisma.user.findUnique({
            where: {
                email:email,
            },
        });

        if(!user) {
            throw new UnauthorizedException('E-posta veya şifre hatalı.');
        }

        const passwaordMatches = await argon2.verify(
            user.passwordHash, 
            data.password,
        );

        if(!passwaordMatches) {
            throw new UnauthorizedException('E-posta veya şifre hatalı.');
        }

        const accessToken = await this.jwt.signAsync({
            sub: user.id,
        });

        return {
            access_token: accessToken,
        };
    }
}
