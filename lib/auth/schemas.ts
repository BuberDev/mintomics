import { z } from "zod";

export const authEmailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.")
  .max(254, "Email is too long.");

export const authPasswordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(200, "Password is too long.");

export const signInSchema = z.object({
  email: authEmailSchema,
  password: authPasswordSchema,
});

export const signUpSchema = z
  .object({
    email: authEmailSchema,
    password: authPasswordSchema,
    confirmPassword: authPasswordSchema,
    displayName: z.string().trim().max(80).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const resendVerificationSchema = z.object({
  email: authEmailSchema,
});

export const forgotPasswordSchema = z.object({
  email: authEmailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Token is required."),
    password: authPasswordSchema,
    confirmPassword: authPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
