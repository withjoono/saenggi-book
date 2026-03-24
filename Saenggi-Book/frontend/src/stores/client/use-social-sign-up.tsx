import { create } from "zustand";

interface SocialSignUpState {
  socialType: "google" | "naver" | null;
  token: string | null;

  setData({
    socialType,
    token,
  }: {
    socialType: "google" | "naver" | null;
    token: string | null;
  }): void;

  clearData(): void;
}

export const useSocialSignUp = create<SocialSignUpState>((set) => ({
  socialType: null,
  token: null,
  setData({ socialType, token }) {
    set({
      socialType,
      token,
    });
  },
  clearData() {
    set({
      socialType: null,
      token: null,
    });
  },
}));
