import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import type { Request } from 'express';

export type AuthenticatedRequest = Request & { 
    user: {
        id: number;
    };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();

        const authorization = request.headers.authorization;
        const parts = authorization?.split(' ');

        if (
            !parts ||
            parts.length !== 2 ||
            parts[0].toLowerCase() !== 'bearer' ||
            !parts[1]
        ) {
            throw new UnauthorizedException('Giriş yapmanız gerekiyor.');
        }
        const token = parts[1];

        try {
            const payload = await this.jwtService.verifyAsync<{
                sub: number;
            }>(token, {
                algorithms: ['HS256'],
            });

            if (!Number.isInteger(payload.sub) || payload.sub <= 0) {
                throw new UnauthorizedException('Geçersiz kullanıcı bilgisi.');
            }

            request.user = {
                id: payload.sub,
            };

            return true;
        } catch {
            throw new UnauthorizedException('Geçersiz token veya süresi dolmuş.');
        };
    }
}