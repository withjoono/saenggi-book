import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * snake_case 요청 body를 camelCase로 변환하는 인터셉터
 * 프론트엔드에서 snake_case로 데이터를 보내는 경우 사용
 */
@Injectable()
export class SnakeToCamelInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.body && typeof request.body === 'object') {
      request.body = this.convertKeysToCamelCase(request.body);
    }

    return next.handle();
  }

  private convertKeysToCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertKeysToCamelCase(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const converted: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const camelKey = this.snakeToCamel(key);
          converted[camelKey] = this.convertKeysToCamelCase(obj[key]);
        }
      }
      return converted;
    }

    return obj;
  }

  private snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
}
