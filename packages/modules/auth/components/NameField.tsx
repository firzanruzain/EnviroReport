import React from 'react';
import { SignUpFieldBase } from './SignUpFieldBase';

export interface NameFieldProps extends Omit<React.ComponentProps<typeof SignUpFieldBase>, 'label'> {
  error?: string | null;
}

export const NameField: React.FC<NameFieldProps> = ({ error, ...props }) => (
  <SignUpFieldBase
    label="Name"
    error={error}
    {...props}
  />
); 