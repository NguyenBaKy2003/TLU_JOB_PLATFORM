// ── Regex patterns ──────────────
export const REGEX = {
  email:    /\S+@\S+\.\S+/,
  hasUpper: /[A-Z]/,
  hasDigit: /[0-9]/,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/,
  phone:    /^(\+84|0)[0-9]{9,10}$/,
};

// ── Single field validators ──────
export const validators = {
  required: (value: string, label = "Trường này") =>
    value.trim() ? undefined : `${label} không được để trống`,

  email: (value: string) =>
    REGEX.email.test(value) ? undefined : "Email không hợp lệ",

  minLength: (min: number) => (value: string) =>
    value.length >= min ? undefined : `Tối thiểu ${min} ký tự`,

  maxLength: (max: number) => (value: string) =>
    value.length <= max ? undefined : `Tối đa ${max} ký tự`,

  password: (value: string) => {
    if (value.length < 8)          return "Mật khẩu tối thiểu 8 ký tự";
    if (!REGEX.hasUpper.test(value)) return "Cần ít nhất 1 chữ hoa";
    if (!REGEX.hasDigit.test(value)) return "Cần ít nhất 1 số";
    return undefined;
  },

  confirmPassword: (password: string) => (value: string) =>
    value === password ? undefined : "Mật khẩu không khớp",

  phone: (value: string) =>
    !value || REGEX.phone.test(value) ? undefined : "Số điện thoại không hợp lệ",
};

// ── Form-level validators (trả về object errors) ──────────────
export type ValidationResult<T> = Partial<Record<keyof T, string>>;

export function validateRegisterForm(form: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): ValidationResult<typeof form> {
  return {
    firstName:       validators.required(form.firstName, "Tên"),
    lastName:        validators.required(form.lastName, "Họ"),
    email:           validators.email(form.email),
    password:        validators.password(form.password),
    confirmPassword: validators.confirmPassword(form.password)(form.confirmPassword),
  };
}

export function validateLoginForm(form: {
  email: string;
  password: string;
}): ValidationResult<typeof form> {
  return {
    email:    validators.email(form.email),
    password: validators.required(form.password, "Mật khẩu"),
  };
}

// ── Helper: lọc bỏ undefined, trả về chỉ lỗi thực sự ─────────
export function filterErrors<T>(
  raw: Partial<Record<keyof T, string | undefined>>
): Partial<Record<keyof T, string>> {
  return Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== undefined)
  ) as Partial<Record<keyof T, string>>;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}