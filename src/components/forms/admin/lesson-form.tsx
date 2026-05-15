"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  createLessonAction,
  type LessonActionResult
} from "@/server/actions/lesson.actions";

type EnrollmentOption = {
  id: string;
  assignedTutorId: string | null;
  parent: {
    timezone: string;
    user: {
      name: string;
    };
  };
  student: {
    id: string;
    fullName: string;
    classYearGroup: string;
  };
  tutoringPlan: {
    name: string;
  };
};

type TutorOption = {
  id: string;
  user: {
    name: string;
    email: string;
  };
};

type SubjectOption = {
  id: string;
  name: string;
};

type LessonFormProps = {
  enrollments: EnrollmentOption[];
  tutors: TutorOption[];
  subjects: SubjectOption[];
  defaultEnrollmentId?: string;
};

export function LessonForm({
  enrollments,
  tutors,
  subjects,
  defaultEnrollmentId
}: LessonFormProps) {
  const router = useRouter();
  const firstEnrollmentId = defaultEnrollmentId || enrollments[0]?.id || "";
  const [enrollmentId, setEnrollmentId] = useState(firstEnrollmentId);
  const selectedEnrollment = useMemo(
    () => enrollments.find((enrollment) => enrollment.id === enrollmentId),
    [enrollmentId, enrollments]
  );
  const [tutorId, setTutorId] = useState(
    selectedEnrollment?.assignedTutorId || tutors[0]?.id || ""
  );
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timezone, setTimezone] = useState(
    selectedEnrollment?.parent.timezone || "Africa/Lagos"
  );
  const [meetingLink, setMeetingLink] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<LessonActionResult | null>(null);

  const handleEnrollmentChange = (nextEnrollmentId: string) => {
    const nextEnrollment = enrollments.find(
      (enrollment) => enrollment.id === nextEnrollmentId
    );

    setEnrollmentId(nextEnrollmentId);
    setTimezone(nextEnrollment?.parent.timezone || "Africa/Lagos");
    setTutorId(nextEnrollment?.assignedTutorId || tutors[0]?.id || "");
  };

  const submitLesson = () => {
    setResult(null);

    if (!selectedEnrollment) {
      setResult({
        success: false,
        message: "Choose an active enrollment before scheduling a lesson."
      });
      return;
    }

    startTransition(async () => {
      const actionResult = await createLessonAction({
        enrollmentId,
        studentId: selectedEnrollment.student.id,
        tutorId,
        subjectId,
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        timezone,
        meetingLink
      });

      setResult(actionResult);

      if (actionResult.success) {
        router.push(`/admin/lessons/${actionResult.data?.lessonId}`);
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-deep-navy">
            Active enrollment
          </span>
          <select
            value={enrollmentId}
            onChange={(event) => handleEnrollmentChange(event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select active enrollment</option>
            {enrollments.map((enrollment) => (
              <option key={enrollment.id} value={enrollment.id}>
                {enrollment.student.fullName} - {enrollment.tutoringPlan.name} -{" "}
                {enrollment.parent.user.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-deep-navy">Tutor</span>
          <select
            value={tutorId}
            onChange={(event) => setTutorId(event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select tutor</option>
            {tutors.map((tutor) => (
              <option key={tutor.id} value={tutor.id}>
                {tutor.user.name} - {tutor.user.email}
              </option>
            ))}
          </select>
          {result?.fieldErrors?.tutorId ? (
            <p className="text-xs text-danger">{result.fieldErrors.tutorId}</p>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-deep-navy">Subject</span>
          <select
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {result?.fieldErrors?.subjectId ? (
            <p className="text-xs text-danger">{result.fieldErrors.subjectId}</p>
          ) : null}
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-deep-navy">
            Lesson title
          </span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: Mathematics foundations lesson"
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          {result?.fieldErrors?.title ? (
            <p className="text-xs text-danger">{result.fieldErrors.title}</p>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-deep-navy">
            Start time
          </span>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          {result?.fieldErrors?.startTime ? (
            <p className="text-xs text-danger">{result.fieldErrors.startTime}</p>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-deep-navy">End time</span>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          {result?.fieldErrors?.endTime ? (
            <p className="text-xs text-danger">{result.fieldErrors.endTime}</p>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-deep-navy">Timezone</span>
          <input
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          {result?.fieldErrors?.timezone ? (
            <p className="text-xs text-danger">{result.fieldErrors.timezone}</p>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-deep-navy">
            Meeting link
          </span>
          <input
            value={meetingLink}
            onChange={(event) => setMeetingLink(event.target.value)}
            placeholder="https://..."
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          {result?.fieldErrors?.meetingLink ? (
            <p className="text-xs text-danger">
              {result.fieldErrors.meetingLink}
            </p>
          ) : null}
        </label>
      </div>

      <Button
        type="button"
        onClick={submitLesson}
        disabled={isPending}
        className="w-full sm:w-auto"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CalendarPlus className="mr-2 h-4 w-4" />
        )}
        Schedule Lesson
      </Button>

      {result ? (
        <p
          className={
            result.success
              ? "rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success"
              : "rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger"
          }
        >
          {result.message}
        </p>
      ) : null}
    </div>
  );
}
