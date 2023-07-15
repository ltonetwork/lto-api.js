export function kababCase(value: string) {
  return value.replace(/([a-z])(?=[A-Z])|([A-Z])(?=[A-Z][a-z])/g, '$1$2-').toLowerCase();
}
