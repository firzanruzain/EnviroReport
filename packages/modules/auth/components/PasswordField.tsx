import React from 'react';
import { SignUpFieldBase } from './SignUpFieldBase';

export interface PasswordFieldProps extends Omit<React.ComponentProps<typeof SignUpFieldBase>, 'label' | 'secureTextEntry'> {
  error?: string | null;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ error, ...props }) => (
  <SignUpFieldBase
    label="Password"
    secureTextEntry
    error={error}
    {...props}
  />
); 