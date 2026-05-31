import 'dotenv/config'
import cron from 'node-cron'

const schedule = process.env.COLLECT_CRON_SCHEDULE || '0 14 * * 0'

console.log(`Trend Sensor cron started. Schedule: ${schedule}`)

cron.schedule(schedule, async () => {
  console.log(`[${new Date().toISOString()}] Running weekly collection...`)
  try {
    const { execSync } = await import('child_process')
    execSync('tsx scripts/collect.ts', { stdio: 'inherit' })
  } catch (err) {
    console.error('Cron collection failed:', err)
  }
})
