import 'server-only'
import { getSupabaseAdmin } from '@/lib/cv-checker/supabase-client'

/**
 * CV fournis à la commande : Supabase Storage, bucket PRIVÉ (aucun accès public,
 * uniquement la clé service_role côté serveur). Le back-office y accède par une
 * URL signée de courte durée (/api/admin/commandes/cv).
 */
export const CV_BUCKET = 'commandes-cv'
const SIGNED_URL_SECONDS = 15 * 60

let bucketChecked = false

async function ensureBucket() {
  if (bucketChecked) return
  const sb = getSupabaseAdmin()
  const { data } = await sb.storage.getBucket(CV_BUCKET)
  if (!data) {
    const { error } = await sb.storage.createBucket(CV_BUCKET, {
      public: false,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    })
    if (error && !/already exists/i.test(error.message)) throw error
  }
  bucketChecked = true
}

export function cvContentType(filename: string): string {
  return /\.docx$/i.test(filename)
    ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    : 'application/pdf'
}

/** Enregistre le CV et renvoie son chemin dans le bucket. */
export async function storeCv(ref: string, file: { filename: string; content: Buffer }): Promise<string> {
  await ensureBucket()
  const path = `${ref}/${file.filename}`
  const { error } = await getSupabaseAdmin()
    .storage.from(CV_BUCKET)
    .upload(path, file.content, { contentType: cvContentType(file.filename), upsert: false })
  if (error) throw error
  return path
}

export async function signedCvUrl(path: string): Promise<string> {
  const { data, error } = await getSupabaseAdmin()
    .storage.from(CV_BUCKET)
    .createSignedUrl(path, SIGNED_URL_SECONDS, { download: true })
  if (error || !data) throw error ?? new Error('URL signée indisponible')
  return data.signedUrl
}
