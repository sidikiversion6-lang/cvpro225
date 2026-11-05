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

  const services = [
    {
      slug: 'cv', nom: 'CV Pro ATS', icone: '📄', couleur: '#C41E3A',
      description: 'CV professionnel optimisé ATS',
      packs: [
        { slug: 'basic', nom: 'Basic', prix: 150000, delai: '72h', ordre: 1, features: [
          { label: 'CV professionnel PDF + DOCX', inclus: true, ordre: 1 },
          { label: 'Optimisation ATS basique', inclus: true, ordre: 2 },
          { label: '1 retouche incluse', inclus: true, ordre: 3 },
          { label: 'Score ATS + rapport', inclus: false, ordre: 4 },
          { label: 'Lettre de motivation', inclus: false, ordre: 5 },
          { label: 'Profil LinkedIn', inclus: false, ordre: 6 },
        ]},
        { slug: 'standard', nom: 'Standard', prix: 250000, delai: '48h', recommande: true, badge: 'Recommandé', ordre: 2, features: [
          { label: 'CV professionnel PDF + DOCX', inclus: true, ordre: 1 },
          { label: 'Optimisation ATS avancée', inclus: true, ordre: 2 },
          { label: 'Score ATS + rapport d\'audit', inclus: true, ordre: 3 },
          { label: 'Lettre de motivation', inclus: true, ordre: 4 },
          { label: '2 retouches incluses', inclus: true, ordre: 5 },
          { label: 'Profil LinkedIn', inclus: false, ordre: 6 },
        ]},
        { slug: 'premium', nom: 'Premium', prix: 400000, delai: '24h', ordre: 3, features: [
          { label: 'CV professionnel PDF + DOCX', inclus: true, ordre: 1 },
          { label: 'Optimisation ATS avancée', inclus: true, ordre: 2 },
          { label: 'Score ATS + rapport d\'audit', inclus: true, ordre: 3 },
          { label: 'Lettre de motivation', inclus: true, ordre: 4 },
          { label: 'Profil LinkedIn optimisé', inclus: true, ordre: 5 },
          { label: '3 retouches + support prioritaire', inclus: true, ordre: 6 },
        ]},
      ],
    },
    {
      slug: 'visa', nom: 'Visa Check', icone: '🛂', couleur: '#009460',
      description: 'Vérification et assistance dossier visa',
      packs: [
        { slug: 'analyse', nom: 'Analyse', prix: 100000, delai: '24h', ordre: 1, features: [
          { label: 'Score conformité sur 100%', inclus: true, ordre: 1 },
          { label: 'Rapport documents manquants', inclus: true, ordre: 2 },
          { label: 'Recommandations détaillées', inclus: true, ordre: 3 },
          { label: 'Remplissage formulaire', inclus: false, ordre: 4 },
          { label: 'Prise de RDV consulaire', inclus: false, ordre: 5 },
        ]},
        { slug: 'assistance', nom: 'Assistance', prix: 250000, delai: '48h', recommande: true, badge: 'Le plus populaire', ordre: 2, features: [
          { label: 'Score conformité sur 100%', inclus: true, ordre: 1 },
          { label: 'Remplissage formulaire officiel', inclus: true, ordre: 2 },
          { label: 'Prise de RDV consulaire', inclus: true, ordre: 3 },
          { label: 'Suivi partiel jusqu\'au dépôt', inclus: true, ordre: 4 },
          { label: 'Documents annexes', inclus: false, ordre: 5 },
        ]},
        { slug: 'complet', nom: 'Pack Complet', prix: 450000, delai: '72h', ordre: 3, features: [
          { label: 'Formulaire + RDV + documents', inclus: true, ordre: 1 },
          { label: 'Réservation hôtel + billet', inclus: true, ordre: 2 },
          { label: 'Préparation entretien', inclus: true, ordre: 3 },
          { label: 'Suivi complet jusqu\'au dépôt', inclus: true, ordre: 4 },
        ]},
      ],
    },
    {
      slug: 'job', nom: 'JobAssist', icone: '💼', couleur: '#D97706',
      description: 'Assistance candidature emploi',
      packs: [
        { slug: 'candidature-1', nom: '1 Candidature', prix: 120000, delai: '24h', ordre: 1, features: [
          { label: 'CV adapté à l\'offre', inclus: true, ordre: 1 },
          { label: 'Lettre de motivation', inclus: true, ordre: 2 },
          { label: 'Soumission plateforme', inclus: true, ordre: 3 },
          { label: 'Veille offres', inclus: false, ordre: 4 },
        ]},
        { slug: 'pack-3', nom: 'Pack 3', prix: 300000, delai: '72h', recommande: true, badge: 'Meilleur rapport', ordre: 2, features: [
          { label: '3 candidatures soumises', inclus: true, ordre: 1 },
          { label: 'Veille + suivi', inclus: true, ordre: 2 },
          { label: '1 entretien inclus', inclus: true, ordre: 3 },
          { label: '1 candidature express', inclus: true, ordre: 4 },
        ]},
        { slug: 'mensuel', nom: 'Pack Mensuel', prix: 500000, delai: '30 jours', ordre: 3, features: [
          { label: 'Candidatures illimitées', inclus: true, ordre: 1 },
          { label: 'Veille quotidienne', inclus: true, ordre: 2 },
          { label: 'Entretiens illimités', inclus: true, ordre: 3 },
          { label: '3 candidatures express', inclus: true, ordre: 4 },
        ]},
      ],
    },
    {
      slug: 'tender', nom: 'TenderPro', icone: '📋', couleur: '#CE1126',
      description: 'Veille et réponse aux appels d\'offres',
      packs: [
        { slug: 'par-dossier', nom: 'Par Dossier', prix: 600000, delai: '5 jours', ordre: 1, features: [
          { label: 'Analyse d\'éligibilité', inclus: true, ordre: 1 },
          { label: 'Constitution dossier complet', inclus: true, ordre: 2 },
          { label: 'Vérification conformité', inclus: true, ordre: 3 },
          { label: 'Alertes AO', inclus: false, ordre: 4 },
        ]},
        { slug: 'mensuel-tender', nom: 'Mensuel', prix: 400000, delai: 'Mensuel', recommande: true, badge: 'Recommandé PME', ordre: 2, features: [
          { label: 'Alertes AO (1 secteur)', inclus: true, ordre: 1 },
          { label: '2 dossiers/mois', inclus: true, ordre: 2 },
          { label: 'Modèles réutilisables', inclus: true, ordre: 3 },
          { label: 'Accompagnement prioritaire', inclus: false, ordre: 4 },
        ]},
        { slug: 'annuel', nom: 'Annuel', prix: 3500000, delai: 'Annuel', badge: '−30%', ordre: 3, features: [
          { label: 'Alertes AO (3 secteurs)', inclus: true, ordre: 1 },
          { label: '4 dossiers/mois', inclus: true, ordre: 2 },
          { label: 'Accompagnement prioritaire', inclus: true, ordre: 3 },
          { label: 'Archives AO complètes', inclus: true, ordre: 4 },
        ]},
      ],
    },
  ]

  for (const svc of services) {
    const { packs, ...svcData } = svc
    const created = await prisma.serviceConfig.upsert({
      where: { slug: svcData.slug },
      update: svcData,
      create: svcData,
    })
    for (const pack of packs) {
      const { features, ...packData } = pack
      const existing = await prisma.pack.findFirst({ where: { serviceId: created.id, slug: packData.slug } })
      let createdPack
      if (existing) {
        createdPack = await prisma.pack.update({ where: { id: existing.id }, data: packData })
        await prisma.packFeature.deleteMany({ where: { packId: createdPack.id } })
      } else {
        createdPack = await prisma.pack.create({ data: { ...packData, serviceId: created.id } })
      }
      await prisma.packFeature.createMany({ data: features.map((f) => ({ ...f, packId: createdPack.id })) })
    }
  }

  const configs = [
    { cle: 'whatsapp', valeur: '+224620000000', type: 'text', groupe: 'contact', label: 'Numéro WhatsApp' },
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
