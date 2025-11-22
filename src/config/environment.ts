const environmentConfig = () => ({
  PORT: process.env.PORT ?? '3000',
  DATABASE: {
    URL: process.env.DATABASE_URL || 'file:./dev.db',
  },
});

export default environmentConfig;
