import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const rawAdminPassword = process.env.SEED_ADMIN_PASSWORD
  if (!rawAdminPassword || rawAdminPassword.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD manquant ou trop court (12 caractères minimum)')
  }
  const adminPassword = await bcrypt.hash(rawAdminPassword, 12)
  await prisma.user.upsert({
    where: { email: 'admin@cvpro225.com' },
    update: {},
    create: {
      nom: 'Admin',
      prenom: 'CVPro225',
      email: 'admin@cvpro225.com',
      password: adminPassword,
      role: 'admin',
      telephone: process.env.NEXT_PUBLIC_WHATSAPP || '',
    },
  })

  // Offres et prix : source unique = lib/offres.ts (affichage + paiement).
  // Les tables héritées service_configs / packs / pack_features (prix en GNF
  // d'une ancienne version) ne sont plus alimentées : aucune page ne les lit.

  const configs = [
    { cle: 'whatsapp', valeur: process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41', type: 'text', groupe: 'contact', label: 'Numéro WhatsApp' },
    { cle: 'email_contact', valeur: 'contact@cvpro225.com', type: 'email', groupe: 'contact', label: 'Email contact' },
    { cle: 'email_admin', valeur: 'admin@cvpro225.com', type: 'email', groupe: 'contact', label: 'Email admin' },
    { cle: 'adresse', valeur: 'Abidjan, République de Côte d\'Ivoire', type: 'text', groupe: 'contact', label: 'Adresse' },
    { cle: 'hero_titre', valeur: 'Votre partenaire professionnel en Côte d\'Ivoire', type: 'text', groupe: 'accueil', label: 'Titre Hero' },
    { cle: 'hero_sous_titre', valeur: 'CV optimisé ATS, assistance visa, candidature emploi et appels d\'offres.', type: 'textarea', groupe: 'accueil', label: 'Sous-titre Hero' },
    { cle: 'stat_clients', valeur: '500+', type: 'text', groupe: 'stats', label: 'Stat clients' },
    { cle: 'stat_satisfaction', valeur: '96%', type: 'text', groupe: 'stats', label: 'Stat satisfaction' },
    { cle: 'stat_delai', valeur: '48h', type: 'text', groupe: 'stats', label: 'Stat délai' },
    { cle: 'maintenance_mode', valeur: 'false', type: 'boolean', groupe: 'systeme', label: 'Mode maintenance' },
    { cle: 'nouvelles_commandes', valeur: 'true', type: 'boolean', groupe: 'systeme', label: 'Accepter commandes' },
  ]
  for (const c of configs) {
    await prisma.siteConfig.upsert({ where: { cle: c.cle }, update: c, create: c })
  }

  console.log('✅ Seed terminé')
}

main().catch(console.error).finally(() => prisma.$disconnect())
