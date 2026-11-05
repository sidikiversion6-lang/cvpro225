import SectionTag from './SectionTag'

interface Props {
  tag: string
  title: string
  subtitle: string
  tagColor?: string
}

export default function PageHero({ tag, title, subtitle, tagColor = '#0F7B5A' }: Props) {
  return (
    <section className="bg-dark pt-40 pb-20">
      <div className="gp-container mx-auto max-w-[1200px] text-center">
        <SectionTag text={tag} color={tagColor} />
        <h1 className="font-heading text-4xl font-black text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-lg text-white/60">
          {subtitle}
        </p>
      </div>
    </section>
  )
}
