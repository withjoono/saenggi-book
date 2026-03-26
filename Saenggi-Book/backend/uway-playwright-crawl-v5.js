/**
 * UWAY 수시 경쟁률 Playwright 기반 크롤링 스크립트 V5 (완벽한 크롤러)
 * V4 대비 개선사항:
 * - rowspan/colspan 처리 (남서울대학교 등)
 * - 더 유연한 컬럼 감지 알고리즘
 * - 학과소개 등 추가 컬럼이 있는 테이블 처리
 * - 서울대학교 입학처 공지 크롤링 시도
 * - 인코딩 문제 완벽 해결
 */

const { chromium } = require('playwright');
const XLSX = require('xlsx');
const path = require('path');

// 설정
const TIMEOUT = 60000;
const DELAY_BETWEEN_REQUESTS = 1000;

// 대학 목록 (info.uway.com에서 수집 + 특수 처리)
const UNIVERSITIES = [
  // 서울대학교 - 별도 시스템 (PDF 공지)
  { name: "서울대학교", region: "서울", establishType: "국·공립", ratioUrl: "https://admission.snu.ac.kr/undergraduate/notice?md=v&bbsidx=157446", type: "snu" },

  // 상명대학교 - 캠퍼스별 분리
  { name: "상명대학교(서울)", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOk0mSmYlJjomSi1mVGY=" },
  { name: "상명대학교(천안)", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KZjpNJkpmJSY6JkotZlRm" },

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
  { name: "경희대학교", region: "서울/경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/SmZKOnw5SmYlJjomSi1mVGY=" },
  { name: "계명대학교", region: "대구", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOk05SmYlJjomSi1mVGY=" },
  { name: "고려대학교(서울)", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOGB9YTlKZiUmOiZKLWZUZg==" },
  { name: "고려대학교(세종)", region: "세종", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KcldhL2AmOzhgfWE5SmYlJjomSi1mVGY=" },
  { name: "고신대학교", region: "부산", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVyUmYTlKZiUmOiZKLWZUZg==" },
  { name: "공주교육대학교", region: "충남", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYDY6L3JXYTlKZiUmOiZKLWZUZg==" },
  { name: "광운대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KTjlKZiUmOiZKLWZUZg==" },
  { name: "광주교육대학교", region: "광주", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYDY6L3JXOE45SmYlJjomSi1mVGY=" },
  { name: "광주대학교", region: "광주", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOi9yVzhOckpmJSY6JkotZlRm" },
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
  { name: "금강대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOnJySmYlJjomSi1mVGY=" },
  { name: "김천대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio40330551.html" },
  { name: "나사렛대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOld9YTlKZiUmOiZKLWZUZg==" },
  { name: "남부대학교", region: "광주", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOkJNOFdKZiUmOiZKLWZUZg==" },
  { name: "남서울대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KQzphYCZNOFdKZiUmOiZKLWZUZg==" },
  { name: "단국대학교", region: "경기/충남", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10420391.html" },
  { name: "대구가톨릭대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10460911.html" },
  { name: "대구교육대학교", region: "대구", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYDpXVkpmJSY6JkotZlRm" },
  { name: "대구대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10440731.html" },
  { name: "대구예술대학교", region: "경북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOjgwSmYlJjomSi1mVGY=" },
  { name: "대구한의대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10160641.html" },
  { name: "대신대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10480221.html" },
  { name: "대전대학교", region: "대전", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10500891.html" },
  { name: "대진대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVyUvYDhWSmYlJjomSi1mVGY=" },
  { name: "덕성여자대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10530541.html" },
  { name: "동국대학교(WISE)", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10540571.html" },
  { name: "동국대학교(서울)", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10550451.html" },
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
  { name: "상지대학교", region: "강원", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KJS9yVzgmSmYlJjomSi1mVGY=" },
  { name: "서강대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio12050421.html" },
  { name: "서경대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10810601.html" },
  { name: "서울과학기술대학교", region: "서울", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KMDpXJkpmJSY6JkotZlRm" },
  { name: "서울교육대학교", region: "서울", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYDpXJkpmJSY6JkotZlRm" },
  { name: "서울기독대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10520511.html" },
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
  { name: "송원대학교", region: "광주", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KV2FOcldhJkpmJSY6JkotZlRm" },
  { name: "수원대학교", region: "경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10970401.html" },
  { name: "숙명여자대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10981151.html" },
  { name: "순천향대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KfExmSmYlJjomSi1mVGY=", note: "데이터 미공개" },
  { name: "숭실대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11010661.html" },
  { name: "신라대학교", region: "부산", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11020541.html" },
  { name: "아주대학교", region: "경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11040601.html" },
  { name: "안양대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5Kclc4Ylc4SmYlJjomSi1mVGY=" },
  { name: "연세대학교(미래)", region: "강원", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KZiVgJldhYkpmJSY6JkotZlRm" },
  { name: "연세대학교(서울)", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11080671.html" },
  { name: "영남대학교", region: "경북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOmJKZiUmOiZKLWZUZg==" },
  { name: "영산대학교", region: "경남/부산", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio30100251.html" },
  { name: "예수대학교", region: "전북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOmlNSmYlJjomSi1mVGY=" },
  { name: "용인대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVyVyV2FiSmYlJjomSi1mVGY=" },
  { name: "우석대학교", region: "전북/충북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11150541.html" },
  { name: "우송대학교", region: "대전", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KcldhJmFhTkpmJSY6JkotZlRm" },
  { name: "울산대학교", region: "울산", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVzgmQzpKZiUmOiZKLWZUZg==" },
  { name: "원광대학교", region: "전북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5Kclc4TjlXYU5KZiUmOiZKLWZUZg==" },
  { name: "을지대학교", region: "대전", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11190571.html" },
  { name: "이화여자대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11201541.html" },
  { name: "인제대학교", region: "경남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYC9XJUpmJSY6JkotZlRm" },
  { name: "인천가톨릭대학교", region: "인천", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOkxMJUpmJSY6JkotZlRm" },
  { name: "인천대학교", region: "인천", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11230591.html" },
  { name: "인하대학교", region: "인천/경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOHxXJUpmJSY6JkotZlRm" },
  { name: "장로회신학대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KJjBMaUpmJSY6JkotZlRm" },
  { name: "전남대학교", region: "광주", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOlcvSmYlJjomSi1mVGY=" },
  { name: "전북대학교", region: "전북", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOldCL0pmJSY6JkotZlRm" },
  { name: "전주교육대학교", region: "전북", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYDpXL0pmJSY6JkotZlRm" },
  { name: "전주대학교", region: "전북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOi9XYWAvSmYlJjomSi1mVGY=" },
  { name: "제주대학교", region: "제주", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOlc6L2AvSmYlJjomSi1mVGY=" },
  { name: "조선대학교", region: "광주", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11300471.html" },
  { name: "중부대학교", region: "충남", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11310831.html" },
  { name: "중앙대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOjhMSmYlJjomSi1mVGY=" },
  { name: "중원대학교", region: "충북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11920221.html" },
  { name: "진주교육대학교", region: "경남", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYDpMSmYlJjomSi1mVGY=" },
  { name: "차의과학대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOHxMSmYlJjomSi1mVGY=" },
  { name: "청운대학교", region: "충남/인천", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KV2FhTnJXOnxMSmYlJjomSi1mVGY=" },
  { name: "청주교육대학교", region: "충북", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio20100291.html" },
  { name: "청주대학교", region: "충북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOi9yV2FgfExKZiUmOiZKLWZUZg==" },
  { name: "초당대학교", region: "전남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5Kclc4VmF8TEpmJSY6JkotZlRm" },
  { name: "총신대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVyV8JnJXYXxMSmYlJjomSi1mVGY=" },
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
  { name: "한국기술교육대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KfExgMDhgfWE5SmYlJjomSi1mVGY=" },
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
  { name: "협성대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5Kclc6Jmk6YnxKZiUmOiZKLWZUZg==" },
  { name: "호남대학교", region: "광주", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11690551.html" },
  { name: "호서대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYWAmYXxKZiUmOiZKLWZUZg==" },
  { name: "홍익대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11720711.html" },
  { name: "홍익대학교(세종)", region: "충남", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11720712.html" },
  { name: "화성의과학대학교", region: "경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11880401.html" },
  { name: "UNIST(울산과학기술원)", region: "울산", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KMCYlVzpKXiUmOiZKLWZUZg==" },
  { name: "광주과학기술원(GIST)", region: "광주", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KbzBlbyZlbyVlb3JlSl4lJjomSi1mVGY=" },
  { name: "대구경북과학기술원(DGIST)", region: "대구", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KMCYlclZKXiUmOiZKLWZUZg==" },
  { name: "한국과학기술원(KAIST)", region: "대전", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KMCYlODlKXiUmOiZKLWZUZg==" },
  { name: "한국에너지공과대학교(KENTECH)", region: "전남", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KfExgMFdgOUpeJSY6JkotZlRm" },
];

/**
 * rowspan/colspan을 고려한 테이블 정규화 함수
 * 병합된 셀을 각 행에 복사하여 정규 2D 배열로 변환
 */
function normalizeTable(table) {
  const rows = table.querySelectorAll('tr');
  const normalizedRows = [];
  const rowspanTracker = {}; // 각 열의 rowspan 추적

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const cells = rows[rowIdx].querySelectorAll('th, td');
    const normalizedRow = [];
    let cellIdx = 0;
    let colIdx = 0;

    while (cellIdx < cells.length || rowspanTracker[colIdx]) {
      // rowspan으로 인해 이전 행에서 이월된 셀 처리
      if (rowspanTracker[colIdx] && rowspanTracker[colIdx].remaining > 0) {
        normalizedRow.push(rowspanTracker[colIdx].value);
        rowspanTracker[colIdx].remaining--;
        if (rowspanTracker[colIdx].remaining === 0) {
          delete rowspanTracker[colIdx];
        }
        colIdx++;
        continue;
      }

      if (cellIdx >= cells.length) break;

      const cell = cells[cellIdx];
      const text = cell.textContent.trim();
      const rowspan = parseInt(cell.getAttribute('rowspan') || '1');
      const colspan = parseInt(cell.getAttribute('colspan') || '1');

      // colspan 처리
      for (let c = 0; c < colspan; c++) {
        normalizedRow.push(text);

        // rowspan 처리
        if (rowspan > 1) {
          rowspanTracker[colIdx] = {
            value: text,
            remaining: rowspan - 1
          };
        }
        colIdx++;
      }
      cellIdx++;
    }

    normalizedRows.push(normalizedRow);
  }

  return normalizedRows;
}

/**
 * V5 개선된 데이터 추출 함수
 * - rowspan/colspan 완벽 처리
 * - 더 유연한 컬럼 감지
 * - 학과소개 등 추가 컬럼 처리
 */
async function extractRatioDataV5(page, universityName) {
  try {
    await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUT });
    await page.waitForTimeout(2500);

    const data = await page.evaluate((univName) => {
      const results = [];
      const tables = document.querySelectorAll('table');
      let currentAdmissionType = '전체';

      // rowspan/colspan 정규화 함수 (브라우저 내 실행)
      function normalizeTableInBrowser(table) {
        const rows = table.querySelectorAll('tr');
        const normalizedRows = [];
        const rowspanTracker = {};

        for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
          const cells = rows[rowIdx].querySelectorAll('th, td');
          const normalizedRow = [];
          let cellIdx = 0;
          let colIdx = 0;

          while (cellIdx < cells.length || Object.keys(rowspanTracker).some(k => parseInt(k) >= colIdx && rowspanTracker[k])) {
            // rowspan 처리
            while (rowspanTracker[colIdx] && rowspanTracker[colIdx].remaining > 0) {
              normalizedRow.push(rowspanTracker[colIdx].value);
              rowspanTracker[colIdx].remaining--;
              if (rowspanTracker[colIdx].remaining === 0) {
                delete rowspanTracker[colIdx];
              }
              colIdx++;
            }

            if (cellIdx >= cells.length) break;

            const cell = cells[cellIdx];
            const text = cell.textContent.trim();
            const rowspan = parseInt(cell.getAttribute('rowspan') || '1');
            const colspan = parseInt(cell.getAttribute('colspan') || '1');

            for (let c = 0; c < colspan; c++) {
              normalizedRow.push(text);
              if (rowspan > 1) {
                rowspanTracker[colIdx] = {
                  value: text,
                  remaining: rowspan - 1
                };
              }
              colIdx++;
            }
            cellIdx++;
          }

          normalizedRows.push(normalizedRow);
        }

        return normalizedRows;
      }

      // 컬럼 매핑 감지 함수
      function detectColumnMapping(headerRow) {
        const mapping = {};
        const headerTexts = headerRow.map(h => h.toLowerCase().replace(/\s+/g, ''));

        headerTexts.forEach((text, idx) => {
          // 대학/단과대학 컬럼
          if (text === '대학' || text.includes('단과대학') || text === '계열') {
            if (mapping.college === undefined) mapping.college = idx;
          }
          // 모집단위 컬럼
          if (text.includes('모집단위') || text === '학과' || text === '전공' || text === '학부') {
            if (mapping.department === undefined) mapping.department = idx;
          }
          // 전형 컬럼
          if ((text.includes('전형') && text.includes('명')) || text === '전형명') {
            mapping.admissionTypeName = idx;
          }
          if (text === '전형' || text === '전형유형') {
            mapping.admissionType = idx;
          }
          // 구분 컬럼
          if (text === '구분') {
            mapping.category = idx;
          }
          // 캠퍼스 컬럼
          if (text.includes('캠퍼스')) {
            mapping.campus = idx;
          }
          // 모집인원
          if ((text.includes('모집') && text.includes('인원')) || text === '모집인원' || text === '총모집인원') {
            mapping.recruitCount = idx;
          }
          // 지원인원
          if ((text.includes('지원') && (text.includes('인원') || text.includes('자수'))) || text === '지원인원' || text === '지원자수') {
            mapping.applyCount = idx;
          }
          // 경쟁률
          if (text.includes('경쟁률') || text === '경쟁률') {
            mapping.ratio = idx;
          }
        });

        return mapping;
      }

      // 경쟁률 패턴 확인
      function isRatioValue(text) {
        return /\d+\.?\d*\s*:\s*1/.test(text) || /^\d+\.?\d*$/.test(text);
      }

      // 페이지 제목에서 전형 정보 추출
      const h1 = document.querySelector('h1, h2, h3');
      if (h1) {
        const h1Text = h1.textContent.trim();
        if (h1Text.includes('전형') || h1Text.includes('경쟁률')) {
          currentAdmissionType = h1Text.replace(/경쟁률.*$/g, '').replace(/현황.*$/g, '').trim() || '전체';
        }
      }

      tables.forEach((table, tableIndex) => {
        // 테이블 앞의 헤더에서 전형명 찾기
        let prevEl = table.previousElementSibling;
        let searchCount = 0;
        while (prevEl && searchCount < 10) {
          const tagName = prevEl.tagName?.toLowerCase() || '';
          if (['h1', 'h2', 'h3', 'h4', 'h5', 'strong', 'b', 'p', 'div', 'span'].includes(tagName)) {
            const text = prevEl.textContent.trim();
            if (text.length < 100 && (text.includes('전형') || text.includes('경쟁률') || text.includes('현황'))) {
              currentAdmissionType = text
                .replace(/●|○|■|□|◆|◇|▶|▷|★|☆/g, '')
                .replace(/경쟁률.*$/g, '')
                .replace(/현황.*$/g, '')
                .trim() || currentAdmissionType;
              break;
            }
          }
          prevEl = prevEl.previousElementSibling;
          searchCount++;
        }

        // 테이블 정규화 (rowspan/colspan 처리)
        const normalizedRows = normalizeTableInBrowser(table);
        if (normalizedRows.length < 2) return;

        // 헤더 행 찾기
        let headerRowIndex = -1;
        let columnMap = {};

        for (let i = 0; i < Math.min(3, normalizedRows.length); i++) {
          const row = normalizedRows[i];
          const hasKeyColumn = row.some(t => {
            const lt = t.toLowerCase().replace(/\s+/g, '');
            return lt.includes('경쟁률') || lt.includes('모집인원') || lt.includes('지원인원');
          });

          if (hasKeyColumn) {
            headerRowIndex = i;
            columnMap = detectColumnMapping(row);
            break;
          }
        }

        if (headerRowIndex === -1) return;

        // 데이터 행 처리
        for (let i = headerRowIndex + 1; i < normalizedRows.length; i++) {
          const row = normalizedRows[i];
          if (row.length < 3) continue;

          // 합계/총계 행 건너뛰기
          const firstText = (row[0] || '').toLowerCase();
          if (firstText.includes('총계') || firstText.includes('합계') ||
              firstText.includes('소계') || firstText === '계' || firstText === '') {
            continue;
          }

          // 데이터 추출
          let department = '';
          let admissionType = currentAdmissionType;
          let campus = '';
          let college = '';
          let recruitCount = '';
          let applyCount = '';
          let ratio = '';

          // 컬럼 매핑 사용
          if (columnMap.college !== undefined) {
            college = row[columnMap.college] || '';
          }
          if (columnMap.department !== undefined) {
            department = row[columnMap.department] || '';
          }
          if (columnMap.admissionTypeName !== undefined) {
            const val = row[columnMap.admissionTypeName] || '';
            if (val && val.length < 50) {
              if (!department) {
                department = val;
              } else {
                admissionType = val;
              }
            }
          }
          if (columnMap.admissionType !== undefined) {
            admissionType = row[columnMap.admissionType] || currentAdmissionType;
          }
          if (columnMap.category !== undefined && !department) {
            department = row[columnMap.category] || '';
          }
          if (columnMap.campus !== undefined) {
            campus = row[columnMap.campus] || '';
          }
          if (columnMap.recruitCount !== undefined) {
            recruitCount = row[columnMap.recruitCount] || '';
          }
          if (columnMap.applyCount !== undefined) {
            applyCount = row[columnMap.applyCount] || '';
          }
          if (columnMap.ratio !== undefined) {
            ratio = row[columnMap.ratio] || '';
          }

          // 컬럼 매핑이 불완전한 경우 역순 추론
          if (!ratio) {
            for (let j = row.length - 1; j >= 0; j--) {
              if (isRatioValue(row[j])) {
                ratio = row[j];
                // 경쟁률 앞의 숫자들을 지원인원, 모집인원으로 추론
                if (!applyCount && j > 0) {
                  const prevVal = row[j - 1].replace(/,/g, '');
                  if (/^\d+$/.test(prevVal)) {
                    applyCount = row[j - 1];
                    if (!recruitCount && j > 1) {
                      const prevPrevVal = row[j - 2].replace(/,/g, '');
                      if (/^\d+$/.test(prevPrevVal)) {
                        recruitCount = row[j - 2];
                      }
                    }
                  }
                }
                break;
              }
            }
          }

          // 모집단위가 없으면 첫 번째 텍스트 컬럼 사용
          if (!department) {
            for (let j = 0; j < row.length; j++) {
              const val = row[j];
              if (val && !/^\d+$/.test(val.replace(/,/g, '')) && !isRatioValue(val) && val.length < 50) {
                department = val;
                break;
              }
            }
          }

          // 경쟁률 형식 정규화
          if (ratio && !/:\s*1/.test(ratio) && /^\d+\.?\d*$/.test(ratio)) {
            ratio = ratio + ' : 1';
          }

          // 경쟁률이 없으면 직접 계산
          if (!ratio || ratio === '-') {
            const recruit = parseInt((recruitCount || '0').toString().replace(/,/g, ''));
            const apply = parseInt((applyCount || '0').toString().replace(/,/g, ''));
            if (recruit > 0 && apply > 0) {
              ratio = (apply / recruit).toFixed(2) + ' : 1';
            }
          }

          // 유효한 데이터 추가
          if (ratio && department && ratio !== '-' && ratio !== '0 : 1') {
            // 단과대학이 있으면 캠퍼스로 사용하거나 모집단위 앞에 추가
            let finalCampus = campus;
            if (college && !finalCampus) {
              finalCampus = college;
            }

            results.push({
              대학명: univName,
              캠퍼스: finalCampus,
              전형명: admissionType,
              모집단위: department,
              모집인원: (recruitCount || '').toString().replace(/,/g, ''),
              지원인원: (applyCount || '').toString().replace(/,/g, ''),
              경쟁률: ratio
            });
          }
        }
      });

      // 중복 제거
      const uniqueResults = [];
      const seen = new Set();
      for (const item of results) {
        const key = `${item.전형명}|${item.모집단위}|${item.경쟁률}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueResults.push(item);
        }
      }

      return uniqueResults;
    }, universityName);

    return data;
  } catch (error) {
    console.error(`  데이터 추출 오류: ${error.message}`);
    return [];
  }
}

/**
 * 서울대학교 크롤링 (입학처 공지 페이지)
 */
async function crawlSNU(browser) {
  console.log('[서울대학교] 입학처 공지 페이지 확인...');
  console.log('[서울대학교] ⚠ PDF 형식으로 경쟁률 공개 - 자동 크롤링 불가');
  console.log('[서울대학교] ℹ URL: https://admission.snu.ac.kr/undergraduate/notice');
  // 서울대는 PDF로 경쟁률을 공개하므로 자동 크롤링이 어려움
  // 별도로 PDF를 파싱하거나 수동 입력 필요
  return [{
    대학명: '서울대학교',
    캠퍼스: '',
    전형명: '(PDF 확인 필요)',
    모집단위: '입학처 공지 참조',
    모집인원: '-',
    지원인원: '-',
    경쟁률: '-'
  }];
}

/**
 * 단일 대학 크롤링
 */
async function crawlUniversity(browser, university, index, total) {
  if (university.type === 'snu') {
    return await crawlSNU(browser);
  }

  if (university.note === '데이터 미공개') {
    process.stdout.write(`[${index + 1}/${total}] ${university.name}... `);
    console.log('⚠ 데이터 미공개');
    return [];
  }

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
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
      waitUntil: 'networkidle'
    });

    // 프레임이 있는지 확인
    const frames = page.frames();
    let targetPage = page;

    if (frames.length > 1) {
      for (const frame of frames) {
        const frameUrl = frame.url();
        if (frameUrl.includes('ratio') && !frameUrl.includes('power')) {
          targetPage = frame;
          break;
        }
      }
    }

    const data = await extractRatioDataV5(targetPage, university.name);

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
function saveToExcel(data, filename, universities) {
  const filepath = path.join(__dirname, filename);
  const wb = XLSX.utils.book_new();

  // 상세 데이터 시트
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 40 }, { wch: 35 }, { wch: 10 }, { wch: 10 }, { wch: 15 }
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
  const failedUnis = universities.filter(u => {
    if (u.type === 'snu') return false; // 서울대는 별도 표시
    if (u.note === '데이터 미공개') return false;
    return !summaryByUni[u.name];
  }).map(u => ({
    대학명: u.name,
    지역: u.region,
    설립유형: u.establishType,
    비고: u.note || '',
    URL: u.ratioUrl
  }));

  if (failedUnis.length > 0) {
    const wsFailed = XLSX.utils.json_to_sheet(failedUnis);
    wsFailed['!cols'] = [
      { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 80 }
    ];
    XLSX.utils.book_append_sheet(wb, wsFailed, '크롤링실패_대학');
  }

  // 특이사항 시트
  const specialCases = [
    { 대학명: '서울대학교', 비고: 'PDF 형식 공개', URL: 'https://admission.snu.ac.kr/undergraduate/notice' },
    { 대학명: '순천향대학교', 비고: '데이터 미공개', URL: 'http://ratio.uwayapply.com/Sl5KfExmSmYlJjomSi1mVGY=' }
  ];
  const wsSpecial = XLSX.utils.json_to_sheet(specialCases);
  wsSpecial['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsSpecial, '특이사항');

  XLSX.writeFile(wb, filepath);
  console.log(`\n엑셀 파일 저장됨: ${filepath}`);
  return filepath;
}

/**
 * 메인 함수
 */
async function main() {
  console.log('='.repeat(70));
  console.log('UWAY 수시 경쟁률 Playwright 크롤링 V5 (완벽한 크롤러)');
  console.log('- rowspan/colspan 완벽 처리 (남서울대학교 등)');
  console.log('- 더 유연한 컬럼 감지 알고리즘');
  console.log('- 학과소개 등 추가 컬럼이 있는 테이블 처리');
  console.log('- 다양한 테이블 구조 완벽 대응');
  console.log('- 서울대학교 별도 처리 (PDF 공지)');
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
      } else if (uni.type !== 'snu' && uni.note !== '데이터 미공개') {
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

  const totalCrawlable = validUniversities.filter(u => u.type !== 'snu' && u.note !== '데이터 미공개').length;
  const successRate = (successCount / totalCrawlable * 100).toFixed(1);
  console.log(`성공률: ${successRate}% (${successCount}/${totalCrawlable})`);

  if (allData.length > 0) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `UWAY_수시_경쟁률_V5_${timestamp}.xlsx`;
    saveToExcel(allData, filename, validUniversities);
  }

  console.log('='.repeat(70));
  console.log('완료');
  console.log('='.repeat(70));
}

main().catch(console.error);
