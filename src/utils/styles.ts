// Utility functions for common Tailwind CSS class combinations
export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

// Common component styles
export const buttonStyles = {
  primary:
    "bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors",
  secondary:
    "bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors",
  outline:
    "border border-primary-500 text-primary-500 hover:bg-primary-50 font-semibold py-2 px-4 rounded-lg transition-colors",
};

export const cardStyles =
  "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700";
