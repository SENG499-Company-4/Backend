import { sign, verify } from 'jsonwebtoken';

interface Token {
  userId: string;
}

export const generateToken = (userId: number) => {
  const token = sign(
    {
      userId,
    },
    process.env.JWT_SECRET || ''
  );
  return token;
};

export const getUserId = (token?: string) => {
  if (token) {
    const user = verify(token, process.env.JWT_SECRET ?? '') as Token;
    return user && Number(user.userId);
  }
};
