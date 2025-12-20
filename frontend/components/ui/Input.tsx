import React from "react";
import { cn } from "@/lib/utils";

export default function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("input", className)} {...props} />;
}
