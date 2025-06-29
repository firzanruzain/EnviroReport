import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { View, Text, StyleSheet } from 'react-native';

export interface SignUpFieldBaseProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: string;
  validate?: (value: string) => string | null;
  error?: string | null;
}

export const SignUpFieldBase: React.FC<SignUpFieldBaseProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  validate,
  error: errorProp,
}) => {
  const [touched, setTouched] = useState(false);
  const error = errorProp !== undefined ? errorProp : (validate ? validate(value) : null);
  const showError = touched && !!error;

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType as any}
        onBlur={() => setTouched(true)}
        error={showError}
        mode="outlined"
        style={styles.input}
        outlineStyle={{borderRadius:45}}
      />
      {showError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#ddfcad',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
}); 