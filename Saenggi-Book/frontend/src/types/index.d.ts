export {};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    naver: any; // Naver SDK - 외부 라이브러리, 타입 정의 없음
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    IMP: any; // Iamport Payment SDK - 외부 라이브러리, 타입 정의 없음
  }
}
