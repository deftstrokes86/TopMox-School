import { requireTutor } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getCurrentTutorHomework() {
  const user = await requireTutor();

  return db.homework.findMany({
    where: {
      tutor: {
        userId: user.id
      }
    },
    select: {
      id: true,
      title: true,
      description: true,
      dueDate: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      student: {
        select: {
          id: true,
          fullName: true,
          classYearGroup: true
        }
      },
      lesson: {
        select: {
          id: true,
          title: true,
          startTime: true,
          subject: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: [
      {
        dueDate: "asc"
      },
      {
        createdAt: "desc"
      }
    ]
  });
}
