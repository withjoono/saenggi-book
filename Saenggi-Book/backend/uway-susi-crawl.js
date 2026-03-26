const XLSX = require('xlsx');
const fs = require('fs');

// 크롤링된 수시 대학 데이터 (2026학년도)
const susiUniversities = [
  {"status":"접수마감","type":"4년제 수시","region":"경남","establishment":"사립","name":"가야대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"가천대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"강원","establishment":"사립","name":"가톨릭관동대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충북","establishment":"사립","name":"가톨릭꽃동네대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"가톨릭대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"감리교신학대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"강남대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"강서대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"강원","establishment":"국·공립","name":"강원대학교(강릉캠퍼스,원주캠퍼스)","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"강원","establishment":"국·공립","name":"강원대학교(춘천,삼척캠퍼스)","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"건국대학교(서울)","period":"2025.09.09 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충북","establishment":"사립","name":"건국대학교(글로컬)","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충남","establishment":"사립","name":"건양대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기/서울","establishment":"사립","name":"경기대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경남","establishment":"사립","name":"경남대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기/강원","establishment":"사립","name":"경동대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"대구","establishment":"국·공립","name":"경북대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경남","establishment":"국·공립","name":"경상국립대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"부산","establishment":"사립","name":"경성대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경북","establishment":"사립","name":"경운대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"인천","establishment":"국·공립","name":"경인교육대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경북","establishment":"사립","name":"경일대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울/경기","establishment":"사립","name":"경희대학교","period":"2025.09.09 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"대구","establishment":"사립","name":"계명대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"고려대학교(서울)","period":"2025.09.08 ~ 2025.09.10","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"세종","establishment":"사립","name":"고려대학교(세종)","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"부산","establishment":"사립","name":"고신대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충남","establishment":"국·공립","name":"공주교육대학교","period":"2025.09.09 ~ 2025.09.11","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"광주","establishment":"사립","name":"광신대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"준비중","hasRateButton":false},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"광운대학교","period":"2025.09.09 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"광주","establishment":"국·공립","name":"광주교육대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"광주","establishment":"사립","name":"광주대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"광주","establishment":"사립","name":"광주여자대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경북","establishment":"국·공립","name":"국립경국대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충남","establishment":"국·공립","name":"국립공주대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전북","establishment":"국·공립","name":"국립군산대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경북","establishment":"국·공립","name":"국립금오공과대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전남","establishment":"국·공립","name":"국립목포대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전남","establishment":"국·공립","name":"국립목포해양대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"부산","establishment":"국·공립","name":"국립부경대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전남","establishment":"국·공립","name":"국립순천대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경남","establishment":"국·공립","name":"국립창원대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충북","establishment":"국·공립","name":"국립한국교통대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"부산","establishment":"국·공립","name":"국립한국해양대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"대전","establishment":"국·공립","name":"국립한밭대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"국민대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충북","establishment":"사립","name":"극동대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충남","establishment":"사립","name":"금강대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경북","establishment":"사립","name":"김천대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충남","establishment":"사립","name":"나사렛대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"광주","establishment":"사립","name":"남부대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충남","establishment":"사립","name":"남서울대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기/충남","establishment":"사립","name":"단국대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경북","establishment":"사립","name":"대구가톨릭대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"대구","establishment":"국·공립","name":"대구교육대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경북","establishment":"사립","name":"대구대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경북","establishment":"사립","name":"대구예술대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경북","establishment":"사립","name":"대구한의대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경북","establishment":"사립","name":"대신대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"대전","establishment":"사립","name":"대전대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"대진대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"덕성여자대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경북","establishment":"사립","name":"동국대학교(WISE)","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"동국대학교(서울)","period":"2025.09.10 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"동덕여자대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"부산","establishment":"사립","name":"동명대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"부산","establishment":"사립","name":"동서대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전남","establishment":"사립","name":"동신대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"부산","establishment":"사립","name":"동아대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기/경북","establishment":"사립","name":"동양대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"부산","establishment":"사립","name":"동의대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"루터대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울/경기","establishment":"사립","name":"명지대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"대전","establishment":"사립","name":"목원대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전남","establishment":"사립","name":"목포가톨릭대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"대전","establishment":"사립","name":"배재대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충남","establishment":"사립","name":"백석대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"부산","establishment":"사립","name":"부산가톨릭대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"부산","establishment":"국·공립","name":"부산교육대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"부산","establishment":"국·공립","name":"부산대학교","period":"2025.09.09 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"부산","establishment":"사립","name":"부산외국어대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경남","establishment":"사립","name":"부산장신대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"준비중","hasRateButton":false},
  {"status":"접수마감","type":"4년제 수시","region":"서울/충남","establishment":"사립","name":"상명대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"강원","establishment":"사립","name":"상지대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"서강대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"서경대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"국·공립","name":"서울과학기술대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"국·공립","name":"서울교육대학교","period":"2025.09.09 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"서울기독대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"국·공립","name":"서울대학교","period":"2025.09.08 ~ 2025.09.10","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"국·공립","name":"서울시립대학교","period":"2025.09.08 ~ 2025.09.11","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"서울신학대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"서울여자대학교","period":"2025.09.09 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"서울장신대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"서울한영대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충북","establishment":"사립","name":"서원대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충남","establishment":"사립","name":"선문대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"성결대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"성공회대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"성균관대학교","period":"2025.09.09 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"성신여자대학교","period":"2025.09.08 ~ 2025.09.11","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충북","establishment":"사립","name":"세명대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"세종대학교","period":"2025.09.09 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전남/충남","establishment":"사립","name":"세한대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"광주","establishment":"사립","name":"송원대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"수원대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"숙명여자대학교","period":"2025.09.09 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충남","establishment":"사립","name":"순천향대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"숭실대학교","period":"2025.09.09 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경북","establishment":"사립","name":"신경주대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"준비중","hasRateButton":false},
  {"status":"접수마감","type":"4년제 수시","region":"부산","establishment":"사립","name":"신라대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"아신대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"아주대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"안양대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"강원","establishment":"사립","name":"연세대학교(미래)","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"연세대학교(서울)","period":"2025.09.09 ~ 2025.09.11","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경북","establishment":"사립","name":"영남대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경남/부산","establishment":"사립","name":"영산대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전북","establishment":"사립","name":"예수대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전북","establishment":"사립","name":"예원예술대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"준비중","hasRateButton":false},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"용인대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전북/충북","establishment":"사립","name":"우석대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"대전","establishment":"사립","name":"우송대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"울산","establishment":"사립","name":"울산대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전북","establishment":"사립","name":"원광대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충북/충남","establishment":"사립","name":"유원대학교(U1대학교)","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"대전","establishment":"사립","name":"을지대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"이화여자대학교","period":"2025.09.09 ~ 2025.09.11","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경남","establishment":"사립","name":"인제대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"인천","establishment":"사립","name":"인천가톨릭대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"인천","establishment":"국·공립","name":"인천대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"인천/경기","establishment":"사립","name":"인하대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"장로회신학대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"광주","establishment":"국·공립","name":"전남대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전북","establishment":"국·공립","name":"전북대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전북","establishment":"국·공립","name":"전주교육대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전북","establishment":"사립","name":"전주대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"제주","establishment":"사립","name":"제주국제대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"준비중","hasRateButton":false},
  {"status":"접수마감","type":"4년제 수시","region":"제주","establishment":"국·공립","name":"제주대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"광주","establishment":"사립","name":"조선대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충남","establishment":"사립","name":"중부대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"중앙대학교","period":"2025.09.09 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충북","establishment":"사립","name":"중원대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경남","establishment":"국·공립","name":"진주교육대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"차의과학대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경남","establishment":"사립","name":"창신대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충남/인천","establishment":"사립","name":"청운대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충북","establishment":"국·공립","name":"청주교육대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충북","establishment":"사립","name":"청주대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전남","establishment":"사립","name":"초당대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"총신대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"추계예술대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"강원","establishment":"국·공립","name":"춘천교육대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"대전","establishment":"국·공립","name":"충남대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충북","establishment":"국·공립","name":"충북대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"칼빈대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"평택대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경북","establishment":"사립","name":"포항공과대학교(POSTECH)","period":"2025.09.08 ~ 2025.09.10","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"국·공립","name":"한경국립대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"한국공학대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충북","establishment":"국·공립","name":"한국교원대학교","period":"2025.09.09 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충남","establishment":"사립","name":"한국기술교육대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"한국성서대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울/경기","establishment":"사립","name":"한국외국어대학교","period":"2025.09.09 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"국·공립","name":"한국체육대학교","period":"2025.09.09 ~ 2025.09.11","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"대전","establishment":"사립","name":"한국침례신학대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"대전","establishment":"사립","name":"한남대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경북","establishment":"사립","name":"한동대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"강원","establishment":"사립","name":"한라대학교(원주)","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"강원","establishment":"사립","name":"한림대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충남","establishment":"사립","name":"한서대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"한성대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"한세대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"한신대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"한양대학교(ERICA)","period":"2025.09.09 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"한양대학교(서울)","period":"2025.09.09 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전북","establishment":"사립","name":"한일장신대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"협성대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"광주","establishment":"사립","name":"호남대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"광주","establishment":"사립","name":"호남신학대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"준비중","hasRateButton":false},
  {"status":"접수마감","type":"4년제 수시","region":"충남","establishment":"사립","name":"호서대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"전북","establishment":"사립","name":"호원대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"준비중","hasRateButton":false},
  {"status":"접수마감","type":"4년제 수시","region":"서울","establishment":"사립","name":"홍익대학교(서울)","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"충남","establishment":"사립","name":"홍익대학교(세종)","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"4년제 수시","region":"경기","establishment":"사립","name":"화성의과학대학교","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true}
];

