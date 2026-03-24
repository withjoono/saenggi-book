export interface IAdditionalFile {
  id: number;
  file_name: string;
  file_size: number;
  create_dt: string;
}

export interface IUploadAdditionalFileData {
  file: File;
}

export interface IUploadAdditionalFileResponse {
  message: string;
  fileKey: string;
}

export interface IDeleteAdditionalFileResponse {
  message: string;
}
