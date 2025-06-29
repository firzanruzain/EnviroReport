import React from 'react';
import { SignUpFieldBase } from './SignUpFieldBase';

export interface IdentityCardFieldProps extends Omit<React.ComponentProps<typeof SignUpFieldBase>, 'label'> {
  error?: string | null;
}

export const IdentityCardField: React.FC<IdentityCardFieldProps> = ({ error, ...props }) => (
  <SignUpFieldBase
    label="Identity Card"
    error={error}
    {...props}
  />
); 