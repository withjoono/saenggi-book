/**
 * Excel Utility
 *
 * XLSX 라이브러리를 사용한 Excel 파일 파싱 유틸리티
 */

import * as XLSX from 'xlsx';

export class DoNotMatchColumnException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DoNotMatchColumnException';
  }
}

export class NotParserExcelUploadData extends Error {
  rowNo: number;
  cellIndex: number;

  constructor(rowNo: number, cellIndex: number, message: string) {
    super(`Row: ${rowNo}, Cell: ${cellIndex} - ${message}`);
    this.name = 'NotParserExcelUploadData';
    this.rowNo = rowNo;
    this.cellIndex = cellIndex;
  }
}

export class ExcelUtil {
  /**
   * 컬럼 인덱스를 키로 하여 Excel 데이터 파싱
   */
  static getRowData(buffer: Buffer, columnIndex: number): Map<number, string>[] {
    const result: Map<number, string>[] = [];

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    const rows = range.e.r + 1;

    for (let rowNo = 0; rowNo < rows; rowNo++) {
      const item = new Map<number, string>();
      let cellCount = 0;

      for (let cellIdx = 0; cellIdx <= columnIndex; cellIdx++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowNo, c: cellIdx });
        const cell = sheet[cellAddress];

        if (cell !== undefined) {
          cellCount++;
          const value = this.getCellValue(cell);
          item.set(cellIdx, value);
        }
      }

      if (cellCount > 0) {
        if (columnIndex !== cellCount) {
          throw new DoNotMatchColumnException(`Do not Match ${rowNo} rowNum`);
        }
        result.push(item);
      }
    }

    return result;
  }

  /**
   * 첫 번째 행(헤더)을 제외하고 Excel 데이터 파싱
   */
  static getRowDataExceptTopColumn(buffer: Buffer, columnIndex: number): Map<number, string>[] {
    const result: Map<number, string>[] = [];

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    const rows = range.e.r + 1;

    for (let rowNo = 1; rowNo < rows; rowNo++) {
      const item = new Map<number, string>();
      let cellCount = 0;

      for (let cellIdx = 0; cellIdx <= columnIndex; cellIdx++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowNo, c: cellIdx });
        const cell = sheet[cellAddress];

        if (cell !== undefined) {
          cellCount++;
          const value = this.getCellValue(cell);
          item.set(cellIdx, value);
        }
      }

      if (cellCount > 0) {
        if (columnIndex !== cellCount) {
          throw new DoNotMatchColumnException(`Do not Match ${rowNo} rowNum`);
        }
        result.push(item);
      }
    }

    return result;
  }

  /**
   * 첫 번째 행을 컬럼명(키)으로 사용하여 Excel 데이터 파싱
   */
  static getRowDataTopColumnUsingColumnName(
    buffer: Buffer,
    columnIndex: number,
  ): Map<string, string>[] {
    const result: Map<string, string>[] = [];

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    const rows = range.e.r + 1;

    // 첫 번째 행에서 컬럼명 가져오기
    const columnsList: string[] = [];
    for (let i = 0; i < columnIndex; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: i });
      const cell = sheet[cellAddress];
      if (cell) {
        const value = String(cell.v || '')
          .trim()
          .replace(/\n/g, '')
          .replace(/ /g, '');
        columnsList.push(value);
      } else {
        columnsList.push('');
      }
    }

    // 중복 컬럼 확인
    const seenColumns = new Set<string>();
    for (const col of columnsList) {
      if (col && seenColumns.has(col)) {
        throw new Error(`중복칼럼 발생 Column Name = ${col}`);
      }
      seenColumns.add(col);
    }

    let rowNo = 1;
    let cellIdx = 0;

    try {
      for (rowNo = 1; rowNo < rows; rowNo++) {
        const item = new Map<string, string>();

        for (cellIdx = 0; cellIdx < columnIndex; cellIdx++) {
          const cellAddress = XLSX.utils.encode_cell({ r: rowNo, c: cellIdx });
          const cell = sheet[cellAddress];

          const columnName = columnsList[cellIdx];

          if (item.has(columnName)) {
            throw new Error(`중복칼럼 발생 Column Name = ${columnName}`);
          }

          if (cell !== undefined) {
            const value = this.getCellValue(cell);
            item.set(columnName, value.trim());
          } else {
            item.set(columnName, '0');
            break;
          }
        }

        if (item.size === columnIndex) {
          result.push(item);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new NotParserExcelUploadData(rowNo, cellIdx, message);
    }

    return result;
  }

  /**
   * Map<number, string>[] 를 object 배열로 변환
   */
  static mapArrayToObjectArray(mapArray: Map<number, string>[]): Record<number, string>[] {
    return mapArray.map((map) => {
      const obj: Record<number, string> = {};
      map.forEach((value, key) => {
        obj[key] = value;
      });
      return obj;
    });
  }

  /**
   * Map<string, string>[] 를 object 배열로 변환
   */
  static stringMapArrayToObjectArray(mapArray: Map<string, string>[]): Record<string, string>[] {
    return mapArray.map((map) => {
      const obj: Record<string, string> = {};
      map.forEach((value, key) => {
        obj[key] = value;
      });
      return obj;
    });
  }

  /**
   * 셀 값을 문자열로 변환
   */
  private static getCellValue(cell: XLSX.CellObject): string {
    if (cell === undefined || cell === null) {
      return '';
    }

    switch (cell.t) {
      case 'n': // Number
        const numValue = cell.v as number;
        if (Number.isInteger(numValue)) {
          return String(numValue);
        }
        return String(numValue);
      case 's': // String
        return String(cell.v || '');
      case 'b': // Boolean
        return String(cell.v);
      case 'd': // Date
        return cell.v instanceof Date ? cell.v.toISOString() : String(cell.v);
      default:
        return String(cell.v || '');
    }
  }

  /**
   * 문자열을 정수로 파싱 (빈 값이나 유효하지 않은 값은 0 반환)
   */
  static parseIntSafe(value: string | undefined): number {
    if (!value || value.trim() === '' || value === '0') {
      return 0;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * 문자열을 실수로 파싱 (빈 값이나 유효하지 않은 값은 0 반환)
   */
  static parseFloatSafe(value: string | undefined): number {
    if (!value || value.trim() === '' || value === '0') {
      return 0;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
}
