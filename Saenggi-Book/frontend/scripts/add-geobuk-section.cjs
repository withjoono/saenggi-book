const fs = require('fs');

const content = fs.readFileSync('src/components/service-cards-page.tsx', 'utf8');

const oldSection = `      </div>

      {/* 현재 서비스 중 */}
      <ServiceSection
        title="현재 서비스 중"`;

const newSection = `      </div>

      {/* 거북쌤 소개 섹션 */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-4xl mx-auto">
          {/* 거북쌤 이미지 */}
          <div className="flex-shrink-0">
            <img
              src="/images/geobuk-ssam.png"
              alt="거북쌤"
              className="w-32 h-32 md:w-40 md:h-40 object-contain"
            />
          </div>

          {/* 말풍선 */}
          <div className="relative bg-white rounded-2xl shadow-lg p-6 border border-gray-100 max-w-xl">
            {/* 말풍선 꼬리 (모바일: 위쪽, 데스크탑: 왼쪽) */}
            <div className="hidden md:block absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white drop-shadow-sm" />
            <div className="md:hidden absolute top-0 left-1/2 -translate-y-2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white drop-shadow-sm" />

            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
              <span className="font-bold text-blue-600">입시전문가 겸 AI 개발자</span>, 거북쌤이 만든 앱은 다릅니다!
              사용해 보시면 기존의 것과는 많이 다르다는 것을 느끼실 것입니다.
              아래 앱들은 <span className="font-semibold">거북쌤이 직접, 나홀로 만든 AI 앱들</span>입니다.
            </p>
          </div>
        </div>
      </div>

      {/* 현재 서비스 중 */}
      <ServiceSection
        title="현재 서비스 중"`;

const updatedContent = content.replace(oldSection, newSection);

fs.writeFileSync('src/components/service-cards-page.tsx', updatedContent, 'utf8');
console.log('Added geobuk-ssam section with speech bubble!');
