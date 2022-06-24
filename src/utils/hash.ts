import { hash } from 'bcrypt';

const generateHashPassword = (password: string) => {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  return hash(password, 10);
};

export default generateHashPassword;
