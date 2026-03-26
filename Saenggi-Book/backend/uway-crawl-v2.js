/**
 * UWAY 수시 경쟁률 크롤링 v2
 * uwayapply.com 실시간 URL 수집 및 크롤링
 */

const axios = require('axios');
const cheerio = require('cheerio');
const XLSX = require('xlsx');
const path = require('path');
const iconv = require('iconv-lite');

const TIMEOUT = 15000;
const DELAY = 300;

// 실시간으로 수집된 uwayapply URL 목록 (UWAY 페이지에서 추출)
const UWAYAPPLY_URLS = [
  { name: "서울대학교", url: "http://ratio.uwayapply.com/Sl5KOjlMSmYlJjomSi1mVGY=" },
  { name: "경희대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSmZKOnw5SmYlJjomSi1mVGY%3D&applyURL=http%3A%2F%2Fipsi4.uwayapply.com%2F2026%2Fsusi2%2Fkhu%2F%3FCHA%3D2&ratioNM=%EA%B2%BD%ED%9D%AC%EB%8C%80%ED%95%99%EA%B5%90&univURL=http://www.khu.ac.kr" },
  { name: "고려대학교(서울)", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOGB9YTlKZiUmOiZKLWZUZg%3D%3D&applyURL=http%3A%2F%2Fipsi1.uwayapply.com%2F2026%2Fsusi2%2Fkorea%2F%3FCHA%3D1&ratioNM=%EA%B3%A0%EB%A0%A4%EB%8C%80%ED%95%99%EA%B5%90(%EC%84%9C%EC%9A%B8)&univURL=http://www.korea.ac.kr" },
  { name: "고신대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KVyUmYTlKZiUmOiZKLWZUZg%3D%3D&applyURL=http%3A%2F%2Fipsi1.uwayapply.com%2F2026%2Fsusi2%2Fkosin%2F%3FCHA%3D1&ratioNM=%EA%B3%A0%EC%8B%A0%EB%8C%80%ED%95%99%EA%B5%90&univURL=http://www.kosin.ac.kr" },
  { name: "공주교육대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KYDY6L3JXYTlKZiUmOiZKLWZUZg%3D%3D&applyURL=http%3A%2F%2Fipsi2.uwayapply.com%2F2026%2Fsusi2%2Fkongju-e%2F%3FCHA%3D1&ratioNM=%EA%B3%B5%EC%A3%BC%EA%B5%90%EC%9C%A1%EB%8C%80%ED%95%99%EA%B5%90&univURL=https://www.gjue.ac.kr/html/kor/index.html" },
  { name: "광주교육대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KYDY6L3JXOE45SmYlJjomSi1mVGY%3D&applyURL=http%3A%2F%2Fipsi3.uwayapply.com%2F2026%2Fsusi2%2Fkwangju-e%2F%3FCHA%3D1&ratioNM=%EA%B4%91%EC%A3%BC%EA%B5%90%EC%9C%A1%EB%8C%80%ED%95%99%EA%B5%90&univURL=http://www.gnue.ac.kr/" },
  { name: "광주여자대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOk45SmYlJjomSi1mVGY%3D&applyURL=http%3A%2F%2Fipsi1.uwayapply.com%2F2026%2Fsusi2%2Fkwu%2F%3FCHA%3D1&ratioNM=%EA%B4%91%EC%A3%BC%EC%97%AC%EC%9E%90%EB%8C%80%ED%95%99%EA%B5%90&univURL=http://www.kwu.ac.kr" },
  { name: "금강대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOnJySmYlJjomSi1mVGY%3D&applyURL=http%3A%2F%2Fipsi2.uwayapply.com%2F2026%2Fsusi2%2Fggu%2F%3FCHA%3D1&ratioNM=%EA%B8%88%EA%B0%95%EB%8C%80%ED%95%99%EA%B5%90&univURL=http://www.ggu.ac.kr" },
  { name: "대구예술대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOjgwSmYlJjomSi1mVGY%3D&applyURL=http%3A%2F%2Fipsi3.uwayapply.com%2F2026%2Fsusi2%2Ftau%2F%3FCHA%3D1&ratioNM=%EB%8C%80%EA%B5%AC%EC%98%88%EC%88%A0%EB%8C%80%ED%95%99%EA%B5%90&univURL=https://www.dgau.ac.kr/" },
  { name: "동덕여자대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOTpWcldhVkpmJSY6JkotZlRm&applyURL=http%3A%2F%2Fipsi3.uwayapply.com%2F2026%2Fsusi2%2Fdongduk%2F%3FCHA%3D1&ratioNM=%EB%8F%99%EB%8D%95%EC%97%AC%EC%9E%90%EB%8C%80%ED%95%99%EA%B5%90&univURL=https://www.dongduk.ac.kr/" },
  { name: "서울시립대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KJmE6SmYlJjomSi1mVGY%3D&applyURL=http%3A%2F%2Fipsi3.uwayapply.com%2F2026%2Fsusi2%2Fuos%2F%3FCHA%3D1&ratioNM=%EC%84%9C%EC%9A%B8%EC%8B%9C%EB%A6%BD%EB%8C%80%ED%95%99%EA%B5%90&univURL=https://www.uos.ac.kr/" },
  { name: "송원대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KV2FOcldhJkpmJSY6JkotZlRm&applyURL=http%3A%2F%2Fipsi2.uwayapply.com%2F2026%2Fsusi2%2Fsongwon%2F%3FCHA%3D1&ratioNM=%EC%86%A1%EC%9B%90%EB%8C%80%ED%95%99%EA%B5%90&univURL=http://www.songwon.ac.kr/" },
  { name: "영남대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOmJKZiUmOiZKLWZUZg%3D%3D&applyURL=http%3A%2F%2Fipsi4.uwayapply.com%2F2026%2Fsusi2%2Fyu%2F%3FCHA%3D1&ratioNM=%EC%98%81%EB%82%A8%EB%8C%80%ED%95%99%EA%B5%90&univURL=http://enter.yu.ac.kr/" },
  { name: "울산대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KVzgmQzpKZiUmOiZKLWZUZg%3D%3D&applyURL=http%3A%2F%2Fipsi1.uwayapply.com%2F2026%2Fsusi2%2Fulsan%2F%3FCHA%3D1&ratioNM=%EC%9A%B8%EC%82%B0%EB%8C%80%ED%95%99%EA%B5%90&univURL=http://www.ulsan.ac.kr" },
  { name: "인천가톨릭대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOkxMJUpmJSY6JkotZlRm&applyURL=http%3A%2F%2Fipsi2.uwayapply.com%2F2026%2Fsusi2%2Ficcu%2F%3FCHA%3D1&ratioNM=%EC%9D%B8%EC%B2%9C%EA%B0%80%ED%86%A8%EB%A6%AD%EB%8C%80%ED%95%99%EA%B5%90&univURL=http://www.iccu.ac.kr" },
  { name: "전북대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOldCL0pmJSY6JkotZlRm&applyURL=http%3A%2F%2Fipsi2.uwayapply.com%2F2026%2Fsusi2%2Fjbnu%2F%3FCHA%3D1&ratioNM=%EC%A0%84%EB%B6%81%EB%8C%80%ED%95%99%EA%B5%90&univURL=https://www.jbnu.ac.kr/kor/" },
  { name: "전주대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOi9XYWAvSmYlJjomSi1mVGY%3D&applyURL=http%3A%2F%2Fipsi2.uwayapply.com%2F2026%2Fsusi2%2Fjeonju%2F%3FCHA%3D1&ratioNM=%EC%A0%84%EC%A3%BC%EB%8C%80%ED%95%99%EA%B5%90&univURL=https://www.jj.ac.kr/" },
  { name: "중앙대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOjhMSmYlJjomSi1mVGY%3D&applyURL=http%3A%2F%2Fipsi2.uwayapply.com%2F2026%2Fsusi2%2Fcau%2F%3FCHA%3D1&ratioNM=%EC%A4%91%EC%95%99%EB%8C%80%ED%95%99%EA%B5%90&univURL=http://www.cau.ac.kr" },
  { name: "차의과학대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOHxMSmYlJjomSi1mVGY%3D&applyURL=http%3A%2F%2Fipsi3.uwayapply.com%2F2026%2Fsusi2%2Fcha%2F%3FCHA%3D1&ratioNM=%EC%B0%A8%20%EC%9D%98%EA%B3%BC%ED%95%99%EB%8C%80%ED%95%99%EA%B5%90&univURL=http://www.cha.ac.kr" },
  { name: "초당대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5Kclc4VmF8TEpmJSY6JkotZlRm&applyURL=http%3A%2F%2Fipsi3.uwayapply.com%2F2026%2Fsusi2%2Fchodang%2F%3FCHA%3D1&ratioNM=%EC%B4%88%EB%8B%B9%EB%8C%80%ED%95%99%EA%B5%90&univURL=https://www.cdu.ac.kr/" },
  { name: "총신대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KVyV8JnJXYXxMSmYlJjomSi1mVGY%3D&applyURL=http%3A%2F%2Fipsi2.uwayapply.com%2F2026%2Fsusi2%2Fchongshin%2F%3FCHA%3D1&ratioNM=%EC%B4%9D%EC%8B%A0%EB%8C%80%ED%95%99%EA%B5%90&univURL=http://www.chongshin.ac.kr" },
  { name: "추계예술대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KYGJyOnxMSmYlJjomSi1mVGY%3D&applyURL=http%3A%2F%2Fipsi1.uwayapply.com%2F2026%2Fsusi2%2Fchugye%2F%3FCHA%3D1&ratioNM=%EC%B6%94%EA%B3%84%EC%98%88%EC%88%A0%EB%8C%80%ED%95%99%EA%B5%90&univURL=http://www.chugye.ac.kr" },
  { name: "한국기술교육대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KfExgMDhgfWE5SmYlJjomSi1mVGY%3D&applyURL=http%3A%2F%2Fipsi1.uwayapply.com%2F2026%2Fsusi2%2Fkoreatech%2F%3FCHA%3D1&ratioNM=%ED%95%9C%EA%B5%AD%EA%B8%B0%EC%88%A0%EA%B5%90%EC%9C%A1%EB%8C%80%ED%95%99%EA%B5%90&univURL=https://www.koreatech.ac.kr/kor/" },
  { name: "한국외국어대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KJmg6fEpmJSY6JkotZlRm&applyURL=http%3A%2F%2Fipsi3.uwayapply.com%2F2026%2Fsusi2%2Fhufs%2F%3FCHA%3D1&ratioNM=%ED%95%9C%EA%B5%AD%EC%99%B8%EA%B5%AD%EC%96%B4%EB%8C%80%ED%95%99%EA%B5%90&univURL=http://www.hufs.ac.kr" },
  { name: "협성대학교", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5Kclc6Jmk6YnxKZiUmOiZKLWZUZg%3D%3D&applyURL=http%3A%2F%2Fipsi2.uwayapply.com%2F2026%2Fsusi2%2Fhyupsung%2F%3FCHA%3D1&ratioNM=%ED%98%91%EC%84%B1%EB%8C%80%ED%95%99%EA%B5%90&univURL=https://iphak.uhs.ac.kr/intro.jsp" },
  { name: "GIST", url: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KbzBlbyZlbyVlb3JlSl4lJjomSi1mVGY%3D&applyURL=http%3A%2F%2Fipsi1.uwayapply.com%2F2026%2Fsusi1%2FGIST%2F%3FCHA%3D1&ratioNM=%EA%B4%91%EC%A3%BC%EA%B3%BC%ED%95%99%EA%B8%B0%EC%88%A0%EC%9B%90(GIST)&univURL=http://www.gist.ac.kr/" },
];

// 직접 데이터 URL (power 경로가 없는 URL)
const DIRECT_DATA_URLS = [
  "http://ratio.uwayapply.com/Sl5KOjlMSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KMGE5OUpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KJjBNSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KTThXclc4OUpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KOldOckpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KV2FOclc4OUpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KJXJyV2FiOUpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KOlc5SmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KJjlKZiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KOk05SmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KcldhL2AmOzhgfWE5SmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KTjlKZiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KOi9yVzhOckpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KcldhVlc4SmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KfGFNOjlKZiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KOmFNOUpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KVyVNOWFhOUpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KOlY5SmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KOld9YTlKZiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KOkJNOFdKZiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KQzphYCZNOFdKZiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KYDpXVkpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KVyUvYDhWSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KOlclfCZyV2FWSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KOmBWSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KOjBDSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KOkxNSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KOkxpSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KOkJKZiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KYX0wVyU6TSZKZiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KJS9yVzgmSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KMDpXJkpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KYDpXJkpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KOjAmSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KVyUmclc4L0M6YWAmSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KV2FhTVc6JkpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5Kclc6Yk1gJkpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KfExmSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5Kclc4Ylc4SmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KZiVgJldhYkpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KOmlNSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KVyVyV2FiSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KcldhJmFhTkpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5Kclc4TjlXYU5KZiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KYC9XJUpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KOHxXJUpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KJjBMaUpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KOlcvSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KYDpXL0pmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KOlc6L2AvSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KYDpMSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KV2FhTnJXOnxMSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KOi9yV2FgfExKZiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KVyVEQzhMSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KOjBpSmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KfExgMCZhaUpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KJjowQjlKZiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KOENDOHxKZiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KTWJDQzh8SmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5Kclc6Jlc4fEpmJSY6JkotZlRm",
  "http://ratio.uwayapply.com/Sl5KJWAmVzh8SmYlJjomSi1mVGY=",
  "http://ratio.uwayapply.com/Sl5KQyVXOHxKZiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KYWAmYXxKZiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KMCYlVzpKXiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KMCYlclZKXiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KMCYlODlKXiUmOiZKLWZUZg==",
  "http://ratio.uwayapply.com/Sl5KfExgMFdgOUpeJSY6JkotZlRm",
];

/**
 * power 페이지 URL에서 실제 데이터 URL 추출
 */
function extractDataUrl(powerUrl) {
  const match = powerUrl.match(/ratioURL=([^&]+)/);
  if (match) {
    try {
      let dataUrl = decodeURIComponent(match[1]);
      if (dataUrl.startsWith('//')) {
        dataUrl = 'http:' + dataUrl;
      }
      return dataUrl;
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * uwayapply 데이터 페이지 크롤링
 */
async function crawlUwayapplyPage(url, universityName) {
  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = iconv.decode(response.data, 'euc-kr');
    const $ = cheerio.load(html);
    const details = [];

    // 대학명이 없으면 페이지 제목에서 추출
    let uniName = universityName;
    if (!uniName) {
      const title = $('title').text().trim();
      const match = title.match(/^(.+?)\s*경/);
      if (match) {
        uniName = match[1].trim();
      } else {
        uniName = title.split(' ')[0];
      }
    }

    // 전형명 추출 및 테이블 처리
    let currentAdmissionType = '';

    $('strong, b, h2, h3, table').each((idx, element) => {
      const tagName = element.tagName.toLowerCase();

      if (tagName !== 'table') {
        const text = $(element).text().trim();
        if ((text.includes('전형') || text.includes('학생부') ||
             text.includes('논술') || text.includes('특기자') ||
             text.includes('실기')) && text.includes('경쟁률')) {
          currentAdmissionType = text.replace(' 경쟁률 현황', '').replace(/\s+/g, ' ');
        }
      } else if (currentAdmissionType) {
        $(element).find('tr').each((rowIdx, row) => {
          const cells = $(row).find('td');

          if (cells.length >= 5) {
            const col1 = $(cells[0]).text().trim();
            const col2 = $(cells[1]).text().trim();
            const col3 = $(cells[2]).text().trim();
            const col4 = $(cells[3]).text().trim();
            const col5 = $(cells[4]).text().trim();

            if (col1 !== '대학' && col1 !== '모집단위' &&
                col1 !== '총계' && col1 !== '구분' &&
                !col1.includes('합계') && col5.includes(':')) {
              details.push({
                대학명: uniName,
                전형명: currentAdmissionType,
                단과대학: col1,
                모집단위: col2,
                모집인원: col3,
                지원인원: col4,
                경쟁률: col5
              });
            }
          } else if (cells.length >= 4) {
            const col1 = $(cells[0]).text().trim();
            const col2 = $(cells[1]).text().trim();
            const col3 = $(cells[2]).text().trim();
            const col4 = $(cells[3]).text().trim();

            if (col1 !== '모집단위' && col1 !== '총계' &&
                col1 !== '구분' && !col1.includes('합계') &&
                col4.includes(':')) {
              details.push({
                대학명: uniName,
                전형명: currentAdmissionType,
                단과대학: '',
                모집단위: col1,
                모집인원: col2,
                지원인원: col3,
                경쟁률: col4
              });
            }
          }
        });
      }
    });

    return details;
  } catch (error) {
    console.error(`  오류 (${universityName || url}): ${error.message}`);
    return [];
  }
}

/**
 * 엑셀 저장
 */
function saveToExcel(data, filename) {
  const filepath = path.join(__dirname, filename);
  const wb = XLSX.utils.book_new();

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 25 }, { wch: 35 }, { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 15 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, '경쟁률_상세');

  // 대학별 요약
  const summaryByUni = {};
  data.forEach(row => {
    if (!summaryByUni[row.대학명]) {
      summaryByUni[row.대학명] = { 대학명: row.대학명, 전형수: new Set(), 모집단위수: 0, 총모집인원: 0, 총지원인원: 0 };
    }
    summaryByUni[row.대학명].전형수.add(row.전형명);
    summaryByUni[row.대학명].모집단위수++;
    summaryByUni[row.대학명].총모집인원 += parseInt(String(row.모집인원).replace(/,/g, '')) || 0;
    summaryByUni[row.대학명].총지원인원 += parseInt(String(row.지원인원).replace(/,/g, '')) || 0;
  });

  const summaryData = Object.values(summaryByUni).map(uni => ({
    대학명: uni.대학명,
    전형수: uni.전형수.size,
    모집단위수: uni.모집단위수,
    총모집인원: uni.총모집인원,
    총지원인원: uni.총지원인원,
    평균경쟁률: uni.총모집인원 > 0 ? (uni.총지원인원 / uni.총모집인원).toFixed(2) + ' : 1' : '-'
  }));

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, '대학별_요약');

  XLSX.writeFile(wb, filepath);
  console.log(`\n엑셀 저장: ${filepath}`);
  return filepath;
}

/**
 * 기존 데이터 로드
 */
function loadExistingData(filepath) {
  try {
    const wb = XLSX.readFile(filepath);
    return XLSX.utils.sheet_to_json(wb.Sheets['경쟁률_상세']);
  } catch (e) {
    return [];
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('UWAY 수시 경쟁률 크롤링 v2 (uwayapply.com)');
  console.log('='.repeat(70));

  const allData = [];
  let successCount = 0;

  // 1. power 페이지 URL 처리
  console.log(`\n[1단계] power 페이지 URL 처리 (${UWAYAPPLY_URLS.length}개)`);
  for (let i = 0; i < UWAYAPPLY_URLS.length; i++) {
    const uni = UWAYAPPLY_URLS[i];
    process.stdout.write(`[${i + 1}/${UWAYAPPLY_URLS.length}] ${uni.name}... `);

    // 데이터 URL 추출
    const dataUrl = extractDataUrl(uni.url);
    if (dataUrl) {
      const details = await crawlUwayapplyPage(dataUrl, uni.name);
      if (details.length > 0) {
        allData.push(...details);
        console.log(`✓ ${details.length}개`);
        successCount++;
      } else {
        console.log('✗ 데이터 없음');
      }
    } else {
      console.log('✗ URL 추출 실패');
    }

    await new Promise(r => setTimeout(r, DELAY));
  }

  // 2. 직접 데이터 URL 처리
  console.log(`\n[2단계] 직접 데이터 URL 처리 (${DIRECT_DATA_URLS.length}개)`);
  for (let i = 0; i < DIRECT_DATA_URLS.length; i++) {
    const url = DIRECT_DATA_URLS[i];
    process.stdout.write(`[${i + 1}/${DIRECT_DATA_URLS.length}] ${url.slice(-20)}... `);

    const details = await crawlUwayapplyPage(url, null);
    if (details.length > 0) {
      allData.push(...details);
      console.log(`✓ ${details.length}개 (${details[0].대학명})`);
      successCount++;
    } else {
      console.log('✗');
    }

    await new Promise(r => setTimeout(r, DELAY));
  }

  console.log('='.repeat(70));
  console.log(`\nuwayapply 크롤링 완료: ${successCount}개 대학, ${allData.length}개 데이터`);

  // 3. 기존 jinhakapply 데이터와 병합
  const existingFile = path.join(__dirname, 'UWAY_수시_경쟁률_전체_2026-01-05.xlsx');
  const existingData = loadExistingData(existingFile);
  console.log(`기존 데이터: ${existingData.length}개`);

  // 병합 (중복 제거)
  const existingUnis = new Set(existingData.map(r => r.대학명));
  const newUnis = allData.filter(r => !existingUnis.has(r.대학명));
  console.log(`새로 추가할 데이터: ${newUnis.length}개`);

  const mergedData = [...existingData, ...newUnis];
  console.log(`병합 후 총 데이터: ${mergedData.length}개`);

  // 저장
  const timestamp = new Date().toISOString().split('T')[0];
  saveToExcel(mergedData, `UWAY_수시_경쟁률_병합_${timestamp}.xlsx`);

  console.log('='.repeat(70));
  console.log('완료');
}

main().catch(console.error);
