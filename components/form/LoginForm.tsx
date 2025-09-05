"use client";

import React from "react";
import { useForm } from "react-hook-form";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useAuth } from "../../lib/auth/authProvider";
import { useToast } from "../feedback/ToastProvider";

type LoginValues = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { register, handleSubmit, formState } = useForm<LoginValues>({
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });
  const { errors, isSubmitting } = formState;
  const { login } = useAuth();
  const toast = useToast();

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values.email, values.password);
      toast.show({
        title: "Logged in",
        description: "You have been authenticated successfully.",
        variant: "success",
      });
    } catch (err: any) {
      const message =
        (err?.response?.data?.message as string) ||
        err?.message ||
        "Login failed";
      toast.show({
        title: "Login failed",
        description: message,
        variant: "error",
      });
    }
  };

  return (
    <form className="form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Input
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Enter a valid email",
          },
        })}
        error={errors.email?.message}
      />
      <Input
        type="password"
        label="Password"
        placeholder="••••••••"
        autoComplete="current-password"
        {...register("password", {
          required: "Password is required",
          minLength: { value: 6, message: "Min length is 6" },
        })}
        error={errors.password?.message}
      />
      <div className="flex items-center gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          Log in
        </Button>
        <Button type="button" variant="outline" onClick={() => window.location.assign("/register")}>
          Create account
        </Button>
      </div>
    </form>
  );
}