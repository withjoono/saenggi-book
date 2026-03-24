import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
  password: z
    .string()
    .min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
});

export const registerWithEmailFormSchema = z
  .object({
    name: z
      .string()
      .min(2, "이름은 최소 2자 이상이어야 합니다.")
      .max(12, "이름은 최대 12자 입니다."),
    email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
    password: z
      .string()
      .min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." })
      .max(120, "비밀번호는 최대 120자 입니다."),
    checkPassword: z.string().min(1, { message: "비밀번호를 입력해주세요." }),
    school: z.string().optional(),
    major: z.coerce.number(),
    graduateYear: z.coerce
      .number()
      .min(2016, { message: "졸업연도는 2016~2030 사이어야 합니다." })
      .max(2030, { message: "졸업연도는 2016~2030 사이어야 합니다." }),
    // TODO: 핸드폰 인증 기능 복구 시 필수로 변경
    phone: z.string().optional(),
    phoneToken: z.string().optional(),
  })
  .refine((data) => data.password === data.checkPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["checkPassword"], // 에러 메시지가 표시될 필드
  });

export const registerWithSocialFormSchema = z
  .object({
    name: z
      .string()
      .min(2, "이름은 최소 2자 이상이어야 합니다.")
      .max(12, "이름은 최대 12자 입니다."),
    school: z.string().optional(),
    major: z.coerce.number(),
    graduateYear: z.coerce
      .number()
      .min(2016, { message: "졸업연도는 2016~2030 사이어야 합니다." })
      .max(2030, { message: "졸업연도는 2016~2030 사이어야 합니다." }),
    phone: z.string(),
    phoneToken: z.string().min(1, "인증번호를 입력해주세요."),
  })
  .refine(
    (data) => /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/.test(data.phone),
    {
      message: "전화번호 형식이 올바르지 않습니다.",
      path: ["phone"],
    },
  );
