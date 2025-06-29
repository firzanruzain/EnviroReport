import React from 'react';
import { SignUpFieldBase } from './SignUpFieldBase';

export interface ConfirmPasswordFieldProps extends Omit<React.ComponentProps<typeof SignUpFieldBase>, 'label' | 'secureTextEntry'> {
  password: string;
  error?: string | null;
}

export const ConfirmPasswordField: React.FC<ConfirmPasswordFieldProps> = ({ password, error, ...props }) => (
  <SignUpFieldBase
    label="Confirm Password"
    secureTextEntry
    error={error}
    {...props}
  />
); 