import type { Prisma } from "@prisma/client";

import { requireParent } from "@/lib/auth";
import { db } from "@/lib/db";

const paymentSelect = {
  id: true,
  parentId: true,
  studentId: true,
  enrollmentId: true,
  amount: true,
  currency: true,
  status: true,
  paymentMethod: true,
  reference: true,
  proofUrl: true,
  adminNote: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
  student: {
    select: {
      id: true,
      fullName: true
    }
  },
  enrollment: {
    select: {
      id: true,
      status: true,
      student: {
        select: {
          id: true,
          fullName: true
        }
      },
      tutoringPlan: {
        select: {
          id: true,
          name: true,
          slug: true,
          monthlyPrice: true,
          currency: true,
          sessionsPerWeek: true,
          bestFor: true
        }
      }
    }
  }
} satisfies Prisma.PaymentSelect;

export async function getCurrentParentPayments() {
  const user = await requireParent();

  return db.payment.findMany({
    where: {
      parent: {
        userId: user.id
      }
    },
    select: paymentSelect,
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getPaymentForCurrentParent(paymentId: string) {
  const user = await requireParent();

  return db.payment.findFirst({
    where: {
      id: paymentId,
      parent: {
        userId: user.id
      }
    },
    select: paymentSelect
  });
}
