import { Suspense } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { findCourse } from "@/data/course";
import { mockExams } from "@/data/exams";
import { getExamSolutionComponent } from "@/exam-solutions/registry";
import { SiteHeader } from "@/components/course/SiteHeader";
import { CourseProvider } from "@/components/course/CourseContext";

export const Route = createFileRoute("/$courseSlug/examens/$examId")({
  loader: ({ params }) => {
    const course = findCourse(params.courseSlug);
    if (!course) throw notFound();
    const exam = mockExams.find((e) => e.id === params.examId && e.course === course.id);
    if (!exam) throw notFound();
    if (!getExamSolutionComponent(exam.id)) throw notFound();
    return { courseId: course.id, examId: exam.id };
  },
  head: ({ params }) => {
    const course = findCourse(params.courseSlug);
    const exam = mockExams.find((e) => e.id === params.examId);
    return {
      meta: [
        {
          title:
            course && exam
              ? `${exam.title} · résolution guidée — ${course.shortTitle}`
              : "Résolution guidée",
        },
      ],
    };
  },
  component: ExamSolutionPage,
});

function LoadingSolution() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container flex flex-col items-center gap-3 py-24 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium">Chargement de la résolution…</p>
      </div>
    </div>
  );
}

function ExamSolutionPage() {
  const { courseId, examId } = Route.useLoaderData();
  const Content = getExamSolutionComponent(examId)!;
  return (
    <CourseProvider courseId={courseId}>
      <Suspense fallback={<LoadingSolution />}>
        <Content />
      </Suspense>
    </CourseProvider>
  );
}
