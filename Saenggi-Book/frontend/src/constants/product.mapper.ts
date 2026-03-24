import { IProduct } from "@/stores/server/features/products/interfaces";

export const mapProductsToPlans = (products: IProduct[]) => {
  const susiServices = products
    .filter(
      (product) =>
        product.productCateCode === "S" &&
        product.productTypeCode === "FIXEDTERM",
    )
    .map((product) => ({
      id: product.id,
      title: product.productNm,
      price: Number(product.productPrice),
      description:
        Number(product.id) === 37
          ? "고2를 위한 서비스 이용권입니다. 수시/정시 예측 서비스와 동일하며 내 생기부에 기록된 성적만으로 유리한 대학을 찾습니다."
          : '교과/학종/논술/정시 탭의 서비스를 이용할 수 있으며 "학종" 탭의 경우 평가된 생기부가 필요합니다. (자가평가 or 생기부 분석 서비스)',
      features: [
        "나의 생기부로 가장 유리한 대학 찾기",
        "단계별 필터링 시스템으로 최적 조합 찾기",
      ],
      actionLabel: "구매하기",
      footerLabel: product.term
        ? `구매일로부터 ${new Date(product.term).toLocaleDateString()}까지`
        : "",
      serviceRange: product.serviceRangeCode,
    }));

  const susiServicePackage = products
    .filter(
      (product) =>
        product.productCateCode === "S" &&
        product.productTypeCode === "PACKAGE",
    )
    .map((product) => ({
      id: product.id,
      title: product.productNm,
      price: Number(product.productPrice),
      description:
        "수시/정시 예측 서비스와 생기부 평가 1회권을 이용할 수 있습니다.",
      features: [
        "나의 생기부로 가장 유리한 대학 찾기",
        "단계별 필터링 시스템으로 최적 조합 찾기",
        "전직입사관 생기부 평가 1회 이용권",
      ],
      actionLabel: "구매하기",
      footerLabel: product.term
        ? `구매일로부터 ${new Date(product.term).toLocaleDateString()}까지`
        : "",
      popular: true,
      serviceRange: product.serviceRangeCode,
    }));

  const susiTickets = products
    .filter(
      (product) =>
        product.productCateCode === "S" &&
        product.productTypeCode === "TICKET",
    )
    .map((product) => ({
      id: product.id,
      title: product.productNm,
      price: Number(product.productPrice),
      description:
        "전직 입사관 출신의 선생님들이 나의 생기부를 평가한 후 꼼꼼한 조언을 해드립니다.",
      features: ["전직입사관 생기부 평가 1회 이용권"],
      actionLabel: "구매하기",
      footerLabel: "횟수권",
      serviceRange: product.serviceRangeCode,
    }));

  const plansConsulting = products
    .filter((product) => product.productCateCode === "C")
    .map((product) => ({
      id: product.id,
      title: product.productNm,
      price: Number(product.productPrice),
      description:
        "수시/정시 예측 서비스와 생기부 평가 1회권을 이용할 수 있습니다.",
      features: [
        "나의 생기부로 가장 유리한 대학 찾기",
        "단계별 필터링 시스템으로 최적 조합 찾기",
        "전직입사관 생기부 평가 1회 이용권",
        "(비)대면 수시 컨설팅 서비스",
      ],
      actionLabel: "구매하기",
      footerLabel: product.term
        ? `구매일로부터 ${new Date(product.term).toLocaleDateString()}까지`
        : "",
      serviceRange: product.serviceRangeCode,
    }));

  return { susiServices, susiTickets, susiServicePackage, plansConsulting };
};
