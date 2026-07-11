import { ChapterShell, Section } from "@/components/course/ChapterShell";
import { getChapter } from "@/data/course";

export default function Chapter() {
  const first = getChapter("industrielle", "ei1").sections[0];
  return (
    <ChapterShell chapterId="ei1">
      <Section id={first.id} title={first.title}>
        <p className="text-muted-foreground">Ce chapitre est en cours de rédaction. Reviens bientôt !</p>
      </Section>
    </ChapterShell>
  );
}
