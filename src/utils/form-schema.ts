import { z } from "zod";

export const SignUpSchema = z.object({
    username: z.string().min(1, "Please Enter your name"),
    email: z.string().email("Please Enter your email"),
    password: z
        .string()
        .min(8, { message: "Password must be atleast 8 letters long" })
        .regex(
            new RegExp(".*[A-Z].*"),
            "Password must contain atleast one uppercase character"
        )
        .regex(
            new RegExp(".*[a-z].*"),
            "Password must contain atleast one lowercase character"
        )
        .regex(
            new RegExp(".*\\d.*"),
            "Password must contain atleast one number"
        )
        .regex(
            new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
            "Password must contain atleast one special character"
        ),
});
