import { CVCheckerFlow } from '@/components/cv-checker/CVCheckerFlow';

export const metadata = {
  title: "CV Checker IA - Testez votre CV gratuitement | CVPro225",
  description: "Uploadez votre CV, obtenez un score précis et des recommandations en 30 secondes. Outil gratuit alimenté par IA.",
};

export default function CVCheckPage() {
  return (
    <div className="bg-background py-8 md:py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <CVCheckerFlow />
      </div>
    </div>
  );
}
