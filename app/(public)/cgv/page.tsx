import type { Metadata } from 'next'
import Link from 'next/link'
import LegalPage, { Champ } from '@/components/legal/LegalPage'
import { LEGAL, WHATSAPP_CONTACT } from '@/lib/legal'
import { EXPRESS, OFFRES, formatFcfa, isLaunchActive, launchEndLabel } from '@/lib/offres'

// Prix et offre de lancement lus à chaque requête (lib/offres.ts).
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
  description: 'Conditions générales de vente de CVPro225 : offres, prix, paiement en ligne, délais, option Express et garantie « Satisfait ou refait ».',
  alternates: { canonical: '/cgv' },
}

export default function CgvPage() {
  const launch = isLaunchActive()
  const fin = launchEndLabel()
  const wa = WHATSAPP_CONTACT.replace(/[^0-9]/g, '')

  return (
    <LegalPage title="Conditions générales de vente" subtitle="Les règles qui s'appliquent à toute commande passée sur cvpro225.com.">
      <div>
        <h2>1. Éditeur et objet</h2>
        <p>
          Le site cvpro225.com est édité par <Champ value={LEGAL.raisonSociale} /> (<Champ value={LEGAL.formeJuridique} />),
          immatriculée au RCCM sous le numéro <Champ value={LEGAL.rccm} />, dont le siège est situé <Champ value={LEGAL.siege} />.
          Email : <Champ value={LEGAL.emailLegal} /> — WhatsApp : {WHATSAPP_CONTACT}.
        </p>
        <p>
          Les présentes conditions générales de vente (CGV) régissent la vente des services de rédaction proposés sur le site
          (CV, lettre de motivation, optimisation de profil LinkedIn, coaching entretien). Passer commande implique leur acceptation.
        </p>
      </div>

      <div>
        <h2>2. Offres et prix</h2>
        <p>Les prix sont indiqués en francs CFA (FCFA), toutes taxes comprises. Le prix applicable est celui affiché au moment de la commande.</p>
        <table className="mt-4">
          <thead>
            <tr><th>Offre</th><th>Contenu</th><th>Délai</th><th>Prix</th></tr>
          </thead>
          <tbody>
            {OFFRES.map((o) => (
              <tr key={o.id}>
                <td className="font-semibold text-dark">{o.nom}</td>
                <td>{o.features.join(', ')}</td>
                <td>{o.delai}</td>
                <td className="whitespace-nowrap">
                  {formatFcfa(o.prixNormal)}
                  {launch && <><br /><span className="text-primary">{formatFcfa(o.prixLancement)} en offre de lancement</span></>}
                </td>
              </tr>
            ))}
            <tr>
              <td className="font-semibold text-dark">{EXPRESS.nom}</td>
              <td>{EXPRESS.description}, ajoutable à toute offre</td>
              <td>{EXPRESS.delai}</td>
              <td className="whitespace-nowrap">+ {formatFcfa(EXPRESS.prix)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h2>3. Offre de lancement</h2>
        {launch ? (
          <p>
            Une offre de lancement s&apos;applique jusqu&apos;au <strong>{fin}</strong> inclus (heure d&apos;Abidjan) : les prix de lancement
            indiqués ci-dessus remplacent alors les prix normaux. À partir du lendemain, les prix normaux s&apos;appliquent automatiquement.
            Le prix d&apos;une commande est celui affiché au moment où elle est passée : il ne change pas ensuite.
          </p>
        ) : (
          <p>{fin ? `L'offre de lancement s'est terminée le ${fin}. ` : ''}Les prix normaux indiqués ci-dessus s&apos;appliquent.</p>
        )}
      </div>

      <div>
        <h2>4. Commande</h2>
        <ul>
          <li>Vous choisissez une offre et, si vous le souhaitez, l&apos;{EXPRESS.nom}.</li>
          <li>Vous indiquez si vous avez déjà un CV : si oui, vous le joignez (PDF ou DOCX, 5 Mo maximum) ; sinon, un conseiller vous contacte sur WhatsApp après le paiement pour recueillir vos informations.</li>
          <li>Vous renseignez votre nom complet et votre numéro WhatsApp ; l&apos;email est facultatif (il sert à recevoir la confirmation et le reçu).</li>
          <li>Vous réglez la commande en ligne. La commande est confirmée dès la confirmation du paiement par PayDunya.</li>
        </ul>
      </div>

      <div>
        <h2>5. Paiement</h2>
        <p>
          Le paiement s&apos;effectue <strong>en totalité (100 %) à la commande, en ligne</strong>, via la plateforme de paiement PayDunya :
          Orange Money, MTN MoMo ou carte bancaire. CVPro225 ne reçoit ni ne conserve vos coordonnées bancaires ou vos codes de paiement.
          Si un email a été fourni, un reçu est envoyé dès la confirmation du paiement.
        </p>
      </div>

      <div>
        <h2>6. Délais de livraison</h2>
        <p>
          Les délais indiqués (48h ou 72h selon l&apos;offre, {EXPRESS.delai} avec l&apos;{EXPRESS.nom}) courent à compter de la confirmation
          du paiement et de la réception des informations nécessaires (votre CV, ou les informations recueillies sur WhatsApp si vous
          n&apos;avez pas de CV). Les documents sont livrés par email et/ou WhatsApp.
        </p>
      </div>

      <div>
        <h2>7. Satisfait ou refait</h2>
        <p>
          <strong>Satisfait ou refait : nous retravaillons votre CV gratuitement jusqu&apos;à votre satisfaction.</strong> Il suffit de nous
          indiquer sur WhatsApp ce qui ne vous convient pas ; les retouches sont gratuites. Cette garantie porte sur les documents livrés :
          elle ne donne pas lieu à un remboursement.
        </p>
        <p>
          CVPro225 s&apos;engage sur la qualité des documents rédigés, mais ne peut garantir l&apos;obtention d&apos;un entretien ou d&apos;un emploi,
          qui dépend de chaque recruteur.
        </p>
      </div>

      <div>
        <h2>8. Vos engagements</h2>
        <p>
          Vous vous engagez à fournir des informations exactes (parcours, diplômes, expériences). CVPro225 met en forme et valorise ces
          informations, sans jamais inventer de diplôme ou d&apos;expérience. Les documents livrés sont destinés à votre usage personnel.
        </p>
      </div>

      <div>
        <h2>9. Données personnelles</h2>
        <p>
          Le traitement de vos données est décrit dans notre <Link href="/confidentialite" className="font-medium text-primary hover:underline">politique de confidentialité</Link>.
        </p>
      </div>

      <div>
        <h2>10. Contact et réclamations</h2>
        <p>
          Pour toute question ou réclamation : WhatsApp{' '}
          <a href={`https://wa.me/${wa}`} className="font-medium text-primary hover:underline">{WHATSAPP_CONTACT}</a>{' '}
          ou email <Champ value={LEGAL.emailLegal} />.
        </p>
        <p>
          Droit applicable et juridiction compétente : <Champ value="[À COMPLÉTER]" />.
        </p>
      </div>
    </LegalPage>
  )
}
