/**
 * UWAY 수시 경쟁률 Playwright 기반 크롤링 스크립트
 * info.uway.com에서 모든 대학의 경쟁률 데이터 수집
 */

const { chromium } = require('playwright');
const XLSX = require('xlsx');
const path = require('path');

// 설정
const TIMEOUT = 30000;
const DELAY_BETWEEN_REQUESTS = 500;

// 대학 목록 (info.uway.com에서 수집)
const UNIVERSITIES = [
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
  { name: "경희대학교", region: "서울/경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSmZKOnw5SmYlJjomSi1mVGY%3D" },
  { name: "계명대학교", region: "대구", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOk05SmYlJjomSi1mVGY=" },
  { name: "고려대학교(서울)", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOGB9YTlKZiUmOiZKLWZUZg%3D%3D" },
  { name: "고려대학교(세종)", region: "세종", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KcldhL2AmOzhgfWE5SmYlJjomSi1mVGY=" },
  { name: "고신대학교", region: "부산", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KVyUmYTlKZiUmOiZKLWZUZg%3D%3D" },
  { name: "공주교육대학교", region: "충남", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KYDY6L3JXYTlKZiUmOiZKLWZUZg%3D%3D" },
  { name: "광운대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KTjlKZiUmOiZKLWZUZg==" },
  { name: "광주교육대학교", region: "광주", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KYDY6L3JXOE45SmYlJjomSi1mVGY%3D" },
  { name: "광주대학교", region: "광주", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOi9yVzhOckpmJSY6JkotZlRm" },
  { name: "광주여자대학교", region: "광주", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOk45SmYlJjomSi1mVGY%3D" },
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
  { name: "금강대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOnJySmYlJjomSi1mVGY%3D" },
  { name: "김천대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio40330551.html" },
  { name: "나사렛대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOld9YTlKZiUmOiZKLWZUZg==" },
  { name: "남부대학교", region: "광주", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOkJNOFdKZiUmOiZKLWZUZg==" },
  { name: "남서울대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KQzphYCZNOFdKZiUmOiZKLWZUZg==" },
  { name: "단국대학교", region: "경기/충남", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10420391.html" },
  { name: "대구가톨릭대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10460911.html" },
  { name: "대구교육대학교", region: "대구", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYDpXVkpmJSY6JkotZlRm" },
  { name: "대구대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10440731.html" },
  { name: "대구예술대학교", region: "경북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOjgwSmYlJjomSi1mVGY%3D" },
  { name: "대구한의대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10160641.html" },
  { name: "대신대학교", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10480221.html" },
  { name: "대전대학교", region: "대전", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10500891.html" },
  { name: "대진대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVyUvYDhWSmYlJjomSi1mVGY=" },
  { name: "덕성여자대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10530541.html" },
  { name: "동국대학교(WISE)", region: "경북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10540571.html" },
  { name: "동국대학교(서울)", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10550451.html" },
  { name: "동덕여자대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOTpWcldhVkpmJSY6JkotZlRm" },
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
  { name: "서울시립대학교", region: "서울", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KJmE6SmYlJjomSi1mVGY%3D" },
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
  { name: "송원대학교", region: "광주", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KV2FOcldhJkpmJSY6JkotZlRm" },
  { name: "수원대학교", region: "경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10970401.html" },
  { name: "숙명여자대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio10981151.html" },
  { name: "순천향대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KfExmSmYlJjomSi1mVGY=" },
  { name: "숭실대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11010661.html" },
  { name: "신라대학교", region: "부산", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11020541.html" },
  { name: "아주대학교", region: "경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11040601.html" },
  { name: "안양대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5Kclc4Ylc4SmYlJjomSi1mVGY=" },
  { name: "연세대학교(미래)", region: "강원", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KZiVgJldhYkpmJSY6JkotZlRm" },
  { name: "연세대학교(서울)", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11080671.html" },
  { name: "영남대학교", region: "경북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOmJKZiUmOiZKLWZUZg%3D%3D" },
  { name: "영산대학교", region: "경남/부산", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio30100251.html" },
  { name: "예수대학교", region: "전북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOmlNSmYlJjomSi1mVGY=" },
  { name: "용인대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVyVyV2FiSmYlJjomSi1mVGY=" },
  { name: "우석대학교", region: "전북/충북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11150541.html" },
  { name: "우송대학교", region: "대전", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KcldhJmFhTkpmJSY6JkotZlRm" },
  { name: "울산대학교", region: "울산", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KVzgmQzpKZiUmOiZKLWZUZg%3D%3D" },
  { name: "원광대학교", region: "전북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5Kclc4TjlXYU5KZiUmOiZKLWZUZg==" },
  { name: "을지대학교", region: "대전", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11190571.html" },
  { name: "이화여자대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11201541.html" },
  { name: "인제대학교", region: "경남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYC9XJUpmJSY6JkotZlRm" },
  { name: "인천가톨릭대학교", region: "인천", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOkxMJUpmJSY6JkotZlRm" },
  { name: "인천대학교", region: "인천", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11230591.html" },
  { name: "인하대학교", region: "인천/경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOHxXJUpmJSY6JkotZlRm" },
  { name: "장로회신학대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KJjBMaUpmJSY6JkotZlRm" },
  { name: "전남대학교", region: "광주", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOlcvSmYlJjomSi1mVGY=" },
  { name: "전북대학교", region: "전북", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOldCL0pmJSY6JkotZlRm" },
  { name: "전주교육대학교", region: "전북", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYDpXL0pmJSY6JkotZlRm" },
  { name: "전주대학교", region: "전북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOi9XYWAvSmYlJjomSi1mVGY%3D" },
  { name: "제주대학교", region: "제주", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOlc6L2AvSmYlJjomSi1mVGY=" },
  { name: "조선대학교", region: "광주", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11300471.html" },
  { name: "중부대학교", region: "충남", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11310831.html" },
  { name: "중앙대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOjhMSmYlJjomSi1mVGY%3D" },
  { name: "중원대학교", region: "충북", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11920221.html" },
  { name: "진주교육대학교", region: "경남", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYDpMSmYlJjomSi1mVGY=" },
  { name: "차의과학대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KOHxMSmYlJjomSi1mVGY%3D" },
  { name: "청운대학교", region: "충남/인천", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KV2FhTnJXOnxMSmYlJjomSi1mVGY=" },
  { name: "청주교육대학교", region: "충북", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio20100291.html" },
  { name: "청주대학교", region: "충북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOi9yV2FgfExKZiUmOiZKLWZUZg==" },
  { name: "초당대학교", region: "전남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5Kclc4VmF8TEpmJSY6JkotZlRm" },
  { name: "총신대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KVyV8JnJXYXxMSmYlJjomSi1mVGY%3D" },
  { name: "추계예술대학교", region: "서울", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KYGJyOnxMSmYlJjomSi1mVGY%3D" },
  { name: "춘천교육대학교", region: "강원", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio20110281.html" },
  { name: "충남대학교", region: "대전", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11400411.html" },
  { name: "충북대학교", region: "충북", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11410781.html" },
  { name: "칼빈대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KVyVEQzhMSmYlJjomSi1mVGY=" },
  { name: "평택대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KOjBpSmYlJjomSi1mVGY=" },
  { name: "포항공과대학교", region: "경북", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KfExgMCZhaUpmJSY6JkotZlRm" },
  { name: "한경국립대학교", region: "경기", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio30160991.html" },
  { name: "한국공학대학교", region: "경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio30170591.html" },
  { name: "한국교원대학교", region: "충북", establishType: "국·공립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11480351.html" },
  { name: "한국기술교육대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KfExgMDhgfWE5SmYlJjomSi1mVGY%3D" },
  { name: "한국외국어대학교", region: "서울/경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KJmg6fEpmJSY6JkotZlRm" },
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
  { name: "협성대학교", region: "경기", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5Kclc6Jmk6YnxKZiUmOiZKLWZUZg%3D%3D" },
  { name: "호남대학교", region: "광주", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11690551.html" },
  { name: "호서대학교", region: "충남", establishType: "사립", ratioUrl: "http://ratio.uwayapply.com/Sl5KYWAmYXxKZiUmOiZKLWZUZg==" },
  { name: "홍익대학교", region: "서울", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11720711.html" },
  { name: "홍익대학교(세종)", region: "충남", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11720712.html" },
  { name: "화성의과학대학교", region: "경기", establishType: "사립", ratioUrl: "http://addon.jinhakapply.com/RatioV1/RatioH/Ratio11880401.html" },
  { name: "UNIST(울산과학기술원)", region: "울산", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KMCYlVzpKXiUmOiZKLWZUZg==" },
  { name: "광주과학기술원(GIST)", region: "광주", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/power/?ratioURL=%2F%2Fratio.uwayapply.com%2FSl5KbzBlbyZlbyVlb3JlSl4lJjomSi1mVGY%3D" },
  { name: "대구경북과학기술원(DGIST)", region: "대구", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KMCYlclZKXiUmOiZKLWZUZg==" },
  { name: "한국과학기술원(KAIST)", region: "대전", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KMCYlODlKXiUmOiZKLWZUZg==" },
  { name: "한국에너지공과대학교(KENTECH)", region: "전남", establishType: "국·공립", ratioUrl: "http://ratio.uwayapply.com/Sl5KfExgMFdgOUpeJSY6JkotZlRm" },
];

/**
 * 페이지에서 경쟁률 데이터 추출
 */
async function extractRatioData(page, universityName) {
  try {
    // 페이지 로드 대기
    await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUT });
    await page.waitForTimeout(1000);

    // 데이터 추출
    const data = await page.evaluate((univName) => {
      const results = [];

      // 모든 테이블 찾기
      const tables = document.querySelectorAll('table');
      let currentAdmissionType = '';

      // h2, h3, strong 태그에서 전형명 추출하는 함수
      const findAdmissionType = (element) => {
        let sibling = element.previousElementSibling;
        while (sibling) {
          const tagName = sibling.tagName.toLowerCase();
          if (tagName === 'h2' || tagName === 'h3') {
            const text = sibling.textContent.trim();
            if (text.includes('경쟁률') || text.includes('전형')) {
              return text.replace(/\s*경쟁률\s*현황\s*/g, '').trim();
            }
          }
          sibling = sibling.previousElementSibling;
        }
        return '';
      };

      tables.forEach((table, tableIndex) => {
        // 전형명 찾기
        const admissionType = findAdmissionType(table) || `전형${tableIndex + 1}`;

        const rows = table.querySelectorAll('tr');
        rows.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 4) {
            // 경쟁률 패턴 확인 (X.XX : 1 또는 X : 1)
            const lastCellText = cells[cells.length - 1].textContent.trim();
            if (lastCellText.includes(':') && lastCellText.includes('1')) {
              // 헤더 및 합계 행 제외
              const firstCellText = cells[0].textContent.trim();
              if (firstCellText !== '모집단위' && firstCellText !== '대학' &&
                  firstCellText !== '전형명' && firstCellText !== '총계' &&
                  firstCellText !== '합계' && !firstCellText.includes('계')) {

                let department, recruitCount, applyCount, ratio;

                if (cells.length >= 5) {
                  // 5컬럼: 단과대학, 모집단위, 모집인원, 지원인원, 경쟁률
                  department = cells[1].textContent.trim();
                  recruitCount = cells[2].textContent.trim();
                  applyCount = cells[3].textContent.trim();
                  ratio = cells[4].textContent.trim();
                } else {
                  // 4컬럼: 모집단위, 모집인원, 지원인원, 경쟁률
                  department = cells[0].textContent.trim();
                  recruitCount = cells[1].textContent.trim();
                  applyCount = cells[2].textContent.trim();
                  ratio = cells[3].textContent.trim();
                }

                results.push({
                  대학명: univName,
                  전형명: admissionType,
                  모집단위: department,
                  모집인원: recruitCount.replace(/,/g, ''),
                  지원인원: applyCount.replace(/,/g, ''),
                  경쟁률: ratio
                });
              }
            }
          }
        });
      });

      return results;
    }, universityName);

    return data;
  } catch (error) {
    console.error(`  데이터 추출 오류: ${error.message}`);
    return [];
  }
}

/**
 * 단일 대학 크롤링
 */
async function crawlUniversity(browser, university, index, total) {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  try {
    process.stdout.write(`[${index + 1}/${total}] ${university.name}... `);

    await page.goto(university.ratioUrl, {
      timeout: TIMEOUT,
      waitUntil: 'domcontentloaded'
    });

    const data = await extractRatioData(page, university.name);

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

  XLSX.writeFile(wb, filepath);
  console.log(`\n엑셀 파일 저장됨: ${filepath}`);
  return filepath;
}

/**
 * 메인 함수
 */
async function main() {
  console.log('='.repeat(70));
  console.log('UWAY 수시 경쟁률 Playwright 크롤링 시작');
  console.log('='.repeat(70));

  // 유효한 URL만 필터링
  const validUniversities = UNIVERSITIES.filter(u =>
    u.ratioUrl && !u.ratioUrl.includes('javascript:void')
  );

  console.log(`\n총 ${validUniversities.length}개 대학 크롤링 시작`);
  console.log('='.repeat(70));

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
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

    // 요청 간 딜레이
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
  }

  await browser.close();

  console.log('='.repeat(70));
  console.log(`\n크롤링 완료: 성공 ${successCount}, 실패 ${errorCount}`);
  console.log(`총 ${allData.length}개 데이터 수집됨`);

  if (allData.length > 0) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `UWAY_수시_경쟁률_Playwright_${timestamp}.xlsx`;
    saveToExcel(allData, filename);
  }

  console.log('='.repeat(70));
  console.log('완료');
  console.log('='.repeat(70));
}

// 실행
main().catch(console.error);
