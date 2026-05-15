import type { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";

import { requireAdmin, requireParent } from "@/lib/auth";
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
  provider: true,
  reference: true,
  providerReference: true,
  providerTransactionId: true,
  checkoutUrl: true,
  callbackUrl: true,
  proofUrl: true,
  adminNote: true,
  failureReason: true,
  verifiedAt: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
  parent: {
    select: {
      id: true,
      whatsappNumber: true,
      country: true,
      timezone: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  },
  student: {
    select: {
      id: true,
      fullName: true,
      age: true,
      classYearGroup: true,
      countryOfStudy: true,
      curriculum: true
    }
  },
  enrollment: {
    select: {
      id: true,
      status: true,
      student: {
        select: {
          id: true,
          fullName: true,
          age: true,
          classYearGroup: true,
          countryOfStudy: true,
          curriculum: true
        }
      },
      tutoringPlan: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          monthlyPrice: true,
          currency: true,
          sessionsPerWeek: true,
          bestFor: true,
          features: true
        }
      }
    }
  }
} satisfies Prisma.PaymentSelect;

export type AdminPaymentFilters = {
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  search?: string;
  take?: number;
};

export function buildAdminPaymentWhereInput(
  filters: AdminPaymentFilters = {}
): Prisma.PaymentWhereInput {
  const where: Prisma.PaymentWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.paymentMethod) {
    where.paymentMethod = filters.paymentMethod;
  }

  if (filters.search?.trim()) {
    const query = filters.search.trim();
    where.OR = [
      {
        parent: {
          user: {
            name: {
              contains: query,
              mode: "insensitive"
            }
          }
        }
      },
      {
        parent: {
          user: {
            email: {
              contains: query,
              mode: "insensitive"
            }
          }
        }
      },
      {
        student: {
          fullName: {
            contains: query,
            mode: "insensitive"
          }
        }
      },
      {
        enrollment: {
          student: {
            fullName: {
              contains: query,
              mode: "insensitive"
            }
          }
        }
      }
    ];
  }

  return where;
}

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

export async function getAdminPayments(filters: AdminPaymentFilters = {}) {
  await requireAdmin();

  return db.payment.findMany({
    where: buildAdminPaymentWhereInput(filters),
    select: paymentSelect,
    orderBy: {
      createdAt: "desc"
    },
    take: filters.take
  });
}

export async function getAdminPaymentById(paymentId: string) {
  await requireAdmin();

  return db.payment.findUnique({
    where: {
      id: paymentId
    },
    select: paymentSelect
  });
}

export async function getAdminPaymentSummary() {
  await requireAdmin();

  const [awaitingVerification, paid, failed, activeEnrollments] =
    await Promise.all([
      db.payment.count({
        where: {
          status: "AWAITING_VERIFICATION"
        }
      }),
      db.payment.count({
        where: {
          status: "PAID"
        }
      }),
      db.payment.count({
        where: {
          status: "FAILED"
        }
      }),
      db.enrollment.count({
        where: {
          status: "ACTIVE"
        }
      })
    ]);

  return {
    awaitingVerification,
    paid,
    failed,
    activeEnrollments
  };
}