// 특수대학교 (과학기술원 등)
const specialUniversities = [
  {"status":"접수마감","type":"특수대학교","region":"울산","establishment":"국·공립","name":"UNIST(울산과학기술원)","period":"2025.09.04 ~ 2025.09.11","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"특수대학교","region":"광주","establishment":"국·공립","name":"광주과학기술원(GIST)","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"특수대학교","region":"대구","establishment":"국·공립","name":"대구경북과학기술원(DGIST)","period":"2025.09.04 ~ 2025.09.11","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"특수대학교","region":"대전","establishment":"국·공립","name":"한국과학기술원(KAIST)","period":"2025.09.02 ~ 2025.09.10","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"특수대학교","region":"전남","establishment":"국·공립","name":"한국에너지공과대학교(KENTECH)","period":"2025.09.08 ~ 2025.09.12","rateStatus":"경쟁률 보기","hasRateButton":true},
  {"status":"접수마감","type":"특수대학교","region":"충남","establishment":"국·공립","name":"한국전통문화대학교","period":"2025.09.08 ~ 2025.09.17","rateStatus":"준비중","hasRateButton":false}
];

// 모든 데이터 합치기
const allData = [...susiUniversities, ...specialUniversities];

// 엑셀용 데이터 포맷 변환
const excelData = allData.map((item, index) => ({
  '번호': index + 1,
  '접수상태': item.status,
  '구분': item.type,
  '지역': item.region,
  '설립': item.establishment,
  '대학명': item.name,
  '접수기간': item.period,
  '경쟁률상태': item.rateStatus,
  '경쟁률확인가능': item.hasRateButton ? 'O' : 'X'
}));

