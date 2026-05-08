import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Session, QueryResult } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Neo4jService.name);
  private driver: Driver;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const uri = this.config.get<string>('NEO4J_URI', 'bolt://localhost:7687');
    const user = this.config.get<string>('NEO4J_USER', 'neo4j');
    const password = this.config.get<string>('NEO4J_PASSWORD', 'password');

    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

    try {
      await this.driver.verifyConnectivity();
      this.logger.log('✅ Neo4j 연결됨');
    } catch (error) {
      this.logger.warn(`⚠️ Neo4j 연결 실패 (오프라인 모드): ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.driver?.close();
  }

  isConnected(): boolean {
    return !!this.driver;
  }

  async run(cypher: string, params: Record<string, any> = {}): Promise<QueryResult> {
    const session: Session = this.driver.session();
    try {
      return await session.run(cypher, params);
    } finally {
      await session.close();
    }
  }
}
