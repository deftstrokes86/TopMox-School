import { requireAdmin, requireTutor } from "@/lib/auth";
import { db } from "@/lib/db";

const tutorSelect = {
  id: true,
  userId: true,
  phone: true,
  bio: true,
  availabilityNotes: true,
  status: true,
  subjects: {
    select: {
      id: true,
      name: true,
      slug: true
    },
    orderBy: {
      name: "asc" as const
    }
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  }
};

export async function getActiveTutors() {
  await requireAdmin();

  return db.tutorProfile.findMany({
    where: {
      status: "ACTIVE",
      user: {
        role: "TUTOR"
      }
    },
    select: tutorSelect,
    orderBy: {
      user: {
        name: "asc"
      }
    }
  });
}

export async function getAdminTutorById(tutorId: string) {
  await requireAdmin();

  return db.tutorProfile.findUnique({
    where: {
      id: tutorId
    },
    select: tutorSelect
  });
}

export async function getTutorAssignedStudents(tutorUserId: string) {
  const user = await requireTutor();

  if (user.id !== tutorUserId) {
    return [];
  }

  return db.studentProfile.findMany({
    where: {
      OR: [
        {
          lessons: {
            some: {
              tutor: {
                userId: tutorUserId
              }
            }
          }
        },
        {
          enrollments: {
            some: {
              assignedTutor: {
                userId: tutorUserId
              },
              status: "ACTIVE"
            }
          }
        }
      ]
    },
    select: {
      id: true,
      fullName: true,
      age: true,
      classYearGroup: true,
      countryOfStudy: true,
      curriculum: true,
      parent: {
        select: {
          country: true,
          timezone: true
        }
      },
      subjects: {
        select: {
          id: true,
          name: true
        },
        orderBy: {
          name: "asc"
        }
      }
    },
    orderBy: {
      fullName: "asc"
    }
  });
}
