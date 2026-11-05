'use client'

import { useState, useEffect, useRef } from 'react'

interface Conversation { commandeId: string; ref: string; service: string; clientNom: string; clientEmail: string; lastMessage: string; unread: number }
interface Msg { id: string; auteur: string; contenu: string; created_at: string }

const TEMPLATES = [
  'Commande reçue ✓ Nous traitons votre demande.',
  'Votre commande est en cours de traitement ⚙️',
  'Votre document est prêt 🎉 Vous pouvez le télécharger depuis votre espace client.',
  'Besoin d\'informations supplémentaires pour avancer. Merci de nous préciser votre situation.',
]

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/admin/messages?type=conversations')
      .then((r) => r.json())
      .then((d) => setConversations(d.data || []))
  }, [])

  useEffect(() => {
    if (!activeId) return
    fetch(`/api/admin/messages?commandeId=${activeId}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.data || []))
    fetch(`/api/admin/messages?commandeId=${activeId}&markRead=true`, { method: 'PATCH' })
  }, [activeId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(text?: string) {
    const contenu = text || input.trim()
    if (!contenu || !activeId) return
    const res = await fetch('/api/admin/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commandeId: activeId, contenu }),
    })
    const json = await res.json()
    if (json.success) { setMessages((p) => [...p, json.data]); setInput('') }
  }

  const active = conversations.find((c) => c.commandeId === activeId)

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-black text-dark">Messages</h1>

      <div className="grid overflow-hidden rounded-xl bg-white shadow-sm lg:grid-cols-4" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Conversations */}
        <div className="border-r border-gray-100 overflow-y-auto lg:col-span-1">
          {conversations.map((c) => (
            <button key={c.commandeId} onClick={() => setActiveId(c.commandeId)}
              className={`flex w-full items-start gap-3 border-b border-gray-50 p-4 text-left ${activeId === c.commandeId ? 'bg-primary/5' : 'hover:bg-gray-50'}`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {c.clientNom.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-dark">{c.clientNom}</span>
                  {c.unread > 0 && <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rouge text-[0.6rem] font-bold text-white">{c.unread}</span>}
                </div>
                <p className="text-xs text-gray-400">{c.ref}</p>
                <p className="mt-0.5 truncate text-xs text-gray-500">{c.lastMessage}</p>
              </div>
            </button>
          ))}
          {conversations.length === 0 && <div className="p-8 text-center text-sm text-gray-400">Aucune conversation</div>}
        </div>

        {/* Messages */}
        <div className="flex flex-col lg:col-span-2">
          {!activeId ? (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Sélectionnez une conversation</div>
          ) : (
            <>
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-dark">{active?.clientNom}</p>
                <p className="text-xs text-gray-400">{active?.ref}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.auteur === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.auteur === 'admin' ? 'bg-primary text-white rounded-br-md' : 'bg-gray-100 text-dark rounded-bl-md'}`}>
                      <p>{m.contenu}</p>
                      <p className={`mt-1 text-[0.6rem] ${m.auteur === 'admin' ? 'text-white/60' : 'text-gray-400'}`}>
                        {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="border-t border-gray-100 p-3">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {TEMPLATES.map((t) => (
                    <button key={t} onClick={() => send(t)} className="rounded-full bg-gray-100 px-3 py-1 text-[0.65rem] text-gray-600 hover:bg-gray-200">
                      {t.slice(0, 30)}...
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Répondre..." className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary" />
                  <button onClick={() => send()} className="gp-btn gp-btn-primary rounded-xl px-5 text-sm">Envoyer</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Infos client */}
        <div className="hidden border-l border-gray-100 p-4 lg:block">
          {active ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {active.clientNom.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <p className="mt-2 font-heading text-sm font-bold text-dark">{active.clientNom}</p>
                <p className="text-xs text-gray-400">{active.clientEmail}</p>
              </div>
              <a href={`https://wa.me/${active.clientEmail}`} target="_blank" rel="noopener noreferrer" className="gp-btn gp-btn-whatsapp w-full rounded-lg text-xs">WhatsApp</a>
              <a href={`mailto:${active.clientEmail}`} className="gp-btn gp-btn-outline w-full rounded-lg text-xs">Email</a>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">Sélectionnez un client</div>
          )}
        </div>
      </div>
    </div>
  )
}
