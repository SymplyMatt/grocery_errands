declare global {
  namespace Express {
    interface Request {
      user?: string; 
      email?: string;
      phone?: string;
      username?: string | null;
      role?: string;
      apiToken?: string;
      apiKey?: string;
    }
  }
}

export {};