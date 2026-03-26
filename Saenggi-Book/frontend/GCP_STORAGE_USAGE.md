# Google Cloud Storage 사용 가이드

GCS 파일 업로드 및 관리 방법입니다.

## 기본 사용법

### 파일 업로드

```typescript
import { uploadToGCS, getGCSUrl } from '@/lib/gcp';

// 단일 파일 업로드
const handleFileUpload = async (file: File) => {
  try {
    const url = await uploadToGCS(file, `users/${userId}/profile.jpg`);
    console.log('Uploaded file URL:', url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// 여러 파일 업로드
const handleMultipleUpload = async (files: File[]) => {
  try {
    const urls = await uploadMultipleToGCS(files, `users/${userId}/documents`);
    console.log('Uploaded files:', urls);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### 파일 URL 생성

```typescript
import { getGCSUrl, getResizedImageUrl } from '@/lib/gcp';

// 기본 URL
const fileUrl = getGCSUrl('users/123/profile.jpg');

// CDN URL (자동)
const cdnUrl = getGCSUrl('users/123/profile.jpg', true);

// 리사이징된 이미지 URL
const thumbnailUrl = getResizedImageUrl('users/123/profile.jpg', 200, 200);
```

### 파일 검증

```typescript
import { validateFileSize, isImageFile, validateFileExtension } from '@/lib/gcp';

const handleFileSelect = (file: File) => {
  // 크기 검증 (10MB 제한)
  if (!validateFileSize(file, 10)) {
    alert('파일 크기는 10MB 이하여야 합니다');
    return;
  }

  // 이미지 타입 검증
  if (!isImageFile(file)) {
    alert('이미지 파일만 업로드 가능합니다');
    return;
  }

  // 확장자 검증
  if (!validateFileExtension(file, ['jpg', 'jpeg', 'png', 'gif'])) {
    alert('지원하지 않는 파일 형식입니다');
    return;
  }

  // 업로드 진행
  uploadToGCS(file, `uploads/${file.name}`);
};
```

### 파일 삭제

```typescript
import { deleteFromGCS } from '@/lib/gcp';

const handleFileDelete = async (filePath: string) => {
  const success = await deleteFromGCS(filePath);
  if (success) {
    console.log('File deleted successfully');
  }
};
```

## React 컴포넌트 예제

### 프로필 이미지 업로드

```typescript
import { useState } from 'react';
import { uploadToGCS, validateFileSize, isImageFile } from '@/lib/gcp';
import { useUserStore } from '@/stores/atoms/user';

export const ProfileImageUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const userInfo = useUserStore((state) => state.userInfo);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 검증
    if (!isImageFile(file)) {
      alert('이미지 파일만 업로드 가능합니다');
      return;
    }

    if (!validateFileSize(file, 5)) {
      alert('파일 크기는 5MB 이하여야 합니다');
      return;
    }

    // 업로드
    setUploading(true);
    try {
      const url = await uploadToGCS(
        file,
        `users/${userInfo.id}/profile.${file.name.split('.').pop()}`,
      );
      setImageUrl(url);
      alert('업로드 성공!');
    } catch (error) {
      alert('업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {imageUrl && <img src={imageUrl} alt="Profile" />}
    </div>
  );
};
```

### 드래그 앤 드롭 업로드

```typescript
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadMultipleToGCS } from '@/lib/gcp';

export const FileUploader = () => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const urls = await uploadMultipleToGCS(
        acceptedFiles,
        `documents/${Date.now()}`,
      );
      console.log('Uploaded files:', urls);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>파일을 여기에 드롭하세요</p>
      ) : (
        <p>파일을 드래그하거나 클릭하여 업로드</p>
      )}
    </div>
  );
};
```

## 백엔드 요구사항

Spring 백엔드에서 다음 엔드포인트를 구현해야 합니다:

### 파일 업로드
```
POST /upload
Content-Type: multipart/form-data

Request:
- file: File
- path: string
- bucket?: string

Response:
{
  "url": "https://storage.googleapis.com/bucket/path/to/file.jpg"
}
```

### 파일 삭제
```
DELETE /upload/:path

Response:
{
  "success": true
}
```

## 환경 변수

`.env.production`에 다음 변수를 추가하세요:

```env
# GCP Cloud Storage (선택사항)
VITE_GCP_STORAGE_BUCKET="your-gcs-bucket"
VITE_GCP_CDN_URL="https://cdn.your-domain.com"
```

## 주의사항

1. **파일 크기 제한**: 기본적으로 백엔드에서 설정된 크기 제한을 따릅니다
2. **파일 타입 검증**: 클라이언트와 서버 양쪽에서 검증 필요
3. **권한 관리**: 업로드된 파일의 공개/비공개 설정 확인
4. **CDN 캐싱**: CDN을 사용하는 경우 캐시 무효화 전략 수립

## Cloud CDN 설정 (선택)

Cloud CDN을 사용하면 전 세계적으로 빠른 파일 전송이 가능합니다:

1. GCP Console에서 Cloud CDN 활성화
2. Load Balancer 설정
3. Backend bucket을 Cloud Storage로 설정
4. CDN URL을 `.env.production`에 추가

## 이미지 최적화 (선택)

Cloud Functions를 사용한 이미지 리사이징:

```typescript
// 썸네일 URL (200x200)
const thumbnail = getResizedImageUrl('profile.jpg', 200, 200);

// 너비만 지정 (비율 유지)
const resized = getResizedImageUrl('profile.jpg', 800);
```

이 기능을 사용하려면 Cloud Functions에 이미지 리사이징 함수를 배포해야 합니다.
