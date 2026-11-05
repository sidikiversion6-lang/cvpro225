import SectionTag from './SectionTag'

interface Props {
  tag?: string
  tagColor?: string
  title: string
  subtitle?: string
  highlight?: string
  center?: boolean
}

export default function SectionHeader({ tag, tagColor, title, subtitle, highlight, center = true }: Props) {
  let titleNode: React.ReactNode = title

  if (highlight && title.includes(highlight)) {
    const parts = title.split(highlight)
    titleNode = (
      <>
        {parts[0]}
        <span style={{ color: tagColor || '#0F7B5A' }}>{highlight}</span>
        {parts[1]}
      </>
    )
  }

  return (
    <div className={`mb-10 ${center ? 'mx-auto max-w-2xl text-center' : ''}`}>
      {tag && <SectionTag text={tag} color={tagColor} />}
      <h2 className="font-heading text-2xl font-extrabold text-dark sm:text-3xl">
        {titleNode}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm text-gray-500 sm:text-base">{subtitle}</p>
      )}
    </div>
  )
}
