import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
    @MaxLength(254)
    email!: string;

    @IsString({ message: 'Şifre bir metin olmalıdır.' })
    @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır.' })
    @MaxLength(128, { message: 'Şifre en fazla 128 karakter olmalıdır.' })
    password!: string;
}