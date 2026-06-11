/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import bikeRoutes from './routes/bikes.js'
import orderRoutes from './routes/orders.js'
import operatorRoutes from './routes/operators.js'
import dispatchRoutes from './routes/dispatch.js'
import financeRoutes from './routes/finance.js'
import complaintRoutes from './routes/complaints.js'
import notificationRoutes from './routes/notifications.js'
import adminRoutes from './routes/admin.js'
import operationLogRoutes from './routes/operationLogs.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/bikes', bikeRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/operators', operatorRoutes)
app.use('/api/dispatch', dispatchRoutes)
app.use('/api/finance', financeRoutes)
app.use('/api/complaints', complaintRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/operation-logs', operationLogRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
