import {
    IsBoolean,
    IsString,
    Matches,
    MaxLength,
    ValidateIf,
} from 'class-validator';

export class UpdateTaskDto {
    @ValidateIf((_object, value) => value !== undefined)
    @IsString()
    @Matches(/\S/, {
        message: 'Görev adı boş veya yalnızca boşluk karakterlerinden oluşamaz.',
    })
    @MaxLength(100)
    title?: string;

    @ValidateIf((_object, value) => value !== undefined)
    @IsString()
    @MaxLength(500)
    description?: string;

    @ValidateIf((_object, value) => value !== undefined)
    @IsBoolean({
        message: 'Tamamlandı alanı bir boolean olmalıdır.',
    })
    completed?: boolean;
}