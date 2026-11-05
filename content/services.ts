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
    titre: 'Un CV qui parle pour vous même avant l\'entretien',
    sousTitre: 'Nous créons votre CV professionnel, optimisé pour les logiciels ATS et adapté aux standards des recruteurs en Côte d\'Ivoire et à l\'international.',
    ctaPrincipal: { label: 'Commander mon CV', href: '/commander?service=cv' },
    ctaSecondaire: { label: 'Voir un exemple', href: '#exemple' },
  } as ServiceHero,

  accroche: {
    titre: 'Ce que vous ne savez peut-être pas...',
    texte: 'Saviez-vous que plus de 75 % des CV sont éliminés automatiquement avant même d\'être lus par un recruteur humain ? La raison ? Les grandes entreprises, ONG et institutions utilisent des logiciels appelés ATS (Applicant Tracking System) qui scannent et classent les CV selon des critères précis de mise en forme et de mots-clés. Un CV mal structuré, avec des tableaux, des colonnes ou des polices fantaisie, sera rejeté en quelques secondes — peu importe vos compétences. Chez CVPro225, nous connaissons ces règles. Nous créons des CV qui passent ces filtres et qui impressionnent les recruteurs.',
  } as Accroche,

  prestations: [
    'Entretien personnalisé pour collecter vos informations (formulaire en ligne ou WhatsApp)',
    'Rédaction professionnelle de votre CV en français et/ou en anglais',
    'Structure optimisée ATS : sections claires, mots-clés sectoriels, format compatible',
    'Mise en page sobre et moderne, lisible par les logiciels et les humains',
    'Livraison en formats PDF et DOCX modifiables',
    'Audit de votre CV existant avec score ATS et recommandations détaillées (packs Standard et Premium)',
    'Lettre de motivation personnalisée adaptée à votre secteur (packs Standard et Premium)',
    'Optimisation de votre profil LinkedIn (pack Premium uniquement)',
  ],

  packs: {
    colonnes: [
      { nom: 'CV Pro ATS', prix: '15 000 FCFA', recommande: true },
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
    'Plus de 500 CV créés depuis notre lancement',
    'Taux de satisfaction client : 96 %',
    'Livraison garantie dans les délais ou remboursement',
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
    { question: 'Que se passe-t-il si je ne suis pas satisfait ?', reponse: 'Vous bénéficiez de retouches incluses selon votre pack (1 à 3). Si après retouches vous n\'êtes toujours pas satisfait, nous vous remboursons intégralement.' },
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
    titre: 'Trouvez l\'emploi qui vous correspond on s\'occupe du reste',
    sousTitre: 'Identification des offres dans votre domaine, rédaction des candidatures, soumission en ligne et préparation aux entretiens. Vous vous concentrez sur vos compétences, on s\'occupe du processus.',
    ctaPrincipal: { label: 'Déposer mon profil', href: '/commander?service=job' },
    ctaSecondaire: { label: 'Voir les offres disponibles', href: '#secteurs' },
  } as ServiceHero,

  accroche: {
    titre: 'Postuler en ligne, ce n\'est pas si simple',
    texte: 'Trouver une offre d\'emploi, comprendre les critères, créer un compte sur le site de l\'employeur, adapter son CV, rédiger une lettre de motivation, soumettre le tout dans les délais... Ce processus décourage beaucoup de candidats talentueux. En Côte d\'Ivoire, postuler à des offres d\'emploi formelles reste un défi pour beaucoup : plateformes en anglais, systèmes de candidature complexes, offres éparpillées sur des dizaines de sites différents. JobAssist existe pour que vous ne passiez plus à côté d\'une opportunité à cause du processus.',
  } as Accroche,

  prestations: [
    {
      titre: 'Veille des offres dans votre domaine',
      description: 'Nous surveillons en continu les sources d\'emploi pertinentes pour votre profil.',
      items: [
        'Portails locaux : 224Business, Emploi Guinée, AGUIPE',
        'Institutions internationales : PNUD, UNICEF, Banque Mondiale, BAD, OIM',
        'Secteur privé : minières, banques, télécoms, ONG',
        'Plateformes globales : LinkedIn, Indeed, Devex, ReliefWeb',
        'Sites d\'employeurs directs selon votre profil',
      ],
    },
    {
      titre: 'Candidature complète et personnalisée',
      description: 'Pour chaque offre ciblée, nous gérons l\'intégralité du processus.',
      items: [
        'Un CV adapté aux mots-clés et exigences de l\'offre',
        'Une lettre de motivation sur mesure qui met en valeur votre profil',
        'La soumission complète sur la plateforme de l\'employeur',
        'La confirmation de réception et le suivi',
      ],
    },
    {
      titre: 'Préparation aux entretiens',
      description: 'Nous vous préparons pour maximiser vos chances lors des entretiens.',
      items: [
        'Questions fréquentes par secteur (mines, banque, ONG, administration...)',
        'Simulation d\'entretien par écrit ou WhatsApp',
        'Conseils sur la présentation, la posture et les erreurs à éviter',
        'Négociation salariale : comment répondre à la question du salaire',
      ],
    },
  ] as Prestation[],

  packs: {
    colonnes: [
      { nom: 'JobAssist', prix: '30 000 FCFA', recommande: true },
    ],
    lignes: [
      { label: 'Tout le CV Pro ATS, plus :', valeurs: ['✓'] },
      { label: 'Lettre de motivation personnalisée', valeurs: ['✓'] },
      { label: 'Optimisation du profil LinkedIn', valeurs: ['✓'] },
      { label: 'Coaching candidature', valeurs: ['✓'] },
      { label: 'Délai de livraison', valeurs: ['72h'] },
    ],
    note: 'En recherche active ? Contactez-nous sur WhatsApp pour un accompagnement sur la durée.',
  } as PacksSection,

  secteurs: [
    { secteur: 'Mines & Ressources naturelles', sources: 'SMFG, CBG, Rio Tinto, SMB, offres sectorielles' },
    { secteur: 'Banque & Finance', sources: 'BCRG, Ecobank, Société Générale, Coris Bank, UBA' },
    { secteur: 'Télécommunications', sources: 'Orange CI, MTN CI, Moov Africa' },
    { secteur: 'ONG & Humanitaire', sources: 'PNUD, UNICEF, MSF, IRC, PAM, OCHA, ReliefWeb' },
    { secteur: 'Administration publique', sources: 'AGUIPE, Journal Officiel, Ministères' },
    { secteur: 'BTP & Ingénierie', sources: 'Cabinets d\'ingénierie, bailleurs de fonds' },
    { secteur: 'Santé', sources: 'OMS, UNFPA, cliniques privées, hôpitaux' },
    { secteur: 'Éducation & Formation', sources: 'Universités, écoles privées, organismes de formation' },
  ] as SecteurLigne[],

  temoignages: [
    { nom: 'Kouadio Aka', ville: 'Abidjan', pack: 'Mensuel', note: 5, texte: 'Après 6 mois de recherche sans succès, j\'ai souscrit au pack mensuel. En 3 semaines, l\'équipe avait soumis 8 candidatures pour moi dans le secteur minier. J\'ai eu 2 entretiens et une offre d\'embauche.' },
    { nom: 'Adjoua Tanoh', ville: 'Abidjan', pack: '1 Candidature', note: 5, texte: 'Je voulais postuler à une offre du PNUD mais le processus était en anglais et très compliqué. CVPro225 a tout géré en moins de 3 heures. J\'ai été sélectionnée pour l\'entretien.' },
    { nom: 'Koffi Brou', ville: 'Yamoussoukro', pack: '3 Candidatures', note: 5, texte: 'Habitant en région, il m\'était difficile de suivre les offres d\'Abidjan. Avec JobAssist, j\'ai eu un suivi personnalisé et on m\'a aidé à me préparer pour mon entretien à distance. Je suis maintenant employé à Abidjan.' },
  ] as Temoignage[],

  faq: [
    { question: 'Puis-je vous donner une offre spécifique que j\'ai trouvée moi-même ?', reponse: 'Absolument. Avec le pack « 1 Candidature », vous nous transmettez le lien de l\'offre et nous gérons tout le processus de candidature pour vous.' },
    { question: 'Que se passe-t-il si je ne suis pas sélectionné ?', reponse: 'Le processus de recrutement dépend de l\'employeur. Nous garantissons la qualité de la candidature soumise. En cas de refus, nous analysons le retour si disponible et vous conseillons pour la suite.' },
    { question: 'Combien d\'offres me proposez-vous chaque semaine avec le pack mensuel ?', reponse: 'En moyenne 5 à 10 offres par semaine selon votre profil et votre secteur. Vous validez les offres qui vous intéressent avant que nous soumettions la candidature.' },
    { question: 'Je suis encore étudiant, pouvez-vous m\'aider à trouver un stage ?', reponse: 'Oui, nous accompagnons aussi les étudiants pour des recherches de stage. Mentionnez-le lors de votre commande pour que nous adaptions notre veille.' },
  ] as FAQItem[],

  ctaFinal: {
    titre: 'Votre prochain employeur vous cherche aussi.',
    btnPrincipal: { label: 'Déposer mon profil maintenant', href: '/commander?service=job' },
    btnSecondaire: { label: 'Nous contacter sur WhatsApp', href: '#whatsapp' },
  } as CtaFinal,
}

/* ======================================================================
   TENDERPRO
   ====================================================================== */

export const servicesContent = { cvPro, jobAssist }
