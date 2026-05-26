import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import sessionRoutes from './routes/session.routes';
import patientRoutes from './routes/patient.routes';
import planRoutes from './routes/plan.routes';
import emrRoutes from './routes/emr.routes';
import billingRoutes from './routes/billing.routes';
import { accessAuditLogger } from './middlewares/auditLogger.middleware';

const app = express();

// Security Middlewares
app.use(helmet({
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true } // Strict Transport Security
}));
app.use(cors());

// Force SSL in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply HIPAA Audit Logger globally
app.use(accessAuditLogger);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Root Endpoint
app.get('/', (req, res) => {
  res.send('JoGait Backend API is running!');
});

// Mount Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/emr', emrRoutes);
app.use('/api/billing', billingRoutes);

export default app;
