import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const rawMaterials = [
  { id: 'm0', title: '수학 세특', category: 'academic', grade: '1학년', summary: '수업 시간에 확률과 통계에 대해 심화 탐구함.' },
  { id: 'm1', title: '과학 창체', category: 'career', grade: '1학년', summary: '과학 동아리 부장으로서 실험 주도.' },
  { id: 'm2', title: '영어 세특', category: 'academic', grade: '2학년', summary: '영어로 된 원서를 읽고 확률과 통계를 실생활 게임에 적용.' },
  { id: 'm3', title: '행동특성', category: 'community', grade: '2학년', summary: '반장으로서 갈등을 중재하고 리더십을 발휘함.' },
  { id: 'm4', title: '진로 활동', category: 'career', grade: '3학년', summary: '데이터 사이언티스트를 목표로 빅데이터 프로젝트 진행.' },
  { id: 'm5', title: '수학 세특', category: 'academic', grade: '3학년', summary: '통계적 분석 기법을 실증 데이터에 적용하는 논문을 작성.' }
];

const prompt = `당신은 대한민국 대학 입학 사정관 관점에서 학생의 생활기록부 역량 서사(Storyline)를 분석하는 전문가입니다.

아래 주어진 학생의 "생기부 추출 소재(Materials)" 목록을 바탕으로, 학업역량(academic), 진로역량(career), 공동체역량(community) 각각에 대한 "서사 타임라인(Timeline) 관계"를 추출해 주세요.

## 핵심 규칙
1. **반드시 3개 역량 모두에 대해 최소 2개 이상의 노드를 생성해야 합니다.** 빈 배열([])은 허용되지 않습니다.
2. 각 역량(학업, 진로, 공동체)별로 해당 역량을 중심축으로 성장해나가는 서사를 노드(Node)와 엣지(Edge)로 구성하세요.
3. 서사 타임라인은 학년 순서에 따른 논리적 발전 과정(예: 호기심/계기 -> 탐구 -> 실생활 적용 -> 융합/심화)에 따라 소재들이 어떻게 연결되는지를 보여주어야 합니다.
4. 특정 역량 타임라인을 만들 때, 다른 카테고리의 소재라도 관련이 있다면 연결 노드로 끌어와 포함시킬 수 있습니다.
5. 노드의 id는 제공된 데이터의 id(m0, m1...)를 그대로 사용하세요.
6. grade 필드에는 학년을 "1학년", "2학년", "3학년" 형태로 명시하세요.
7. edge의 reason은 입시 사정관 관점에서 두 활동이 어떻게 논리적으로 연결되는지 서술해 주세요.

## 제공된 소재 데이터
${JSON.stringify(rawMaterials, null, 2)}

## 출력 형식 (반드시 이 JSON 형식으로만 응답)
{
  "academic": {
    "nodes": [
      { "id": "m0", "materialTitle": "소재 제목", "grade": "1학년", "summary": "이 활동이 학업역량에서 갖는 의미 설명" }
    ],
    "edges": [
      { "source": "m0", "target": "m2", "reason": "해당 과목에서 생긴 호기심을 다른 과목으로 확장하여 탐구함" }
    ]
  },
  "career": {
    "nodes": [],
    "edges": []
  },
  "community": {
    "nodes": [],
    "edges": []
  }
}

중요: 모든 역량(academic, career, community)에 대해 반드시 노드와 엣지를 생성해야 합니다. 빈 배열은 절대 반환하지 마세요.
반드시 위 JSON 객체 구조를 완벽하게 준수하여 응답해야 합니다.`;

async function test() {
    console.log('--- Prompt ---');
    console.log(prompt);
    console.log('--- Calling Gemini ---');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json'
        }
    });
    console.log('--- Response ---');
    console.log(result.response.text());
}

test();
