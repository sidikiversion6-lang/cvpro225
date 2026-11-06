/**
 * Tâches de fond du serveur Next.js (appelé une fois au démarrage du serveur).
 *
 * Purge des CV stockés : 10 min après le démarrage, puis toutes les 24 h
 * (cf. lib/cv-purge.ts). Désactivable avec CV_PURGE_DISABLED=true.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.NEXT_PHASE === 'phase-production-build') return
  if (process.env.CV_PURGE_DISABLED === 'true') return

  const { purgerCvExpires, purgeDepsReelles } = await import('./lib/cv-purge')
  const run = async () => {
    try {
      await purgerCvExpires(await purgeDepsReelles())
    } catch (err) {
      console.error('[purge CV] exécution impossible', err)
    }
  }
  const DAY = 24 * 60 * 60 * 1000
  setTimeout(() => {
    void run()
    setInterval(() => void run(), DAY).unref()
  }, 10 * 60 * 1000).unref()
}
