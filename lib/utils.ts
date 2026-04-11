import dayjs from "dayjs";

export const formatCurrency = (value: number, currency = "USD"): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
};

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// Validation helpers for authentication
export interface ValidationError {
  field: string;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#\^()_+\-=\[\]{};:'",.<>?/\\|`~]/;

export const validateEmail = (email: string): ValidationError | null => {
  if (!email.trim()) {
    return { field: "email", message: "Email is required" };
  }
  if (email.length > 254) {
    return { field: "email", message: "Email is too long" };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { field: "email", message: "Please enter a valid email" };
  }
  return null;
};

export const validatePassword = (password: string): ValidationError | null => {
  if (!password) {
    return { field: "password", message: "Password is required" };
  }
  if (password.length < 8) {
    return {
      field: "password",
      message: "Password must be at least 8 characters",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      field: "password",
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (!/\d/.test(password)) {
    return {
      field: "password",
      message: "Password must contain at least one number",
    };
  }
  if (/\s/.test(password)) {
    return { field: "password", message: "Password cannot contain spaces" };
  }
  return null;
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string,
): ValidationError | null => {
  if (!confirmPassword) {
    return {
      field: "confirmPassword",
      message: "Please confirm your password",
    };
  }
  if (password !== confirmPassword) {
    return { field: "confirmPassword", message: "Passwords do not match" };
  }
  return null;
};

export const validateFullName = (name: string): ValidationError | null => {
  if (name.length > 100) {
    return { field: "fullName", message: "Name is too long" };
  }
  return null;
};

export const validateSignUpForm = ({
  email,
  password,
  confirmPassword,
  fullName = "",
}: {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(password);
  if (passwordError) errors.push(passwordError);

  const passwordMatchError = validatePasswordMatch(password, confirmPassword);
  if (passwordMatchError) errors.push(passwordMatchError);

  if (fullName) {
    const nameError = validateFullName(fullName);
    if (nameError) errors.push(nameError);
  }

  return errors;
};

export const validateSignInForm = ({
  email,
  password,
}: {
  email: string;
  password: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!email.trim()) {
    errors.push({ field: "email", message: "Email is required" });
  }
  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  }

  return errors;
};
