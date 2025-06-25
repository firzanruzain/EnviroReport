export const fieldValidationMap: {
  [key: string]: (
    value: any,
    configValue: any,
    field?: any
  ) => string | undefined;
} = {
  maxLength: (value: string, max: number) =>
    value && value.length > max ? `Maximum length is ${max}` : undefined,
  minLength: (value: string, min: number) =>
    value && value.length < min ? `Minimum length is ${min}` : undefined,
  min: (value: string, min: number) =>
    value && Number(value) < min ? `Minimum value is ${min}` : undefined,
  max: (value: string, max: number) =>
    value && Number(value) > max ? `Maximum value is ${max}` : undefined,
  // maxDate: (value: Date, maxDate: string) => {
  //   if (!value) return;
  //   const max = new Date(maxDate);
  //   return value > max
  //     ? `Enter date before: ${max.toLocaleDateString()}`
  //     : undefined;
  // },
  minDate: (value: Date, minDate: string) => {
    if (!value) return;
    const min = new Date(minDate);
    return value < min
      ? `Enter date after: ${min.toLocaleDateString()}`
      : undefined;
  },
};
