const environmentConfig = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return {
    PORT: process.env.PORT ?? '3000',
    DATABASE: {
      URL: process.env.DATABASE_URL || 'file:./dev.db',
    },
    JWT: {
      SECRET: process.env.JWT_SECRET,
      EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    },
  };
};

export default environmentConfig;
