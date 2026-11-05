'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

interface Conversation {
  commandeId: string
  ref: string
  service: string
  lastMessage: string
  lastDate: string
  unread: number
}

interface Msg {
  id: string
  auteur: string
  contenu: string
  created_at: string
}

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+225 07 99 07 62 41'
const EMOJIS: Record<string, string> = { cv: '📄', visa: '🛂', job: '💼', tender: '📋' }

export default function MessagesPage() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/messages?type=conversations')
      .then((r) => r.json())
      .then((d) => { setConversations(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!activeId) return
    fetch(`/api/messages?commandeId=${activeId}`)
      .then((r) => r.json())
      .then((d) => { setMessages(d.data || []) })
    fetch(`/api/messages?commandeId=${activeId}&markRead=true`, { method: 'PATCH' })
  }, [activeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || !activeId) return
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commandeId: activeId, contenu: input }),
    })
    const json = await res.json()
    if (json.success) {
      setMessages((p) => [...p, json.data])
      setInput('')
    }
  }

  const activeConv = conversations.find((c) => c.commandeId === activeId)

  if (loading) return <div className="py-20 text-center text-gray-400">Chargement...</div>

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-black text-dark">Messages</h1>

      {conversations.length === 0 ? (
        <div className="rounded-xl bg-white py-16 text-center shadow-sm">
          <span className="text-4xl text-gray-300">💬</span>
          <p className="mt-4 text-sm text-gray-400">Aucun message pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-4 overflow-hidden rounded-xl bg-white shadow-sm lg:grid-cols-3" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Liste conversations */}
          <div className="border-r border-gray-100 overflow-y-auto lg:col-span-1">
            {conversations.map((c) => (
              <button
                key={c.commandeId}
                onClick={() => setActiveId(c.commandeId)}
                className={`flex w-full items-start gap-3 border-b border-gray-50 p-4 text-left transition-colors ${
                  activeId === c.commandeId ? 'bg-primary/5 border-l-[3px] border-l-primary' : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{EMOJIS[c.service] || '📄'}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-dark">{c.ref}</span>
                    {c.unread > 0 && <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rouge text-[0.625rem] font-bold text-white">{c.unread}</span>}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-500">{c.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Zone messages */}
          <div className="flex flex-col lg:col-span-2">
            {!activeId ? (
              <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
                Sélectionnez une conversation
              </div>
            ) : (
              <>
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-semibold text-dark">Commande {activeConv?.ref}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.auteur === 'client' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.auteur === 'client' ? 'bg-primary text-white rounded-br-md' : 'bg-gray-100 text-dark rounded-bl-md'
                      }`}>
                        <p>{m.contenu}</p>
                        <p className={`mt-1 text-[0.625rem] ${m.auteur === 'client' ? 'text-white/60' : 'text-gray-400'}`}>
                          {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                <div className="border-t border-gray-100 p-3 flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Votre message..."
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                  <button onClick={sendMessage} className="gp-btn gp-btn-primary rounded-xl px-4 text-sm">Envoyer</button>
                  <a
                    href={`https://wa.me/${WHATSAPP.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Commande ${activeConv?.ref}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="gp-btn gp-btn-whatsapp rounded-xl px-3 text-sm"
                    title="WhatsApp"
                  >
                    WA
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
