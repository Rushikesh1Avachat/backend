// ==========================================
// Environment Configuration
// ==========================================

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRY: '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

export const validateConfig = () => {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
    console.error('Please create a .env file with required variables');
    process.exit(1);
  }
};

export default config;
