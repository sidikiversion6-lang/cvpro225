'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  nom: z.string().min(2, 'Nom requis (2 caractères min.)'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  service: z.string().min(1, 'Choisissez un service'),
  message: z.string().min(20, 'Message trop court (20 caractères min.)'),
})

type FormData = z.infer<typeof schema>

const SERVICES_OPTIONS = [
  { value: '', label: 'Choisir un service...' },
  { value: 'cv', label: '📄 CV Pro ATS' },
  { value: 'job', label: '💼 JobAssist' },
  { value: 'autre', label: 'Autre / Renseignement général' },
]

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-vert/20 bg-vert/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-vert/10 text-3xl">
          ✓
        </div>
        <h3 className="font-heading text-xl font-bold text-dark">Message envoyé !</h3>
        <p className="mt-2 text-sm text-gray-600">
          Nous vous répondons sous 2 heures sur WhatsApp ou par email.
        </p>
        <a
          href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="gp-btn gp-btn-whatsapp mt-6"
        >
          Ou contactez-nous directement →
        </a>
      </div>
    )
  }

  const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-dark outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20'
  const errorClass = 'mt-1 text-xs text-rouge'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark">Nom complet *</label>
        <input {...register('nom')} placeholder="Votre nom et prénom" className={inputClass} />
        {errors.nom && <p className={errorClass}>{errors.nom.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark">Email *</label>
        <input {...register('email')} type="email" placeholder="votre@email.com" className={inputClass} />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark">Téléphone (WhatsApp de préférence)</label>
        <input {...register('telephone')} type="tel" placeholder="+225 07 99 07 62 41" className={inputClass} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark">Service concerné *</label>
        <select {...register('service')} className={inputClass}>
          {SERVICES_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {errors.service && <p className={errorClass}>{errors.service.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark">Message *</label>
        <textarea
          {...register('message')}
          rows={5}
          placeholder="Décrivez votre situation et ce que vous recherchez..."
          className={inputClass}
        />
        {errors.message && <p className={errorClass}>{errors.message.message}</p>}
      </div>

      {status === 'error' && (
        <div className="rounded-xl border border-rouge/20 bg-rouge/5 px-4 py-3 text-sm text-rouge">
          Une erreur est survenue. Veuillez réessayer ou nous contacter directement sur WhatsApp.
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="gp-btn gp-btn-primary w-full rounded-full py-4 font-bold"
      >
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" className="opacity-75" />
            </svg>
            Envoi en cours...
          </span>
        ) : (
          'Envoyer le message →'
        )}
      </button>
    </form>
  )
}
