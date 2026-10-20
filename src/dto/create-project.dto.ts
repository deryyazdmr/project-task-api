import {
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    ValidateIf,
} from 'class-validator';

export class CreateProjectDto {
    @IsString()
    @Matches(/\S/, {
        message: 'Proje adı boş veya yalnızca boşluk karakterlerinden oluşamaz.',
    })
    @MaxLength(100)
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}

export class UpdateProjectDto {
    @ValidateIf((_object, value) => value !== undefined)
    @IsString()
    @Matches(/\S/, {
        message: 'Proje adı boş veya yalnızca boşluk olamaz',
    })
    @MaxLength(100)
    name?: string;

    @ValidateIf((_object, value) => value !== undefined)
    @IsString()
    @MaxLength(500)
    description?: string;
}