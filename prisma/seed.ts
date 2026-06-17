/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Popula o banco com os dados iniciais (cursos, cupons, admin e config).
 * Idempotente: pode ser executado várias vezes (usa upsert).
 *
 * Reaproveita os dados de catálogo de `src/data.ts` para evitar duplicação.
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, Prisma, type CouponType } from '@prisma/client';
import {
  SEED_COURSES,
  SEED_COUPONS,
  INITIAL_LAYOUT_CONFIG,
  INITIAL_PAYMENT_CONFIG,
} from '../src/data';

const prisma = new PrismaClient();

// Conta administradora mestre (senha definível via ADMIN_PASSWORD no .env).
const ADMIN_EMAIL = 'adriano.ricardo01@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Anthony9936#';

async function main() {
  // 1) Administrador
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash, role: 'ADMIN', isActive: true },
    create: {
      id: 'usr-1',
      name: 'Adriano Ricardo',
      dob: '1985-04-15',
      cpf: '062.349.933-88',
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    },
  });

  // 2) Cursos (preservando os ids originais para casar com os cupons)
  for (const c of SEED_COURSES) {
    await prisma.course.upsert({
      where: { id: c.id },
      update: {
        code: c.code,
        name: c.name,
        description: c.description,
        duration: c.duration,
        price: c.price,
        coverImage: c.coverImage,
        isActive: c.isActive,
        isFeatured: c.isFeatured,
        modules: c.modules,
        manualActivities: c.manualActivities,
      },
      create: {
        id: c.id,
        code: c.code,
        name: c.name,
        description: c.description,
        duration: c.duration,
        price: c.price,
        coverImage: c.coverImage,
        isActive: c.isActive,
        isFeatured: c.isFeatured,
        modules: c.modules,
        manualActivities: c.manualActivities,
        instructors: {
          create: c.instructors.map((i) => ({ name: i.name, formation: i.formation })),
        },
      },
    });
  }

  // 3) Cupons
  for (const cp of SEED_COUPONS) {
    const type: CouponType = cp.type === 'fixed' ? 'FIXED' : 'PERCENTAGE';
    await prisma.coupon.upsert({
      where: { code: cp.code },
      update: {
        description: cp.description,
        value: cp.value,
        type,
        isActive: cp.isActive,
        associatedProducts: cp.associatedProducts,
      },
      create: {
        code: cp.code,
        description: cp.description,
        value: cp.value,
        type,
        isActive: cp.isActive,
        associatedProducts: cp.associatedProducts,
      },
    });
  }

  // 4) Configurações globais (layout + pagamento)
  const layout = INITIAL_LAYOUT_CONFIG as unknown as Prisma.InputJsonValue;
  const payment = INITIAL_PAYMENT_CONFIG as unknown as Prisma.InputJsonValue;
  await prisma.appConfig.upsert({
    where: { id: 'singleton' },
    update: { layout, payment },
    create: { id: 'singleton', layout, payment },
  });

  const counts = {
    usuarios: await prisma.user.count(),
    cursos: await prisma.course.count(),
    cupons: await prisma.coupon.count(),
  };
  console.log('Seed concluído:', counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
