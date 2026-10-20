import {
    IsString,
    Matches,
    MaxLength,
    ValidateIf,
} from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @Matches(/\S/, {
        message: 'Görev adı boş veya yalnızca boşluk karakterlerinden oluşamaz.',
    })
    @MaxLength(100)
    title!: string;

    @ValidateIf((_object, value) => value !== undefined)
    @IsString()
    @MaxLength(500)
    description?: string;
}