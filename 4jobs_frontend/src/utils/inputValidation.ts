export const validateInput = (input: string): string => {
  // Remove any potentially harmful characters
  return input.replace(/[<>&'"]/g, '');
};
