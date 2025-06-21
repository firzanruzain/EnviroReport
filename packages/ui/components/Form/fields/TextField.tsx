import React from "react";

export function TextField({ field, ...props }: { field: any }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={field.id}>{field.label}</label>
      <input id={field.id} name={field.name} type="text" {...props} />
    </div>
  );
}
