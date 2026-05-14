type ParentRegistrationParams = {
  fullName: string;
  email: string;
  passwordHash: string;
};

/**
 * Public registration is intentionally constrained to parent accounts only.
 * Admin/Tutor accounts must be provisioned internally by TopMox operations.
 */
export function buildParentRegistrationData({
  fullName,
  email,
  passwordHash
}: ParentRegistrationParams) {
  return {
    name: fullName.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role: "PARENT" as const
  };
}
