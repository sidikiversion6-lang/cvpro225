import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage, { Champ } from '@/components/legal/LegalPage'
import { LEGAL, WHATSAPP_CONTACT } from '@/lib/legal'
import { CV_RETENTION_JOURS } from '@/lib/cv-purge'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Quelles données CVPro225 collecte, pourquoi, où elles sont hébergées, combien de temps elles sont conservées et comment exercer vos droits.',
  alternates: { canonical: '/confidentialite' },
}

export default function ConfidentialitePage() {
  const wa = WHATSAPP_CONTACT.replace(/[^0-9]/g, '')
  return (
    <LegalPage title="Politique de confidentialité" subtitle="Ce que nous faisons de vos données, et comment garder la main dessus.">
      <div>
        <h2>1. Responsable du traitement</h2>
        <p>
          <Champ value={LEGAL.raisonSociale} />, RCCM <Champ value={LEGAL.rccm} />, siège : <Champ value={LEGAL.siege} />.
          Contact : <Champ value={LEGAL.emailLegal} /> ou WhatsApp {WHATSAPP_CONTACT}.
        </p>
      </div>

      <div>
        <h2>2. Données collectées</h2>
        <p><strong>Lors d&apos;une commande :</strong></p>
        <ul>
          <li>nom complet et numéro WhatsApp ;</li>
          <li>adresse email, <strong>facultative</strong> ;</li>
          <li>votre CV si vous en fournissez un (PDF ou DOCX), ou les informations que vous nous transmettez sur WhatsApp pour le rédiger ;</li>
          <li>l&apos;offre choisie, le montant et le statut du paiement (aucune donnée bancaire : le paiement est traité par PayDunya).</li>
        </ul>
        <p><strong>Lors de l&apos;utilisation du CV Checker (analyse gratuite) :</strong> email, prénom, numéro WhatsApp, secteur visé, nom du fichier, résultat de l&apos;analyse et adresse IP (utilisée pour limiter le nombre d&apos;analyses gratuites).</p>
        <p><strong>Si vous créez un compte :</strong> nom, prénom, email, téléphone et ville éventuels, et votre mot de passe sous forme chiffrée (jamais en clair).</p>
        <p>Le site n&apos;utilise aucun traceur publicitaire ni outil de mesure d&apos;audience. Seuls des cookies techniques servent à maintenir votre connexion à votre compte.</p>
      </div>

      <div>
        <h2>3. Finalités</h2>
        <ul>
          <li>traiter votre commande : rédaction, échanges avec vous sur WhatsApp, livraison, retouches ;</li>
          <li>vous envoyer la confirmation de commande, le reçu de paiement et les livrables (par email si vous l&apos;avez fourni) ;</li>
          <li>réaliser l&apos;analyse du CV Checker et vous envoyer votre rapport ;</li>
          <li>respecter nos obligations comptables et prévenir les abus (limite d&apos;analyses gratuites).</li>
        </ul>
        <p>Vos données ne sont ni vendues, ni louées, ni utilisées à des fins publicitaires.</p>
      </div>

      <div>
        <h2>4. Hébergement et prestataires</h2>
        <ul>
          <li><strong>Supabase</strong> : base de données et stockage des CV, dans un espace privé accessible uniquement par nos serveurs (hébergement dans l&apos;Union européenne, région de Francfort).</li>
          <li><strong>PayDunya</strong> : traitement des paiements (Orange Money, MTN MoMo, carte bancaire).</li>
          <li><strong>Resend</strong> : envoi des emails (confirmation, reçu, rapport du CV Checker).</li>
          <li><strong>Anthropic (Claude)</strong> : analyse automatique du texte du CV pour le CV Checker ; le fichier n&apos;est pas conservé par CVPro225 dans ce cadre.</li>
          <li>Serveur du site : <Champ value="[À COMPLÉTER]" /> (hébergeur et pays).</li>
        </ul>
        <p>Certains de ces prestataires sont situés hors de Côte d&apos;Ivoire ; nous ne leur transmettons que les données nécessaires à leur service.</p>
      </div>

      <div>
        <h2>5. Durée de conservation</h2>
        <ul>
          <li><strong>CV fourni à la commande : supprimé automatiquement {CV_RETENTION_JOURS} jours après la livraison</strong> (ou {CV_RETENTION_JOURS} jours après la commande si elle n&apos;a jamais été payée ou a été annulée).</li>
          <li>Informations de commande (nom, contact, offre, montant, paiement) : <Champ value="[À COMPLÉTER]" /> (durée liée aux obligations comptables).</li>
          <li>Données du CV Checker : <Champ value="[À COMPLÉTER]" />.</li>
          <li>Compte client : jusqu&apos;à sa suppression à votre demande.</li>
        </ul>
      </div>

      <div>
        <h2>6. Vos droits</h2>
        <p>
          Vous pouvez à tout moment demander l&apos;<strong>accès</strong> à vos données, leur <strong>rectification</strong> ou leur
          <strong> suppression</strong>, et vous opposer à leur utilisation, conformément à la réglementation ivoirienne sur la protection
          des données personnelles.
        </p>
        <p><strong>Pour exercer vos droits :</strong></p>
        <ul>
          <li>sur WhatsApp : <a href={`https://wa.me/${wa}`} className="font-medium text-primary hover:underline">{WHATSAPP_CONTACT}</a> ;</li>
          <li>par email : <Champ value={LEGAL.emailLegal} />.</li>
        </ul>
        <p>
          Indiquez votre nom et la référence de votre commande (ou le numéro WhatsApp / l&apos;email utilisé). Nous vous répondons dans un
          délai de <Champ value="[À COMPLÉTER]" />. Vous pouvez également saisir l&apos;autorité ivoirienne de protection des données
          (ARTCI).
        </p>
      </div>

      <div>
        <h2>7. Sécurité</h2>
        <p>
          Les CV sont stockés dans un espace privé, sans accès public ; seul notre back-office y accède, par des liens temporaires.
          Les échanges avec le site sont chiffrés (HTTPS).
        </p>
        <p>
          Voir aussi nos <Link href="/cgv" className="font-medium text-primary hover:underline">conditions générales de vente</Link>.
        </p>
      </div>
    </LegalPage>
  )
}
