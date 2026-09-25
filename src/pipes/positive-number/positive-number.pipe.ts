import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class PositiveNumberPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const paramName = metadata.data || 'Value';

    // validated param value
    if (value === undefined || value === '' || value === null) {
      throw new BadRequestException(`${paramName} must be a valid integer.`);
    }

    const num = Number(value); // convert string param to number

    if (!Number.isInteger(num) || !Number.isFinite(num)) {
      throw new BadRequestException(`${paramName} must be a valid integer.`);
    }

    // check if number is positive
    if (num <= 0) {
      throw new BadRequestException(`${paramName} must be positive.`);
    }

    return num;
  }
}
