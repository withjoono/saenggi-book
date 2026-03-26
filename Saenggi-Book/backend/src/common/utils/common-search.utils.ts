// @ts-nocheck
import { CommonSearchQueryDto } from '../dtos/common-search-query.dto';

interface SearchParams {
  page: number;
  pageSize: number;
  search?: string;
  searchSort?: {
    field: string;
    sort: 'ASC' | 'DESC';
  };
}

export class CommonSearchUtils {
  /**
   * 검색 쿼리 DTO를 TypeORM 쿼리 파라미터 맵으로 변환
   *
   * @param commonSearchQueryDto - 검색 파라미터를 포함하는 검색 쿼리 DTO
   * @param repository - 엔티티 필드 값들을 얻기 위해 사용하는 TypeORM 리포지토리
   * @returns 페이지네이션, 검색 필터 및 정렬을 포함한 검색 파라미터 맵.
   */
  static convertRequestDtoToMapForSearch(
    commonSearchQueryDto: CommonSearchQueryDto,
    repository: Repository<any>,
  ): SearchParams {
    const param: SearchParams = {
      page: commonSearchQueryDto.page ?? 1, // 기본 페이지 번호는 1
      pageSize: commonSearchQueryDto.pageSize ?? 10, // 기본 페이지 크기는 10
    };

    // 엔티티 메타데이터를 가져와서 컬럼 이름을 검증합니다.
    const metadata = repository.metadata;
    const columns = metadata.columns.map((col) => col.propertyName); // 엔티티의 모든 컬럼 목록

    // 검색 필터링 처리
    if (commonSearchQueryDto.searchKey && commonSearchQueryDto.searchWord) {
      const searchKeys = commonSearchQueryDto.searchKey.split(',');
      const searchWord = commonSearchQueryDto.searchWord;
      const validSearchKeys = searchKeys.filter((key) => columns.includes(key.trim()));
      if (validSearchKeys.length > 0) {
        const search = validSearchKeys
          .map((field) => `${field.trim()} LIKE '%${searchWord}%'`)
          .join(' OR ');
        param.search = `(${search})`; // 검색 쿼리 구성
      }
    }
    // 정렬 처리
    if (commonSearchQueryDto.searchSort) {
      const field = commonSearchQueryDto.searchSort.field;
      const sort = commonSearchQueryDto.searchSort.sort.toUpperCase();
      if (columns.includes(field) && (sort === 'ASC' || sort === 'DESC')) {
        param.searchSort = {
          field,
          sort,
        };
      }
    }

    return param;
  }
}
