const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  pending:    { label: 'En attente',  bg: 'bg-jaune/10', text: 'text-jaune-dark' },
  confirmed:  { label: 'Confirmée',  bg: 'bg-blue-50',  text: 'text-blue-600' },
  processing: { label: 'En cours',   bg: 'bg-primary/10', text: 'text-primary' },
  completed:  { label: 'Livrée',     bg: 'bg-vert/10',  text: 'text-vert' },
  cancelled:  { label: 'Annulée',    bg: 'bg-rouge/10', text: 'text-rouge' },
}

export default function StatusBadge({ statut }: { statut: string }) {
  const s = STATUS_MAP[statut] || STATUS_MAP.pending
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}
