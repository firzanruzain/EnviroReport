import React from 'react';
import { SignUpFieldBase } from './SignUpFieldBase';

export interface EmailFieldProps extends Omit<React.ComponentProps<typeof SignUpFieldBase>, 'label'> {
  error?: string | null;
}

export const EmailField: React.FC<EmailFieldProps> = ({ error, ...props }) => (
  <SignUpFieldBase
    label="Email"
    keyboardType="email-address"
    error={error}
    {...props}
  />
); 