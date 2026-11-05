export default function PaymentModalities() {
  return (
    <section>
      <h3 className="mb-6 text-center font-heading text-2xl font-bold text-dark">
        💳 Modalités de paiement
      </h3>

      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-semibold text-dark">Modes acceptés</h4>
          <ul className="space-y-2 text-text-gray">
            <li className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <span><strong>Orange Money</strong> — <span className="whitespace-nowrap">+225 07 99 07 62 41</span></span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <span><strong>MTN Mobile Money</strong> — <span className="whitespace-nowrap">+225 07 99 07 62 41</span></span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-2xl">💵</span>
              <span><strong>Cash</strong> — Paiement à Abidjan</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-dark">Conditions</h4>
          <ul className="space-y-3 text-text-gray">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 font-bold text-primary">50%</span>
              <span>à la commande pour démarrer le travail</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 font-bold text-primary">50%</span>
              <span>à la livraison du service finalisé</span>
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
            href="https://wa.me/2250799076241"
            className="font-medium text-primary hover:underline"
          >
            Contactez-nous sur WhatsApp →
          </a>
        </p>
      </div>
    </section>
  )
}
