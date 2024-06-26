const { PrismaClient } = require('@prisma/client')
const { app } = require('@electron/remote')
const { join, resolve } = require('path')
const isDevelopment = process.env.NODE_ENV !== 'production'
console.log(isDevelopment)

const dbPath = isDevelopment ? join(resolve('./prisma/dev.db')) : join(app.getPath('userData'), `0.1.1.db`)
console.log('llega', dbPath)
console.log('llega', app)
window.dbPath = dbPath
export const prisma = new PrismaClient({
  // log: ['query'],
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
})
import('../prisma/migrations/20220208053117_update/migration.sql').then(async _ => {
  prisma.$transaction(async ()=> {
    await prisma.$executeRawUnsafe(_.default)
  }).then(()=> {
    console.log('migrate succeed')
  }).catch(()=> {
    console.log('migrate failure')
  })
})

