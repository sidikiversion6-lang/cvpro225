const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'

export default function PaymentModalities() {
  return (
    <section>
      <h3 className="mb-6 text-center font-heading text-2xl font-bold text-dark">
        💳 Modalités de paiement
      </h3>

      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-semibold text-dark">Paiement en ligne sécurisé</h4>
          <ul className="space-y-2 text-text-gray">
            <li className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">📱</span>
              <span><strong>Orange Money</strong> et <strong>MTN MoMo</strong></span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">💳</span>
              <span><strong>Carte bancaire</strong> (Visa, Mastercard)</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🔒</span>
              <span>Via <strong>PayDunya</strong>, plateforme de paiement agréée</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-dark">Conditions</h4>
          <ul className="space-y-3 text-text-gray">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 text-green-600">✓</span>
              <span>Paiement à la commande, au prix affiché</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 text-green-600">✓</span>
              <span>Reçu envoyé par email dès la confirmation du paiement</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 text-green-600">✓</span>
              <span>Garantie satisfait ou refait</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-text-gray">
          Une question ?{' '}
          <a
            href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`}
            className="font-medium text-primary hover:underline"
          >
            Contactez-nous sur WhatsApp →
          </a>
        </p>
      </div>
    </section>
  )
}
