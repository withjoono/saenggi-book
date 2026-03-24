import { z } from "zod";

export const editProfileFormSchema = z.object({
  school: z.string().optional(),
  major: z.string(),
  graduateYear: z.string(),
});
