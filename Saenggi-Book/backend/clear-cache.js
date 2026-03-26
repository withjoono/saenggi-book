const Redis = require('ioredis');
require('dotenv').config({ path: '.env.development' });

async function clearCache() {
  try {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    });

    // 정시 관련 캐시 키 찾기
    const keys = await redis.keys('*explore*jungsi*');
    console.log('=== 캐시 키 목록 ===');
    console.log(keys);

    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`\n✅ ${keys.length}개 캐시 삭제 완료`);
    } else {
      console.log('\n캐시 키가 없습니다.');
    }

    // 모든 캐시 키 확인
    const allKeys = await redis.keys('*');
    console.log('\n=== 전체 캐시 키 ===');
    console.log(allKeys.slice(0, 20));

    await redis.quit();
  } catch (err) {
    console.log('Redis 연결 실패 (Redis가 실행 중이 아닐 수 있음):', err.message);
    console.log('\n→ 서버를 재시작하면 캐시가 초기화됩니다.');
  }
}

clearCache();
