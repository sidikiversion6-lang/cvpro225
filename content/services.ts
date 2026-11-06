import { EXPRESS, formatFcfa, getOffre, isLaunchActive, launchEndLabel, prixOffre } from '@/lib/offres'

export interface ServiceHero {
  badge: string
  titre: string
  sousTitre: string
  ctaPrincipal: { label: string; href: string }
  ctaSecondaire: { label: string; href: string }
}

export interface Accroche {
  titre: string
  texte: string
}

export interface Prestation {
  titre: string
  description: string
  items?: string[]
}

export interface PackColonne {
  nom: string
  prix: string
  periode?: string
  recommande: boolean
}

export interface PackLigne {
  label: string
  valeurs: string[]
}

export interface PacksSection {
  colonnes: PackColonne[]
  lignes: PackLigne[]
  note?: string
}

export interface Etape {
  num: number
  titre: string
  description: string
}

export interface Temoignage {
  nom: string
  ville: string
  pack?: string
  note: number
  texte: string
}

export interface FAQItem {
  question: string
  reponse: string
}

export interface CtaFinal {
  titre: string
  btnPrincipal: { label: string; href: string }
  btnSecondaire: { label: string; href: string }
}

export interface SecteurLigne {
  secteur: string
  sources: string
}

export interface DestinationLigne {
  destination: string
  plateforme: string
  formulaire: string
}

/* ======================================================================
   CV PRO ATS
   ====================================================================== */

