import jwt from 'jsonwebtoken';

const generateToken = (payload: object, expiresIn : string = '1d'): string => {
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'secret',
    { expiresIn: expiresIn  }
  );

  return token;
};
export default generateToken