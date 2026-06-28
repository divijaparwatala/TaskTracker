import mongoose from 'mongoose'
import app from './app.js'

typeof process === 'object' && process.env && process.env.NODE_ENV

const PORT = process.env.PORT || 8080
const rawDbUri = process.env.DB_URI || ''
const DB_URI = rawDbUri.trim()
const hasValidDbUri = Boolean(DB_URI && !DB_URI.includes('<') && !DB_URI.includes('db_username'))

const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`)
    })
}

if (!hasValidDbUri) {
    console.warn('No valid DB_URI configured. Using in-memory storage.')
    startServer()
} else {
    mongoose.set('strictQuery', false)
    mongoose
        .connect(DB_URI)
        .then(() => {
            console.log('Connected to MongoDB')
            startServer()
        })
        .catch((err) => {
            console.warn('MongoDB connection failed, falling back to in-memory storage:', err.message)
            startServer()
        })
}