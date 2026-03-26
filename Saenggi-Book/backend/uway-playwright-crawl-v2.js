/**
 * UWAY 수시 경쟁률 Playwright 기반 크롤링 스크립트 V2
 * - power URL 프레임 내부 URL 자동 추출
 * - 서울대학교 별도 크롤링
 * - 다양한 테이블 구조 대응
 * - 인코딩 문제 해결
 */

const { chromium } = require('playwright');
const XLSX = require('xlsx');
const path = require('path');

// 설정
const TIMEOUT = 45000;
const DELAY_BETWEEN_REQUESTS = 800;

// 대학 목록 (info.uway.com에서 수집 + 서울대 추가)
const UNIVERSITIES = [
  // 서울대학교 - 별도 시스템
  { name: "서울대학교", region: "서울", establishType: "국·공립", ratioUrl: "https://admission.snu.ac.kr/undergraduate/notice?md=v&bbsidx=157446", type: "snu" },

  // 일반 대학들
  { name: "가야대학교", region: "경남", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10010651.html" },
  { name: "가천대학교", region: "경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10190551.html" },
  { name: "가톨릭관동대학교", region: "강원", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOjlMSmYlJjomSi1mVGY=" },
  { name: "가톨릭꽃동네대학교", region: "충북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KMGE5OUpmJSY6JkotZlRm" },
  { name: "가톨릭대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10030311.html" },
  { name: "감리교신학대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KJjBNSmYlJjomSi1mVGY=" },
  { name: "강남대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KTThXclc4OUpmJSY6JkotZlRm" },
  { name: "강서대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10360681.html" },
  { name: "강원대학교(강릉캠퍼스,원주캠퍼스)", region: "강원", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOldOckpmJSY6JkotZlRm" },
  { name: "강원대학교(춘천,삼척캠퍼스)", region: "강원", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KV2FOclc4OUpmJSY6JkotZlRm" },
  { name: "건국대학교 서울캠퍼스", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10080311.html" },
  { name: "건국대학교(글로컬)", region: "충북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10091041.html" },
  { name: "건양대학교", region: "충남", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10100701.html" },
  { name: "경기대학교", region: "경기/서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KJXJyV2FiOUpmJSY6JkotZlRm" },
  { name: "경남대학교", region: "경남", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10130521.html" },
  { name: "경북대학교", region: "대구", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOlc5SmYlJjomSi1mVGY=" },
  { name: "경상국립대학교", region: "경남", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10170831.html" },
  { name: "경성대학교", region: "부산", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KJjlKZiUmOiZKLWZUZg==" },
  { name: "경인교육대학교", region: "인천", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio20060231.html" },
  // power URL - 내부 URL 직접 사용
  { name: "경희대학교", region: "서울/경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/SmZKOnw5SmYlJjomSi1mVGY=" },
  { name: "계명대학교", region: "대구", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOk05SmYlJjomSi1mVGY=" },
  // power URL - 내부 URL 직접 사용
  { name: "고려대학교(서울)", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOGB9YTlKZiUmOiZKLWZUZg==" },
  { name: "고려대학교(세종)", region: "세종", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KcldhL2AmOzhgfWE5SmYlJjomSi1mVGY=" },
  // power URL - 내부 URL 직접 사용
  { name: "고신대학교", region: "부산", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVyUmYTlKZiUmOiZKLWZUZg==" },
  // power URL - 내부 URL 직접 사용
  { name: "공주교육대학교", region: "충남", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYDY6L3JXYTlKZiUmOiZKLWZUZg==" },
  { name: "광운대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KTjlKZiUmOiZKLWZUZg==" },
  // power URL - 내부 URL 직접 사용
  { name: "광주교육대학교", region: "광주", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYDY6L3JXOE45SmYlJjomSi1mVGY=" },
  { name: "광주대학교", region: "광주", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOi9yVzhOckpmJSY6JkotZlRm" },
  // power URL - 내부 URL 직접 사용
  { name: "광주여자대학교", region: "광주", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOk45SmYlJjomSi1mVGY=" },
  { name: "국립경국대학교", region: "경북", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KcldhVlc4SmYlJjomSi1mVGY=" },
  { name: "국립공주대학교", region: "충남", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10280871.html" },
  { name: "국립군산대학교", region: "전북", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10350541.html" },
  { name: "국립금오공과대학교", region: "경북", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KfGFNOjlKZiUmOiZKLWZUZg==" },
  { name: "국립목포대학교", region: "전남", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10690211.html" },
  { name: "국립목포해양대학교", region: "전남", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10700471.html" },
  { name: "국립부경대학교", region: "부산", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10720321.html" },
  { name: "국립순천대학교", region: "전남", establishType: "국·공립", ratioUrl: "https://addon.jinhakapply.com/RatioV1/RatioH/Ratio10990421.html" },
  { name: "국립창원대학교", region: "경남", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11350541.html" },
  { name: "국립한국교통대학교", region: "충북", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio30150561.html" },
  { name: "국립한국해양대학교", region: "부산", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOmFNOUpmJSY6JkotZlRm" },
  { name: "국립한밭대학교", region: "대전", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio30040731.html" },
  { name: "국민대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVyVNOWFhOUpmJSY6JkotZlRm" },
  { name: "극동대학교", region: "충북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOlY5SmYlJjomSi1mVGY=" },
  // power URL - 내부 URL 직접 사용
  { name: "금강대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOnJySmYlJjomSi1mVGY=" },
  { name: "김천대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio40330551.html" },
  { name: "나사렛대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOld9YTlKZiUmOiZKLWZUZg==" },
  { name: "남부대학교", region: "광주", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOkJNOFdKZiUmOiZKLWZUZg==" },
  { name: "남서울대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KQzphYCZNOFdKZiUmOiZKLWZUZg==" },
  { name: "단국대학교", region: "경기/충남", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10420391.html" },
  { name: "대구가톨릭대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10460911.html" },
  { name: "대구교육대학교", region: "대구", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYDpXVkpmJSY6JkotZlRm" },
  { name: "대구대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10440731.html" },
  // power URL - 내부 URL 직접 사용
  { name: "대구예술대학교", region: "경북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOjgwSmYlJjomSi1mVGY=" },
  { name: "대구한의대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10160641.html" },
  { name: "대신대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10480221.html" },
  { name: "대전대학교", region: "대전", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10500891.html" },
  { name: "대진대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVyUvYDhWSmYlJjomSi1mVGY=" },
  { name: "덕성여자대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10530541.html" },
  { name: "동국대학교(WISE)", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10540571.html" },
  { name: "동국대학교(서울)", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10550451.html" },
  // power URL - 내부 URL 직접 사용
  { name: "동덕여자대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOTpWcldhVkpmJSY6JkotZlRm" },
  { name: "동명대학교", region: "부산", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio30050601.html" },
  { name: "동서대학교", region: "부산", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10570621.html" },
  { name: "동신대학교", region: "전남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOlclfCZyV2FWSmYlJjomSi1mVGY=" },
  { name: "동아대학교", region: "부산", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10591111.html" },
  { name: "동의대학교", region: "부산", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOmBWSmYlJjomSi1mVGY=" },
  { name: "루터대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOjBDSmYlJjomSi1mVGY=" },
  { name: "명지대학교", region: "서울/경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10650631.html" },
  { name: "목원대학교", region: "대전", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10670681.html" },
  { name: "목포가톨릭대학교", region: "전남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOkxNSmYlJjomSi1mVGY=" },
  { name: "배재대학교", region: "대전", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOkxpSmYlJjomSi1mVGY=" },
  { name: "백석대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOkJKZiUmOiZKLWZUZg==" },
  { name: "부산가톨릭대학교", region: "부산", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10730511.html" },
  { name: "부산교육대학교", region: "부산", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio20040241.html" },
  { name: "부산대학교", region: "부산", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio12100541.html" },
  { name: "부산외국어대학교", region: "부산", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10750451.html" },
  { name: "상명대학교", region: "서울/충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYX0wVyU6TSZKZiUmOiZKLWZUZg==" },
  { name: "상지대학교", region: "강원", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KJS9yVzgmSmYlJjomSi1mVGY=" },
  { name: "서강대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio12050421.html" },
  { name: "서경대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10810601.html" },
  { name: "서울과학기술대학교", region: "서울", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KMDpXJkpmJSY6JkotZlRm" },
  { name: "서울교육대학교", region: "서울", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYDpXJkpmJSY6JkotZlRm" },
  { name: "서울기독대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10520511.html" },
  // power URL - 내부 URL 직접 사용
  { name: "서울시립대학교", region: "서울", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KJmE6SmYlJjomSi1mVGY=" },
  { name: "서울신학대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOjAmSmYlJjomSi1mVGY=" },
  { name: "서울여자대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10860591.html" },
  { name: "서울장신대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVyUmclc4L0M6YWAmSmYlJjomSi1mVGY=" },
  { name: "서울한영대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11660391.html" },
  { name: "서원대학교", region: "충북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10880521.html" },
  { name: "선문대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KV2FhTVc6JkpmJSY6JkotZlRm" },
  { name: "성결대학교", region: "경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10900671.html" },
  { name: "성공회대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10910441.html" },
  { name: "성균관대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10920451.html" },
  { name: "성신여자대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10930101.html" },
  { name: "세명대학교", region: "충북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5Kclc6Yk1gJkpmJSY6JkotZlRm" },
  { name: "세종대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10950621.html" },
  // power URL - 내부 URL 직접 사용
  { name: "송원대학교", region: "광주", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KV2FOcldhJkpmJSY6JkotZlRm" },
  { name: "수원대학교", region: "경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10970401.html" },
  { name: "숙명여자대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10981151.html" },
  { name: "순천향대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KfExmSmYlJjomSi1mVGY=" },
  { name: "숭실대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11010661.html" },
  { name: "신라대학교", region: "부산", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11020541.html" },
  { name: "아주대학교", region: "경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11040601.html" },
  { name: "안양대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5Kclc4Ylc4SmYlJjomSi1mVGY=" },
  { name: "연세대학교(미래)", region: "강원", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KZiVgJldhYkpmJSY6JkotZlRm" },
  { name: "연세대학교(서울)", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11080671.html" },
  // power URL - 내부 URL 직접 사용
  { name: "영남대학교", region: "경북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOmJKZiUmOiZKLWZUZg==" },
  { name: "영산대학교", region: "경남/부산", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio30100251.html" },
  { name: "예수대학교", region: "전북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOmlNSmYlJjomSi1mVGY=" },
  { name: "용인대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVyVyV2FiSmYlJjomSi1mVGY=" },
  { name: "우석대학교", region: "전북/충북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11150541.html" },
  { name: "우송대학교", region: "대전", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KcldhJmFhTkpmJSY6JkotZlRm" },
  // power URL - 내부 URL 직접 사용
  { name: "울산대학교", region: "울산", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVzgmQzpKZiUmOiZKLWZUZg==" },
  { name: "원광대학교", region: "전북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5Kclc4TjlXYU5KZiUmOiZKLWZUZg==" },
  { name: "을지대학교", region: "대전", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11190571.html" },
  { name: "이화여자대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11201541.html" },
  { name: "인제대학교", region: "경남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYC9XJUpmJSY6JkotZlRm" },
  // power URL - 내부 URL 직접 사용
  { name: "인천가톨릭대학교", region: "인천", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOkxMJUpmJSY6JkotZlRm" },
  { name: "인천대학교", region: "인천", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11230591.html" },
  { name: "인하대학교", region: "인천/경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOHxXJUpmJSY6JkotZlRm" },
  { name: "장로회신학대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KJjBMaUpmJSY6JkotZlRm" },
  { name: "전남대학교", region: "광주", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOlcvSmYlJjomSi1mVGY=" },
  // power URL - 내부 URL 직접 사용
  { name: "전북대학교", region: "전북", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOldCL0pmJSY6JkotZlRm" },
  { name: "전주교육대학교", region: "전북", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYDpXL0pmJSY6JkotZlRm" },
  // power URL - 내부 URL 직접 사용
  { name: "전주대학교", region: "전북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOi9XYWAvSmYlJjomSi1mVGY=" },
  { name: "제주대학교", region: "제주", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOlc6L2AvSmYlJjomSi1mVGY=" },
  { name: "조선대학교", region: "광주", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11300471.html" },
  { name: "중부대학교", region: "충남", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11310831.html" },
  // power URL - 내부 URL 직접 사용
  { name: "중앙대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOjhMSmYlJjomSi1mVGY=" },
  { name: "중원대학교", region: "충북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11920221.html" },
  { name: "진주교육대학교", region: "경남", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYDpMSmYlJjomSi1mVGY=" },
  // power URL - 내부 URL 직접 사용
  { name: "차의과학대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOHxMSmYlJjomSi1mVGY=" },
  { name: "청운대학교", region: "충남/인천", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KV2FhTnJXOnxMSmYlJjomSi1mVGY=" },
  { name: "청주교육대학교", region: "충북", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio20100291.html" },
  { name: "청주대학교", region: "충북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOi9yV2FgfExKZiUmOiZKLWZUZg==" },
  // power URL - 내부 URL 직접 사용
  { name: "초당대학교", region: "전남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5Kclc4VmF8TEpmJSY6JkotZlRm" },
  // power URL - 내부 URL 직접 사용
  { name: "총신대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVyV8JnJXYXxMSmYlJjomSi1mVGY=" },
  // power URL - 내부 URL 직접 사용
  { name: "추계예술대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYGJyOnxMSmYlJjomSi1mVGY=" },
  { name: "춘천교육대학교", region: "강원", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio20110281.html" },
  { name: "충남대학교", region: "대전", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11400411.html" },
  { name: "충북대학교", region: "충북", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11410781.html" },
  { name: "칼빈대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVyVEQzhMSmYlJjomSi1mVGY=" },
  { name: "평택대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOjBpSmYlJjomSi1mVGY=" },
  { name: "포항공과대학교", region: "경북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KfExgMCZhaUpmJSY6JkotZlRm" },
  { name: "한경국립대학교", region: "경기", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio30160991.html" },
  { name: "한국공학대학교", region: "경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio30170591.html" },
  { name: "한국교원대학교", region: "충북", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11480351.html" },
  // power URL - 내부 URL 직접 사용
  { name: "한국기술교육대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KfExgMDhgfWE5SmYlJjomSi1mVGY=" },
  // power URL - 내부 URL 직접 사용
  { name: "한국외국어대학교", region: "서울/경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KJmg6fEpmJSY6JkotZlRm" },
  { name: "한국체육대학교", region: "서울", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11530371.html" },
  { name: "한국침례신학대학교", region: "대전", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KJjowQjlKZiUmOiZKLWZUZg==" },
  { name: "한남대학교", region: "대전", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11560771.html" },
  { name: "한동대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11570661.html" },
  { name: "한라대학교(원주)", region: "강원", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOENDOHxKZiUmOiZKLWZUZg==" },
  { name: "한림대학교", region: "강원", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KTWJDQzh8SmYlJjomSi1mVGY=" },
  { name: "한서대학교", region: "충남", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11600791.html" },
  { name: "한성대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5Kclc6Jlc4fEpmJSY6JkotZlRm" },
  { name: "한세대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KJWAmVzh8SmYlJjomSi1mVGY=" },
  { name: "한신대학교", region: "경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11630391.html" },
  { name: "한양대학교(ERICA)", region: "경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11650631.html" },
  { name: "한양대학교(서울)", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11640461.html" },
  { name: "한일장신대학교", region: "전북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KQyVXOHxKZiUmOiZKLWZUZg==" },
  // power URL - 내부 URL 직접 사용
  { name: "협성대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5Kclc6Jmk6YnxKZiUmOiZKLWZUZg==" },
  { name: "호남대학교", region: "광주", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11690551.html" },
  { name: "호서대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYWAmYXxKZiUmOiZKLWZUZg==" },
  { name: "홍익대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11720711.html" },
  { name: "홍익대학교(세종)", region: "충남", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11720712.html" },
  { name: "화성의과학대학교", region: "경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11880401.html" },
  { name: "UNIST(울산과학기술원)", region: "울산", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KMCYlVzpKXiUmOiZKLWZUZg==" },
  // power URL - 내부 URL 직접 사용
  { name: "광주과학기술원(GIST)", region: "광주", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KbzBlbyZlbyVlb3JlSl4lJjomSi1mVGY=" },
  { name: "대구경북과학기술원(DGIST)", region: "대구", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KMCYlclZKXiUmOiZKLWZUZg==" },
  { name: "한국과학기술원(KAIST)", region: "대전", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KMCYlODlKXiUmOiZKLWZUZg==" },
  { name: "한국에너지공과대학교(KENTECH)", region: "전남", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KfExgMFdgOUpeJSY6JkotZlRm" },
];

/**
 * 개선된 데이터 추출 함수 - 다양한 테이블 구조 대응
 */
async function extractRatioData(page, universityName) {
  try {
    await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUT });
    await page.waitForTimeout(1500); // 충분한 로딩 대기

    const data = await page.evaluate((univName) => {
      const results = [];

      // 모든 테이블 찾기
      const tables = document.querySelectorAll('table');

      // 현재 전형명 추적
      let currentAdmissionType = '전체';

      // 헤더 텍스트에서 전형명 추출
      const headers = document.querySelectorAll('h1, h2, h3, h4, strong, .title, .tit');
      headers.forEach(h => {
        const text = h.textContent.trim();
        if (text.includes('전형') || text.includes('모집')) {
          currentAdmissionType = text.replace(/\s*경쟁률.*$/g, '').trim();
        }
      });

      tables.forEach((table, tableIndex) => {
        // 테이블 앞의 헤더에서 전형명 찾기
        let prevElement = table.previousElementSibling;
        let searchCount = 0;
        while (prevElement && searchCount < 5) {
          const prevText = prevElement.textContent.trim();
          if (prevText.includes('전형') || prevText.includes('경쟁률')) {
            currentAdmissionType = prevText.replace(/\s*경쟁률.*$/g, '').replace(/^\s*●\s*/g, '').trim();
            break;
          }
          prevElement = prevElement.previousElementSibling;
          searchCount++;
        }

        const rows = table.querySelectorAll('tr');
        let headerRow = null;
        let columnMap = {};

        // 헤더 행 찾기 및 컬럼 매핑
        for (let i = 0; i < Math.min(3, rows.length); i++) {
          const cells = rows[i].querySelectorAll('th, td');
          const cellTexts = Array.from(cells).map(c => c.textContent.trim());

          // 경쟁률 컬럼이 있으면 헤더 행으로 간주
          if (cellTexts.some(t => t.includes('경쟁률') || t.includes('경쟁') || t === '경쟁률')) {
            headerRow = i;
            cellTexts.forEach((text, idx) => {
              const lowerText = text.toLowerCase();
              if (text.includes('모집단위') || text.includes('학과') || text.includes('전공') || text === '모집단위') {
                columnMap.department = idx;
              } else if (text.includes('전형') && !text.includes('인원')) {
                columnMap.admissionType = idx;
              } else if (text.includes('캠퍼스') || text.includes('계열') || text.includes('단과대')) {
                columnMap.campus = idx;
              } else if (text.includes('모집') && text.includes('인원') || text === '모집인원' || text === '총모집인원') {
                columnMap.recruitCount = idx;
              } else if (text.includes('지원') && (text.includes('인원') || text.includes('자수')) || text === '지원인원' || text === '지원자수') {
                columnMap.applyCount = idx;
              } else if (text.includes('경쟁률') || text === '경쟁률') {
                columnMap.ratio = idx;
              } else if (text === '구분') {
                columnMap.category = idx;
              }
            });
            break;
          }
        }

        // 데이터 행 처리
        const startRow = headerRow !== null ? headerRow + 1 : 0;
        for (let i = startRow; i < rows.length; i++) {
          const cells = rows[i].querySelectorAll('td');
          if (cells.length < 3) continue;

          // 각 셀의 텍스트
          const cellTexts = Array.from(cells).map(c => c.textContent.trim());

          // 경쟁률 패턴 확인 (X.XX : 1 또는 숫자:1)
          const hasRatioPattern = cellTexts.some(t => /\d+\.?\d*\s*:\s*1/.test(t) || /^\d+\.?\d*$/.test(t));
          if (!hasRatioPattern) continue;

          // 합계/총계/소계 행 건너뛰기
          const firstCellLower = cellTexts[0].toLowerCase();
          if (firstCellLower.includes('계') || firstCellLower.includes('합계') ||
              firstCellLower.includes('총계') || firstCellLower.includes('소계')) {
            continue;
          }

          // 데이터 추출
          let department = '', admissionType = currentAdmissionType, campus = '';
          let recruitCount = '', applyCount = '', ratio = '';

          if (Object.keys(columnMap).length > 0) {
            // 컬럼 매핑 사용
            department = columnMap.department !== undefined ? cellTexts[columnMap.department] : '';
            if (columnMap.admissionType !== undefined) {
              admissionType = cellTexts[columnMap.admissionType] || currentAdmissionType;
            }
            if (columnMap.campus !== undefined) {
              campus = cellTexts[columnMap.campus];
            }
            if (columnMap.category !== undefined && !department) {
              department = cellTexts[columnMap.category];
            }
            recruitCount = columnMap.recruitCount !== undefined ? cellTexts[columnMap.recruitCount] : '';
            applyCount = columnMap.applyCount !== undefined ? cellTexts[columnMap.applyCount] : '';
            ratio = columnMap.ratio !== undefined ? cellTexts[columnMap.ratio] : '';
          } else {
            // 컬럼 매핑 없이 추론
            // 마지막 컬럼부터 역순으로: 경쟁률, 지원인원, 모집인원, ...
            const len = cellTexts.length;
            for (let j = len - 1; j >= 0; j--) {
              const text = cellTexts[j];
              if (!ratio && /\d+\.?\d*\s*:\s*1/.test(text)) {
                ratio = text;
              } else if (!applyCount && ratio && /^\d{1,}(,\d{3})*$/.test(text.replace(/,/g, ''))) {
                applyCount = text;
              } else if (!recruitCount && applyCount && /^\d{1,}(,\d{3})*$/.test(text.replace(/,/g, ''))) {
                recruitCount = text;
              }
            }
            // 첫 번째 셀은 보통 학과/전형명
            department = cellTexts[0];
            if (cells.length >= 5 && !campus) {
              campus = cellTexts[0];
              department = cellTexts[1];
            }
          }

          // 유효한 데이터인지 확인
          if (ratio && (recruitCount || applyCount)) {
            // 중복 체크용 키
            const key = `${univName}-${admissionType}-${department}-${campus}`;

            results.push({
              대학명: univName,
              캠퍼스: campus,
              전형명: admissionType,
              모집단위: department,
              모집인원: recruitCount.replace(/,/g, ''),
              지원인원: applyCount.replace(/,/g, ''),
              경쟁률: ratio
            });
          }
        }
      });

      // 테이블이 없거나 데이터가 없으면 전체 페이지에서 경쟁률 패턴 찾기
      if (results.length === 0) {
        // 전형별 요약 테이블 형식 시도
        const allTables = document.querySelectorAll('table');
        allTables.forEach(table => {
          const rows = table.querySelectorAll('tr');
          rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
              const texts = Array.from(cells).map(c => c.textContent.trim());
              // 경쟁률 패턴 찾기
              for (let i = 0; i < texts.length; i++) {
                if (/\d+\.?\d*\s*:\s*1/.test(texts[i])) {
                  const ratio = texts[i];
                  let recruitCount = '', applyCount = '', department = texts[0];

                  // 숫자 컬럼들 찾기
                  for (let j = 1; j < i; j++) {
                    const num = texts[j].replace(/,/g, '');
                    if (/^\d+$/.test(num)) {
                      if (!recruitCount) recruitCount = num;
                      else if (!applyCount) applyCount = num;
                    }
                  }

                  if (ratio && department && !department.includes('계')) {
                    results.push({
                      대학명: univName,
                      캠퍼스: '',
                      전형명: department.includes('전형') ? department : '전체',
                      모집단위: department.includes('전형') ? '전체' : department,
                      모집인원: recruitCount,
                      지원인원: applyCount,
                      경쟁률: ratio
                    });
                  }
                  break;
                }
              }
            }
          });
        });
      }

      return results;
    }, universityName);

    return data;
  } catch (error) {
    console.error(`  데이터 추출 오류: ${error.message}`);
    return [];
  }
}

/**
 * 서울대학교 크롤링 (별도 처리)
 */
async function crawlSNU(browser) {
  console.log('[서울대학교] 별도 크롤링 시작...');

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  try {
    // 서울대 입학처 공지사항 페이지로 이동
    await page.goto('https://admission.snu.ac.kr/undergraduate/notice?md=v&bbsidx=157446', {
      timeout: TIMEOUT,
      waitUntil: 'networkidle'
    });

    await page.waitForTimeout(2000);

    // 페이지에서 경쟁률 데이터 추출 시도
    const data = await page.evaluate(() => {
      const results = [];

      // 테이블 찾기
      const tables = document.querySelectorAll('table');
      tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 3) {
            const texts = Array.from(cells).map(c => c.textContent.trim());
            // 경쟁률 패턴 찾기
            for (let i = 0; i < texts.length; i++) {
              if (/\d+\.?\d*\s*:\s*1/.test(texts[i]) || /^\d+\.\d+$/.test(texts[i])) {
                results.push({
                  대학명: '서울대학교',
                  캠퍼스: '',
                  전형명: texts[0] || '전체',
                  모집단위: texts[1] || texts[0],
                  모집인원: texts[2] || '',
                  지원인원: texts[3] || '',
                  경쟁률: texts[i].includes(':') ? texts[i] : texts[i] + ' : 1'
                });
                break;
              }
            }
          }
        });
      });

      // 테이블이 없으면 본문에서 데이터 추출 시도
      if (results.length === 0) {
        const content = document.body.innerText;
        const lines = content.split('\n');
        lines.forEach(line => {
          const match = line.match(/(\d+\.?\d*)\s*:\s*1/);
          if (match && line.includes('전형')) {
            results.push({
              대학명: '서울대학교',
              캠퍼스: '',
              전형명: line.split(/\d/)[0].trim() || '전체',
              모집단위: '전체',
              모집인원: '',
              지원인원: '',
              경쟁률: match[0]
            });
          }
        });
      }

      return results;
    });

    if (data.length > 0) {
      console.log(`[서울대학교] ✓ ${data.length}개 데이터`);
    } else {
      console.log('[서울대학교] ✗ 데이터 없음 (PDF 공지일 수 있음)');
    }

    return data;
  } catch (error) {
    console.log(`[서울대학교] ✗ 오류: ${error.message}`);
    return [];
  } finally {
    await context.close();
  }
}

/**
 * 단일 대학 크롤링
 */
async function crawlUniversity(browser, university, index, total) {
  // 서울대학교는 별도 처리
  if (university.type === 'snu') {
    return await crawlSNU(browser);
  }

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    process.stdout.write(`[${index + 1}/${total}] ${university.name}... `);

    let url = university.ratioUrl;

    // power URL에서 실제 URL 추출
    if (url.includes('/power/?ratioURL=')) {
      const match = url.match(/ratioURL=([^&]+)/);
      if (match) {
        url = decodeURIComponent(match[1]);
        if (!url.startsWith('http')) {
          url = 'http:' + url;
        }
      }
    }

    await page.goto(url, {
      timeout: TIMEOUT,
      waitUntil: 'domcontentloaded'
    });

    // 프레임이 있는지 확인
    const frames = page.frames();
    let targetPage = page;

    if (frames.length > 1) {
      // 메인 컨텐츠가 있는 프레임 찾기
      for (const frame of frames) {
        const frameUrl = frame.url();
        if (frameUrl.includes('ratio') && !frameUrl.includes('power')) {
          targetPage = frame;
          break;
        }
      }
    }

    const data = await extractRatioData(targetPage, university.name);

    if (data.length > 0) {
      console.log(`✓ ${data.length}개 데이터`);
    } else {
      console.log('✗ 데이터 없음');
    }

    return data;
  } catch (error) {
    console.log(`✗ 오류: ${error.message}`);
    return [];
  } finally {
    await context.close();
  }
}

/**
 * 엑셀 파일 저장
 */
function saveToExcel(data, filename) {
  const filepath = path.join(__dirname, filename);

  const wb = XLSX.utils.book_new();

  // 상세 데이터 시트
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 25 }, // 대학명
    { wch: 15 }, // 캠퍼스
    { wch: 35 }, // 전형명
    { wch: 25 }, // 모집단위
    { wch: 10 }, // 모집인원
    { wch: 10 }, // 지원인원
    { wch: 15 }, // 경쟁률
  ];
  XLSX.utils.book_append_sheet(wb, ws, '경쟁률_상세');

  // 대학별 요약
  const summaryByUni = {};
  data.forEach(row => {
    if (!summaryByUni[row.대학명]) {
      summaryByUni[row.대학명] = {
        대학명: row.대학명,
        전형수: new Set(),
        모집단위수: 0,
        총모집인원: 0,
        총지원인원: 0
      };
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
    평균경쟁률: uni.총모집인원 > 0 ?
      (uni.총지원인원 / uni.총모집인원).toFixed(2) + ' : 1' : '-'
  }));

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, '대학별_요약');

  // 실패 대학 목록
  const failedUnis = UNIVERSITIES.filter(u => !summaryByUni[u.name]).map(u => ({
    대학명: u.name,
    지역: u.region,
    설립유형: u.establishType,
    URL: u.ratioUrl
  }));

  if (failedUnis.length > 0) {
    const wsFailed = XLSX.utils.json_to_sheet(failedUnis);
    wsFailed['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 80 }
    ];
    XLSX.utils.book_append_sheet(wb, wsFailed, '크롤링실패_대학');
  }

  XLSX.writeFile(wb, filepath);
  console.log(`\n엑셀 파일 저장됨: ${filepath}`);
  return filepath;
}

/**
 * 메인 함수
 */
async function main() {
  console.log('='.repeat(70));
  console.log('UWAY 수시 경쟁률 Playwright 크롤링 V2');
  console.log('- power URL 프레임 내부 URL 자동 추출');
  console.log('- 서울대학교 별도 크롤링');
  console.log('- 다양한 테이블 구조 대응');
  console.log('='.repeat(70));

  const validUniversities = UNIVERSITIES.filter(u =>
    u.ratioUrl && !u.ratioUrl.includes('javascript:void')
  );

  console.log(`\n총 ${validUniversities.length}개 대학 크롤링 시작`);
  console.log('='.repeat(70));

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const allData = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < validUniversities.length; i++) {
    const uni = validUniversities[i];

    try {
      const data = await crawlUniversity(browser, uni, i, validUniversities.length);

      if (data.length > 0) {
        allData.push(...data);
        successCount++;
      } else {
        errorCount++;
      }
    } catch (error) {
      console.log(`✗ 치명적 오류: ${error.message}`);
      errorCount++;
    }

    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
  }

  await browser.close();

  console.log('='.repeat(70));
  console.log(`\n크롤링 완료: 성공 ${successCount}, 실패 ${errorCount}`);
  console.log(`총 ${allData.length}개 데이터 수집됨`);
  console.log(`성공률: ${(successCount / validUniversities.length * 100).toFixed(1)}%`);

  if (allData.length > 0) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `UWAY_수시_경쟁률_V2_${timestamp}.xlsx`;
    saveToExcel(allData, filename);
  }

  console.log('='.repeat(70));
  console.log('완료');
  console.log('='.repeat(70));
}

// 실행
main().catch(console.error);