export const cvPro = {
  slug: 'cv-pro',
  couleur: '#0F7B5A',

  hero: {
    badge: 'CV Pro ATS',
    titre: 'Un CV qui parle pour vous, même avant l\'entretien',
    sousTitre: 'Nous créons votre CV professionnel, optimisé pour les logiciels ATS et adapté aux standards des recruteurs en Côte d\'Ivoire et à l\'international.',
    ctaPrincipal: { label: 'Commander mon CV', href: '/commander?service=cv' },
    ctaSecondaire: { label: 'Voir un exemple', href: '#exemple' },
  } as ServiceHero,

  accroche: {
    titre: 'Ce que vous ne savez peut-être pas...',
    texte: 'Les recruteurs utilisent des logiciels ATS (Applicant Tracking System) pour trier les candidatures. Un CV mal formaté ou sans les bons mots-clés risque d\'être écarté avant même d\'être lu. Les grandes entreprises, ONG et institutions s\'en servent pour scanner et classer les CV selon des critères précis de mise en forme et de mots-clés. Un CV mal structuré, avec des tableaux, des colonnes ou des polices fantaisie, sera rejeté en quelques secondes — peu importe vos compétences. Chez CVPro225, nous connaissons ces règles. Nous créons des CV qui passent ces filtres et qui impressionnent les recruteurs.',
  } as Accroche,

  prestations: [
    'Entretien personnalisé pour collecter vos informations (formulaire en ligne ou WhatsApp)',
    'Rédaction professionnelle de votre CV en français et/ou en anglais',
    'Structure optimisée ATS : sections claires, mots-clés sectoriels, format compatible',
    'Mise en page sobre et moderne, lisible par les logiciels et les humains',
    'Livraison en formats PDF et DOCX modifiables',
    'Audit de votre CV existant avec score ATS et recommandations détaillées',
    'Lettre de motivation personnalisée adaptée à votre secteur (offres CV Pro ATS + Lettre de motivation et JobAssist)',
    'Optimisation de votre profil LinkedIn (offre JobAssist)',
  ],

  packs: {
    colonnes: [
      { nom: 'CV Pro ATS', get prix() { return formatFcfa(prixOffre(getOffre('cv-pro-ats')!)) }, recommande: true },
    ],
    lignes: [
      { label: 'CV professionnel (PDF + DOCX)', valeurs: ['✓'] },
      { label: 'Optimisation ATS avancée + rapport', valeurs: ['✓'] },
      { label: 'Mots-clés adaptés à votre secteur', valeurs: ['✓'] },
      { label: 'Retouches incluses', valeurs: ['✓'] },
      { label: 'Délai de livraison', valeurs: ['48h'] },
    ],
    note: 'Besoin d\'un CV en urgence (moins de 6h) ? Contactez-nous directement sur WhatsApp pour un tarif express.',
  } as PacksSection,

  processus: [
    { num: 1, titre: 'Vous commandez', description: 'Choisissez votre pack et remplissez le formulaire en ligne, ou envoyez-nous un message sur WhatsApp. Pas besoin de CV existant — on part de zéro si nécessaire.' },
    { num: 2, titre: 'On rédige pour vous', description: 'Notre équipe analyse votre parcours, identifie les mots-clés de votre secteur et rédige un CV structuré selon les standards ATS internationaux.' },
    { num: 3, titre: 'Vous validez', description: 'Vous recevez votre CV par email. Si quelque chose ne vous convient pas, on ajuste selon le nombre de retouches inclus dans votre pack.' },
    { num: 4, titre: 'Vous êtes prêt(e)', description: 'Vous recevez vos fichiers finaux PDF et DOCX. Vous pouvez postuler en toute confiance.' },
  ] as Etape[],

  pourquoi: [
    'Équipe formée aux standards ATS des recruteurs internationaux',
    'Expérience dans les secteurs clés en Côte d\'Ivoire : mines, banque, télécoms, ONG, administration',
    'Satisfait ou refait : nous retravaillons votre CV gratuitement jusqu\'à votre satisfaction.',
  ],

  temoignages: [
    { nom: 'Koffi Kouassi', ville: 'Abidjan', note: 5, texte: 'J\'avais postulé plusieurs fois sans réponse. Après avoir fait refaire mon CV par CVPro225, j\'ai été convoqué pour un entretien à la BAD en moins de deux semaines. La différence était flagrante.' },
    { nom: 'Aya Konaté', ville: 'Bouaké', pack: 'Standard', note: 5, texte: 'Le service est rapide, professionnel et abordable. J\'ai reçu mon CV en moins de 24h et la lettre de motivation était vraiment personnalisée à mon secteur. Je recommande à tous mes collègues.' },
    { nom: 'Yao N\'Guessan', ville: 'Abidjan', pack: 'Premium', note: 5, texte: 'Non seulement ils m\'ont fait un excellent CV, mais l\'optimisation LinkedIn m\'a permis d\'être contacté directement par un recruteur d\'une ONG internationale. Valeur inestimable.' },
  ] as Temoignage[],

  faq: [
    { question: 'Mon CV sera-t-il vraiment lu par les recruteurs ?', reponse: 'Oui. Notre méthode garantit que votre CV passe les filtres ATS ET est agréable à lire pour un humain. Nous utilisons une structure validée par des recruteurs RH.' },
    { question: 'Je n\'ai pas encore d\'expérience professionnelle, pouvez-vous quand même m\'aider ?', reponse: 'Absolument. Nous savons mettre en valeur votre formation, vos projets, votre bénévolat et vos compétences pour créer un CV percutant même sans expérience.' },
    { question: 'Dans quelle langue mon CV sera-t-il rédigé ?', reponse: 'En français par défaut. Sur demande, nous pouvons le rédiger en anglais ou en version bilingue selon votre secteur cible.' },
    { question: 'Que se passe-t-il si je ne suis pas satisfait ?', reponse: 'Satisfait ou refait : nous retravaillons votre CV gratuitement jusqu\'à votre satisfaction. Signalez-nous simplement ce qui ne vous convient pas sur WhatsApp.' },
    { question: 'Comment vous transmettre mes informations ?', reponse: 'Via notre formulaire en ligne sécurisé ou directement par WhatsApp. Nous nous adaptons à votre confort.' },
  ] as FAQItem[],

  ctaFinal: {
    titre: 'Prêt(e) à décrocher le poste que vous méritez ?',
    btnPrincipal: { label: 'Commander mon CV maintenant', href: '/commander?service=cv' },
    btnSecondaire: { label: 'Nous contacter sur WhatsApp', href: '#whatsapp' },
  } as CtaFinal,
}

/* ======================================================================
   JOBASSIST
   ====================================================================== */

