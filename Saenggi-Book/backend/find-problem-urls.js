// 문제 대학들의 URL 찾기

const problemUniversities = [
  '경남대학교',
  '대구대학교',
  '신라대학교',
  '영산대학교',
  '서울대학교'
];

// uway-all-crawl.js에서 복사한 대학 목록
const UWAYAPPLY_UNIVERSITIES = [
  { name: "서울대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOGB9YTlKZiVlOiZKLWZVZg%3D%3D", type: "uwayapply" },
];

const JINHAKAPPLY_UNIVERSITIES = [
  { name: "경남대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10130521.html", type: "jinhakapply" },
  { name: "대구대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10440731.html", type: "jinhakapply" },
  { name: "신라대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio11020541.html", type: "jinhakapply" },
  { name: "영산대학교", url: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio30100251.html", type: "jinhakapply" },
];

const ALL_UNIVERSITIES = [...UWAYAPPLY_UNIVERSITIES, ...JINHAKAPPLY_UNIVERSITIES];

console.log('문제 대학 URL 목록:\n');
problemUniversities.forEach(name => {
  const uni = ALL_UNIVERSITIES.find(u => u.name === name);
  if (uni) {
    console.log(`${name}:`);
    console.log(`  Type: ${uni.type}`);
    console.log(`  URL: ${uni.url}\n`);
  } else {
    console.log(`${name}: URL을 찾을 수 없음\n`);
  }
});
