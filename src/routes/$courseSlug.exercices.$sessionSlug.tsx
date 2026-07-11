import { Suspense } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { findCourse, findTpSessionBySlug } from "@/data/course";
import { getTpComponent } from "@/tp/registry";
import { SiteHeader } from "@/components/course/SiteHeader";
import { CourseProvider } from "@/components/course/CourseContext";

export const Route = createFileRoute("/$courseSlug/exercices/$sessionSlug")({
  loader: ({ params }) => {
    const course = findCourse(params.courseSlug);
    if (!course) throw notFound();
    const session = findTpSessionBySlug(course.id, params.sessionSlug);
    if (!session) throw notFound();
    if (!getTpComponent(course.id, session.number)) throw notFound();
    return { courseId: course.id, sessionNumber: session.number };
  },
  head: ({ params }) => {
    const course = findCourse(params.courseSlug);
    const session = course ? findTpSessionBySlug(course.id, params.sessionSlug) : undefined;
    return {
      meta: [
        {
          title:
            course && session
              ? `TP ${session.number} · ${session.title} — ${course.shortTitle}`
              : "Exercices",
        },
      ],
    };
  },
  component: TpPage,
});

function LoadingTp() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container flex flex-col items-center gap-3 py-24 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium">Chargement de la séance…</p>
      </div>
    </div>
  );
}

function TpPage() {
  const { courseId, sessionNumber } = Route.useLoaderData();
  const Content = getTpComponent(courseId, sessionNumber)!;
  return (
    <CourseProvider courseId={courseId}>
      <Suspense fallback={<LoadingTp />}>
        <Content />
      </Suspense>
    </CourseProvider>
  );
}
