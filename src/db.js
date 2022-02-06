const { PrismaClient } = require('@prisma/client')
const { app } = require('@electron/remote')
const { join, resolve } = require('path')
const pkg = require('../package.json')
const isDevelopment = process.env.NODE_ENV !== 'production'
console.log(isDevelopment)

const dbPath = isDevelopment ? join(resolve('./prisma/dev.db')) : join(app.getPath('userData'), `${pkg.version}.db`)
console.log('llega', dbPath)
console.log('llega', app)
window.dbPath = dbPath
export const prisma = new PrismaClient({
  log: ['query'],
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
})
