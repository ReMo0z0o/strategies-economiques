import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { getChapter } from "@/data/course";

export default function Chapter() {
  const first = getChapter("industrielle", "ei4").sections[0];
  return (
    <ChapterShell chapterId="ei4">
      <Section id={first.id} title={first.title}>
        <p className="text-muted-foreground">Ce chapitre est en cours de rédaction. Reviens bientôt !</p>
      </Section>
    </ChapterShell>
  );
}
