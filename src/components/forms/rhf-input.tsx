"use client";

import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";

type RhfInputProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder?: string;
  register: UseFormRegister<T>;
};

export function RhfInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  register
}: RhfInputProps<T>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={String(name)}>{label}</Label>
      <Input id={String(name)} placeholder={placeholder} {...register(name)} />
    </div>
  );
}
