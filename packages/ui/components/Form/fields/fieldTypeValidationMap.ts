export const fieldTypeValidationMap: {
  [fieldTypeId: string]: (
    value: any,
    field: any,
    config: any
  ) => string | undefined;
} = {
  FT_LOCATION: (value, field, config) => {
    if (!value) return undefined;
    // Handle new object format
    if (
      typeof value === "object" &&
      value !== null &&
      "latitude" in value &&
      "longitude" in value
    ) {
      const { latitude, longitude } = value;
      if (
        latitude === null ||
        longitude === null ||
        latitude === undefined ||
        longitude === undefined
      )
        return "Location must have both latitude and longitude.";
      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        isNaN(latitude) ||
        isNaN(longitude)
      )
        return "Latitude and longitude must be numbers.";
      if (latitude < -90 || latitude > 90)
        return "Latitude must be between -90 and 90.";
      if (longitude < -180 || longitude > 180)
        return "Longitude must be between -180 and 180.";
      return undefined;
    }
    // Fallback for old string format
    if (typeof value === "string") {
      const parts = value.split(",");
      if (
        parts.length !== 2 ||
        parts[0].trim() === "" ||
        parts[1].trim() === ""
      )
        return "Location must be in 'latitude,longitude' format.";
      const [lat, lon] = parts.map(Number);
      if (isNaN(lat) || isNaN(lon))
        return "Latitude and longitude must be numbers.";
      if (lat < -90 || lat > 90) return "Latitude must be between -90 and 90.";
      if (lon < -180 || lon > 180)
        return "Longitude must be between -180 and 180.";
      return undefined;
    }
    return "Invalid location format.";
  },
  FT_NUMBER: (value, field, config) => {
    if (!value) return undefined;
    if (isNaN(Number(value))) {
      return "Value must be a number.";
    }
    return undefined;
  },
  FT_DATE: (value, field, config) => {
    if ((value as Date) > new Date()) return "Enter a valid date";
    return undefined;
  },
};
