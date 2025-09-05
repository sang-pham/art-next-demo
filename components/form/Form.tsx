"use client";

import React from "react";
import {
  useForm,
  FormProvider,
  type SubmitHandler,
  type DefaultValues,
  type Resolver,
  useFormContext,
} from "react-hook-form";

export interface FormProps<T extends Record<string, any>> {
  defaultValues?: DefaultValues<T>;
  resolver?: Resolver<T, any>;
  onSubmit: SubmitHandler<T>;
  className?: string;
  children: React.ReactNode;
}

export default function Form<T extends Record<string, any>>({
  defaultValues,
  resolver,
  onSubmit,
  className,
  children,
}: FormProps<T>) {
  const methods = useForm<T>({
    defaultValues,
    resolver,
    mode: "onSubmit",
  });
  return (
    <FormProvider {...methods}>
      <form noValidate className={className} onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  );
}

export { useFormContext };