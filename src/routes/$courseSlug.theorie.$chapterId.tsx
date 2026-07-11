import { Suspense } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { findChapterBySlug, findCourse } from "@/data/course";
import { getChapterComponent } from "@/chapters/registry";
import { SiteHeader } from "@/components/course/SiteHeader";
import { CourseProvider } from "@/components/course/CourseContext";

export const Route = createFileRoute("/$courseSlug/theorie/$chapterId")({
  loader: ({ params }) => {
    const course = findCourse(params.courseSlug);
    if (!course) throw notFound();
    const chapter = findChapterBySlug(course.id, params.chapterId);
    if (!chapter) throw notFound();
    if (!getChapterComponent(course.id, chapter.id)) throw notFound();
    return { courseId: course.id, chapterId: chapter.id };
  },
  head: ({ params }) => {
    const course = findCourse(params.courseSlug);
    const chapter = course ? findChapterBySlug(course.id, params.chapterId) : undefined;
    return {
      meta: [
        {
          title:
            course && chapter
              ? `${chapter.code} · ${chapter.title} — ${course.shortTitle}`
              : "Théorie",
        },
      ],
    };
  },
  component: ChapterPage,
});

function LoadingChapter() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container flex flex-col items-center gap-3 py-24 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium">Chargement du chapitre…</p>
      </div>
    </div>
  );
}

function ChapterPage() {
  const { courseId, chapterId } = Route.useLoaderData();
  const Content = getChapterComponent(courseId, chapterId)!;
  return (
    <CourseProvider courseId={courseId}>
      <Suspense fallback={<LoadingChapter />}>
        <Content />
      </Suspense>
    </CourseProvider>
  );
}
