/**
 * Verify database after restore
 */

import { Ignitor } from '@adonisjs/core'

const APP_ROOT = new URL('./', import.meta.url)

const IMPORTER = (filePath) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

async function verifyRestore() {
  try {
    const ignitor = new Ignitor(APP_ROOT, { importer: IMPORTER })
    ignitor.tap((app) => {
      app.booting(async () => {
        await import('./start/env.ts')
      })
    })

    const app = ignitor.createApp('console')
    await app.init()
    await app.boot()

    const dbModule = await import('@adonisjs/lucid/services/db')
    const db = dbModule.default

    console.log('\n╔════════════════════════════════════════╗')
    console.log('║   DATABASE RESTORE VERIFICATION       ║')
    console.log('╚════════════════════════════════════════╝\n')

    // Tables
    const tables = await db.rawQuery('SHOW TABLES')
    const tableCount = tables[0].length
    console.log(`✓ Tables: ${tableCount} ${tableCount === 32 ? '✅' : '❌ Expected 32'}`)

    // Procedures
    const procs = await db.rawQuery('SHOW PROCEDURE STATUS WHERE Db = DATABASE()')
    const procCount = procs[0].length
    console.log(`✓ Procedures: ${procCount} ${procCount === 32 ? '✅' : '❌ Expected 32'}`)

    // Triggers
    const triggers = await db.rawQuery('SHOW TRIGGERS')
    const triggerCount = triggers[0].length
    console.log(`✓ Triggers: ${triggerCount} ${triggerCount === 19 ? '✅' : '❌ Expected 19'}`)

    // Views
    const views = await db.rawQuery("SHOW FULL TABLES WHERE Table_Type = 'VIEW'")
    const viewCount = views[0].length
    console.log(`✓ Views: ${viewCount} ${viewCount === 2 ? '✅' : '❌ Expected 2'}`)

    // Data counts
    console.log('\n📊 DATA VERIFICATION:')
    const userCount = await db.from('users').count('* as total')
    console.log(`  Users: ${userCount[0].total}`)

    const orgCount = await db.from('organizations').count('* as total')
    console.log(`  Organizations: ${orgCount[0].total}`)

    const taskCount = await db.from('tasks').count('* as total')
    console.log(`  Tasks: ${taskCount[0].total}`)

    const convCount = await db.from('conversations').count('* as total')
    console.log(`  Conversations: ${convCount[0].total}`)

    const msgCount = await db.from('messages').count('* as total')
    console.log(`  Messages: ${msgCount[0].total}`)

    // Migration history
    const migrationCount = await db.from('adonis_schema').count('* as total')
    console.log(`\n📝 Migration History: ${migrationCount[0].total} migrations recorded`)

    // Summary
    console.log('\n╔════════════════════════════════════════╗')
    if (tableCount === 32 && procCount === 32 && triggerCount === 19 && viewCount === 2 && migrationCount[0].total > 0) {
      console.log('║  ✅✅✅ RESTORE SUCCESSFUL! ✅✅✅      ║')
    } else {
      console.log('║  ⚠️  RESTORE INCOMPLETE - CHECK ABOVE  ║')
    }
    console.log('╚════════════════════════════════════════╝\n')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    process.exit(1)
  }
}

verifyRestore()
