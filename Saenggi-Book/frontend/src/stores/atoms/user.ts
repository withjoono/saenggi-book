/**
 * 사용자 상태 관리 (Zustand + localStorage persist)
 * Reference 프로젝트의 Recoil atoms 패턴을 Zustand로 구현
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 사용자 정보 타입
 * Reference 프로젝트의 UserInfo 타입 참고
 */
export interface UserInfo {
  id: number | null;
  email: string | null;
  nickname: string | null;
  phone: string | null;
  address: string | null;
  profileImageUrl: string | null;

  // 학생 정보
  highschoolName: string | null;
  graduateYear: string | null;
  gtypeId: number | null;      // 학년 타입
  stypeId: number | null;       // 학생 타입
  hstTypeId: number | null;     // 고등학교 타입
  major: string | null;

  // 권한 정보
  isOfficer: boolean | null;
  isTeacher: boolean | null;

  // 서비스 이용 정보
  usingService: string | null;
  serviceRangeCode: string | null;

  // 기타
  introduction: string | null;
  ckSmsAgree: boolean;
}

interface UserState {
  userInfo: UserInfo;
}

interface UserActions {
  setUserInfo: (userInfo: Partial<UserInfo>) => void;
  updateUserInfo: (updates: Partial<UserInfo>) => void;
  clearUserInfo: () => void;
  isAuthenticated: () => boolean;
}

type UserStore = UserState & UserActions;

/**
 * 초기 사용자 정보
 */
const initialUserInfo: UserInfo = {
  id: null,
  email: null,
  nickname: null,
  phone: null,
  address: null,
  profileImageUrl: null,
  highschoolName: null,
  graduateYear: null,
  gtypeId: null,
  stypeId: null,
  hstTypeId: null,
  major: null,
  isOfficer: null,
  isTeacher: null,
  usingService: null,
  serviceRangeCode: null,
  introduction: null,
  ckSmsAgree: false,
};

/**
 * 사용자 스토어
 * - localStorage에 자동 영속화
 * - 어디서든 접근 가능한 전역 상태
 */
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // State
      userInfo: initialUserInfo,

      // Actions
      setUserInfo: (userInfo) => {
        set({ userInfo: { ...initialUserInfo, ...userInfo } });
      },

      updateUserInfo: (updates) => {
        set((state) => ({
          userInfo: { ...state.userInfo, ...updates },
        }));
      },

      clearUserInfo: () => {
        set({ userInfo: initialUserInfo });
      },

      isAuthenticated: () => {
        const state = get();
        return state.userInfo.id !== null;
      },
    }),
    {
      name: 'user-storage', // localStorage key
      partialize: (state) => ({
        userInfo: state.userInfo,
      }),
    },
  ),
);

/**
 * 사용자 정보 선택자 (Recoil selector 스타일)
 */
export const selectUserInfo = (state: UserStore) => state.userInfo;
export const selectUserId = (state: UserStore) => state.userInfo.id;
export const selectUserEmail = (state: UserStore) => state.userInfo.email;
export const selectUserNickname = (state: UserStore) => state.userInfo.nickname;
export const selectIsAuthenticated = (state: UserStore) =>
  state.isAuthenticated();
