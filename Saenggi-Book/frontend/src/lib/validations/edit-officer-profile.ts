import { z } from "zod";

export const editOfficerProfileFormSchema = z.object({
  name: z.string().min(1, { message: "이름을 입력해주세요." }),
  university: z.string().min(1, { message: "출신 대학을 입력해주세요." }),
  education: z.string().min(1, { message: "학과/학력을 입력해주세요." }),
});
