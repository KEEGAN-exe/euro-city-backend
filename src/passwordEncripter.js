import bcrypt from "bcrypt";

export function encryptPassword(password) {
  return bcrypt.hash(password, 10);
}
