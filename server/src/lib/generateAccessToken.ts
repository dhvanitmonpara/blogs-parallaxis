import jwt from "jsonwebtoken"

const generateAccessToken = (id: string, email: string) => {
  return jwt.sign({
    id,
    email,
  },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: (process.env.ACCESS_TOKEN_EXPIRY ||
        process.env.ACCESS_TOKEN_TTL ||
        "15m") as any
    }
  );
}

export default generateAccessToken
