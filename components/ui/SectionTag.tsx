interface Props {
  text: string
  color?: string
}

export default function SectionTag({ text, color = '#0F7B5A' }: Props) {
  return (
    <span
      className="mb-4 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold"
      style={{ backgroundColor: `${color}12`, color }}
    >
      {text}
    </span>
  )
}
