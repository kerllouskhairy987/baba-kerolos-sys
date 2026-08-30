import 'dotenv/config';
import argon2 from 'argon2';
import { db } from './db';

const SINGLE_ALLOWED_EMAIL = 'montasergohar@gmail.com';

async function seedSingleUser() {
  const initialPassword = process.env['INITIAL_USER_PASSWORD'];

  if (!initialPassword || initialPassword.trim() === '') {
    throw new Error(
      'INITIAL_USER_PASSWORD environment variable is missing or empty. Please configure it in .env before running the seed script.'
    );
  }

  // 1. Safety Check: Query all existing users in the database
  const existingUsers = await db.orm.public.User.all();

  // If there are other users besides the single allowed email, report them for user review
  const unexpectedUsers = existingUsers.filter(
    (u) => u.email.toLowerCase() !== SINGLE_ALLOWED_EMAIL.toLowerCase()
  );

  if (unexpectedUsers.length > 0) {
    console.warn(
      `[SECURITY WARNING] Found ${unexpectedUsers.length} unexpected user(s) in the database!`
    );
    for (const u of unexpectedUsers) {
      console.warn(`  - Existing user ID: ${u.id}, Email: ${u.email}`);
    }
    console.warn(
      '[SAFETY ACTION] Preserving existing unexpected users per safety rules. Review needed.'
    );
  }

  // 2. Securely hash the initial password with Argon2
  const passwordHash = await argon2.hash(initialPassword);

  // 3. Find target user
  const targetUser = existingUsers.find(
    (u) => u.email.toLowerCase() === SINGLE_ALLOWED_EMAIL.toLowerCase()
  );

  if (targetUser) {
    // Update existing single user password hash
    await db.orm.public.User.where({ id: targetUser.id }).update({
      passwordHash,
      passwordChangedAt: new Date().toISOString(),
    });
    console.log(`[SEED SUCCESS] Single user "${SINGLE_ALLOWED_EMAIL}" password hash updated.`);
  } else {
    // Create single user
    const newUser = await db.orm.public.User.create({
      email: SINGLE_ALLOWED_EMAIL,
      username: 'montasergohar',
      name: 'Montaser Gohar',
      passwordHash,
    });
    console.log(
      `[SEED SUCCESS] Single user "${SINGLE_ALLOWED_EMAIL}" created successfully with ID: ${newUser.id}`
    );
  }
}

seedSingleUser()
  .catch((err) => {
    console.error('[SEED ERROR] Failed to seed single user:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
