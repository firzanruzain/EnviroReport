import React from "react";
import { Text, TouchableOpacity } from "react-native";

const variantStyles = {
  primary: "bg-primary-100 rounded-full justify-center h-20 my-8",
  secondary:
    "bg-primary-Default flex-col gap-6 p-4 rounded-xl my-2 items-center",
  disabled: "bg-gray-500 rounded-full justify-center h-20 my-8",
};

type ButtonProps = {
  title: React.ReactNode;
  onPress?: () => void;
  variant?: keyof typeof variantStyles;
  className?: string;
  disabled?: boolean;
};

export default function Button({
  title,
  onPress,
  variant,
  className,
  disabled,
}: ButtonProps) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      className={`${
        disabled ? variantStyles.disabled : variantStyles[variant || "primary"]
      } ${className}`}
    >
      {title}
    </TouchableOpacity>
  );
}