// 워크북 생성
const wb = XLSX.utils.book_new();

// 워크시트 생성
const ws = XLSX.utils.json_to_sheet(excelData);

// 컬럼 너비 설정
ws['!cols'] = [
  { wch: 5 },   // 번호
  { wch: 10 },  // 접수상태
  { wch: 12 },  // 구분
  { wch: 12 },  // 지역
  { wch: 10 },  // 설립
  { wch: 30 },  // 대학명
  { wch: 25 },  // 접수기간
  { wch: 12 },  // 경쟁률상태
  { wch: 15 }   // 경쟁률확인가능
];

// 워크시트 추가
XLSX.utils.book_append_sheet(wb, ws, '2026 수시 대학 목록');

// 통계 시트 추가
const stats = {
  '총 대학 수': allData.length,
  '4년제 수시 대학': susiUniversities.length,
  '특수대학교': specialUniversities.length,
  '경쟁률 확인 가능': allData.filter(d => d.hasRateButton).length,
  '준비중': allData.filter(d => !d.hasRateButton).length,
  '크롤링 일시': new Date().toLocaleString('ko-KR'),
  '데이터 출처': 'UWAY 파워경쟁률 (info.uway.com)'
};

const statsData = Object.entries(stats).map(([key, value]) => ({ '항목': key, '값': value }));
const statsWs = XLSX.utils.json_to_sheet(statsData);
statsWs['!cols'] = [{ wch: 20 }, { wch: 40 }];
XLSX.utils.book_append_sheet(wb, statsWs, '통계');

// 지역별 통계
const regionStats = {};
allData.forEach(item => {
  const region = item.region.split('/')[0]; // 복수 지역인 경우 첫번째만
  regionStats[region] = (regionStats[region] || 0) + 1;
});

const regionData = Object.entries(regionStats)
  .sort((a, b) => b[1] - a[1])
  .map(([region, count]) => ({ '지역': region, '대학수': count }));

const regionWs = XLSX.utils.json_to_sheet(regionData);
regionWs['!cols'] = [{ wch: 15 }, { wch: 10 }];
XLSX.utils.book_append_sheet(wb, regionWs, '지역별 통계');

// 파일 저장
const filename = `UWAY_수시_대학목록_${new Date().toISOString().slice(0, 10)}.xlsx`;
XLSX.writeFile(wb, filename);

console.log(`\n✅ 엑셀 파일 생성 완료: ${filename}`);
console.log(`\n📊 통계:`);
console.log(`   - 총 대학 수: ${allData.length}개`);
console.log(`   - 4년제 수시 대학: ${susiUniversities.length}개`);
console.log(`   - 특수대학교: ${specialUniversities.length}개`);
console.log(`   - 경쟁률 확인 가능: ${allData.filter(d => d.hasRateButton).length}개`);
console.log(`   - 준비중: ${allData.filter(d => !d.hasRateButton).length}개`);