export const jobAssist = {
  slug: 'job-assist',
  couleur: '#D97706',

  hero: {
    badge: 'JobAssist',
    titre: 'Un dossier de candidature complet, prêt pour l\'entretien',
    sousTitre: 'CV Pro ATS, lettre de motivation personnalisée, profil LinkedIn optimisé et coaching entretien : tout ce qu\'il faut pour postuler avec confiance en Côte d\'Ivoire et à l\'international.',
    ctaPrincipal: { label: 'Commander JobAssist', href: '/commander?offre=jobassist' },
    ctaSecondaire: { label: 'Voir l\'offre', href: '#packs' },
  } as ServiceHero,

  accroche: {
    titre: 'Postuler, ce n\'est pas seulement envoyer un CV',
    texte: 'Un recruteur juge votre candidature en quelques instants : votre CV, votre lettre de motivation et votre profil LinkedIn doivent raconter la même histoire, avec les bons mots-clés pour passer les logiciels ATS. Ensuite, c\'est l\'entretien qui fait la différence. JobAssist réunit ces quatre éléments en une seule offre : nous rédigeons vos documents, optimisons votre profil LinkedIn et vous préparons à l\'entretien, pour que vous vous présentiez sereinement face aux recruteurs ivoiriens et internationaux.',
  } as Accroche,

  prestations: [
    {
      titre: 'CV Pro ATS',
      description: 'Un CV professionnel, optimisé pour les logiciels de recrutement (ATS).',
      items: [
        'CV PDF + DOCX modifiable',
        'Mots-clés adaptés à votre secteur et au poste visé',
        'Mise en forme lisible par les ATS et par les recruteurs',
      ],
    },
    {
      titre: 'Lettre de motivation personnalisée',
      description: 'Une lettre qui met en valeur votre parcours pour le poste visé.',
      items: [
        'Rédigée à partir de votre profil et de votre cible',
        'Adaptée au secteur (banque, télécoms, ONG, administration…)',
        'Format prêt à envoyer',
      ],
    },
    {
      titre: 'Optimisation du profil LinkedIn',
      description: 'Un profil cohérent avec votre CV, visible par les recruteurs.',
      items: [
        'Titre et résumé percutants',
        'Expériences et compétences reformulées',
        'Mots-clés pour apparaître dans les recherches des recruteurs',
      ],
    },
    {
      titre: 'Coaching entretien',
      description: 'Une préparation concrète pour aborder l\'entretien avec confiance.',
      items: [
        'Questions fréquentes selon votre secteur',
        'Simulation d\'entretien par écrit ou sur WhatsApp',
        'Conseils de présentation et réponse à la question du salaire',
      ],
    },
  ] as Prestation[],

  packs: {
    colonnes: [
      { nom: 'JobAssist', get prix() { return formatFcfa(prixOffre(getOffre('jobassist')!)) }, recommande: true },
    ],
    lignes: [
      { label: 'CV Pro ATS', valeurs: ['✓'] },
      { label: 'Lettre de motivation personnalisée', valeurs: ['✓'] },
      { label: 'Optimisation du profil LinkedIn', valeurs: ['✓'] },
      { label: 'Coaching entretien', valeurs: ['✓'] },
      { label: 'Délai de livraison', valeurs: ['72h'] },
    ],
    note: 'En recherche active ? Contactez-nous sur WhatsApp pour un accompagnement sur la durée.',
  } as PacksSection,

  // Exemples d'employeurs en Côte d'Ivoire (aucun partenariat : simples exemples de cibles)
  secteurs: [
    { secteur: 'Banque & Finance', sources: 'Banques et institutions financières d\'Abidjan (Société Générale CI, Ecobank CI, NSIA Banque…)' },
    { secteur: 'Télécommunications & IT', sources: 'Orange CI, MTN CI, Moov Africa CI, ESN et startups' },
    { secteur: 'ONG & Organisations internationales', sources: 'Agences des Nations unies, BAD, ONG nationales et internationales' },
    { secteur: 'Mines & Énergie', sources: 'Sociétés minières, pétrolières et énergéticiennes opérant en Côte d\'Ivoire' },
    { secteur: 'Agro-industrie', sources: 'Filières cacao, anacarde, hévéa et palmier à huile' },
    { secteur: 'Administration publique', sources: 'Concours de la fonction publique, ministères, agences publiques' },
    { secteur: 'BTP & Ingénierie', sources: 'Entreprises de construction, bureaux d\'études' },
    { secteur: 'Santé & Éducation', sources: 'Cliniques, hôpitaux, établissements d\'enseignement' },
  ] as SecteurLigne[],

  temoignages: [
    { nom: 'Kouadio Aka', ville: 'Abidjan', pack: 'Mensuel', note: 5, texte: 'Après 6 mois de recherche sans succès, j\'ai souscrit au pack mensuel. En 3 semaines, l\'équipe avait soumis 8 candidatures pour moi dans le secteur minier. J\'ai eu 2 entretiens et une offre d\'embauche.' },
    { nom: 'Adjoua Tanoh', ville: 'Abidjan', pack: '1 Candidature', note: 5, texte: 'Je voulais postuler à une offre du PNUD mais le processus était en anglais et très compliqué. CVPro225 a tout géré en moins de 3 heures. J\'ai été sélectionnée pour l\'entretien.' },
    { nom: 'Koffi Brou', ville: 'Yamoussoukro', pack: '3 Candidatures', note: 5, texte: 'Habitant en région, il m\'était difficile de suivre les offres d\'Abidjan. Avec JobAssist, j\'ai eu un suivi personnalisé et on m\'a aidé à me préparer pour mon entretien à distance. Je suis maintenant employé à Abidjan.' },
  ] as Temoignage[],

  // Prix lus dans lib/offres.ts au moment du rendu (offre de lancement incluse).
  faq: [
    { question: 'Que comprend l\'offre JobAssist ?', reponse: 'JobAssist réunit tout ce qu\'il faut pour postuler : votre CV Pro ATS, une lettre de motivation personnalisée, l\'optimisation de votre profil LinkedIn et un coaching entretien. Livraison en 72h.' },
    {
      question: 'Combien coûte JobAssist ?',
      get reponse() {
        const o = getOffre('jobassist')!
        const fin = launchEndLabel()
        return isLaunchActive()
          ? `${formatFcfa(o.prixLancement)} au lieu de ${formatFcfa(o.prixNormal)} pendant l\'offre de lancement${fin ? ` (jusqu\'au ${fin})` : ''}. Option Express : +${formatFcfa(EXPRESS.prix)}. Paiement en ligne à la commande.`
          : `${formatFcfa(o.prixNormal)}. Option Express : +${formatFcfa(EXPRESS.prix)}. Paiement en ligne à la commande.`
      },
    },
    { question: 'Puis-je recevoir mes documents plus vite ?', get reponse() { return `Oui, avec l\'${EXPRESS.nom} : livraison en ${EXPRESS.delai} pour +${formatFcfa(EXPRESS.prix)}. Il suffit de cocher l\'option au moment de la commande.` } },
    { question: 'Je n\'ai pas encore de CV, puis-je commander ?', reponse: 'Oui. Répondez « Non » à la question « Avez-vous déjà un CV ? » : après votre paiement, un conseiller vous contacte sur WhatsApp pour recueillir vos informations (poste recherché, expériences, formations, compétences).' },
    { question: 'Que se passe-t-il si je ne suis pas satisfait ?', reponse: 'Satisfait ou refait : nous retravaillons votre CV gratuitement jusqu\'à votre satisfaction. Signalez-nous simplement ce qui ne vous convient pas sur WhatsApp.' },
    { question: 'Je suis encore étudiant, est-ce adapté à une recherche de stage ?', reponse: 'Oui. Nous adaptons votre CV, votre lettre de motivation et votre profil LinkedIn à une recherche de stage. Précisez-le à votre conseiller sur WhatsApp.' },
  ] as FAQItem[],

  ctaFinal: {
    titre: 'Votre prochain employeur vous cherche aussi.',
    btnPrincipal: { label: 'Commander JobAssist', href: '/commander?offre=jobassist' },
    btnSecondaire: { label: 'Nous contacter sur WhatsApp', href: '#whatsapp' },
  } as CtaFinal,
}

/* ======================================================================
   TENDERPRO
   ====================================================================== */

export const servicesContent = { cvPro, jobAssist }
