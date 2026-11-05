export interface StrapiResponse<T> {
  data: StrapiData<T>[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export interface StrapiData<T> {
  id: number
  attributes: T & {
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

export interface Article {
  id: number
  titre: string
  slug: string
  contenu: string
  image: string
  categorie: string
  extrait: string
  auteur: string
  date_publication: string
  seo_title: string
  seo_description: string
}

export interface Temoignage {
  id: number
  nom: string
  service: string
  note: number
  texte: string
  photo: string
  ville: string
}

export interface OffreEmploi {
  id: number
  titre: string
  entreprise: string
  secteur: string
  lieu: string
  type_contrat: string
  description: string
  date_limite: string
  lien: string
  actif: boolean
}

export interface AppelOffres {
  id: number
  titre: string
  organisme: string
  secteur: string
  budget_estime: number
  date_limite: string
  description: string
  document_url: string
  actif: boolean
}

export interface Pack {
  nom: string
  prix: number
  devise: string
  features: string[]
  recommande: boolean
}

export interface ServiceGP {
  id: number
  nom: string
  slug: string
  description_courte: string
  description_longue: string
  icone: string
  couleur: string
  packs: Pack[]
}

export interface FAQ {
  id: number
  question: string
  reponse: string
  service: string
  ordre: number
}
