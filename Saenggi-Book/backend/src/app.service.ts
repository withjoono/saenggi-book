import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // The type of cacheManager is set to 'any' to avoid type errors with the 'store' property.
  constructor(@Inject(CACHE_MANAGER) private cacheManager: any) {}
  ping(): string {
    return `Ping - ${process.env.NODE_ENV}`;
  }

  async resetCache() {
    // The intent of the original code was to clear the entire cache.
    // In the new version of the 'cache-manager' library, the 'reset' method is located on the 'store' object.
    // This code performs the exact same action (clearing the cache) using the modern syntax.
    if (this.cacheManager.store && typeof this.cacheManager.store.reset === 'function') {
      await this.cacheManager.store.reset();
      return 'Success'; // Returns the original success message.
    } else {
      throw new Error('The current cache store does not support the reset operation.');
    }
  }
}











