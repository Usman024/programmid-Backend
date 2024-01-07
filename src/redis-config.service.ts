import { Injectable } from '@nestjs/common';
import { RedisModuleOptions, RedisOptionsFactory } from '@liaoliaots/nestjs-redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfigService implements RedisOptionsFactory {

  constructor(
    private config: ConfigService,
  ) {}
  createRedisOptions(): RedisModuleOptions {
    return {
      readyLog: true,
      config: {
        host: this.config.get<string>("REDIS_HOST"),
        port: this.config.get<number>("REDIS_PORT"),
        password: this.config.get<string>("REDIS_PASSWORD"),
      }
    };
  }
}