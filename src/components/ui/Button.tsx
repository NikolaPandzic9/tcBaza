"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { buttonBaseClasses, buttonVariantClasses, type ButtonVariant } from "./buttonStyles";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
}

// Native <button> only — for CTAs that navigate, use LinkButton so href
// stays typed against next-intl's locale-aware routing instead of a
// loosely-typed polymorphic prop.
export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonBaseClasses, buttonVariantClasses[variant], className)}
      {...props}
    />
  );
}
