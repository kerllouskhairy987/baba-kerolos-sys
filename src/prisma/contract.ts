import { defineContract } from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract({}, ({ field, model, rel }) => {
  const User = model('User', {
    fields: {
      id: field.id.uuidv7String(),
      email: field.text().unique(),
      username: field.text().optional(),
      name: field.text().optional(),
      passwordHash: field.text(),
      passwordChangedAt: field.temporal.timestamptzString().optional(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  });

  const Session = model('Session', {
    fields: {
      id: field.id.uuidv7String(),
      tokenHash: field.text().unique(),
      userId: field.uuidString(),
      expiresAt: field.temporal.timestamptzString(),
      revokedAt: field.temporal.timestamptzString().optional(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  });

  const PasswordResetChallenge = model('PasswordResetChallenge', {
    fields: {
      id: field.id.uuidv7String(),
      userId: field.uuidString(),
      codeHash: field.text(),
      resetTokenHash: field.text().unique().optional(),
      attempts: field.int().default(0),
      expiresAt: field.temporal.timestamptzString(),
      resendAvailableAt: field.temporal.timestamptzString(),
      verifiedAt: field.temporal.timestamptzString().optional(),
      consumedAt: field.temporal.timestamptzString().optional(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  });

  const AuthRateLimit = model('AuthRateLimit', {
    fields: {
      id: field.id.uuidv7String(),
      key: field.text().unique(),
      attempts: field.int().default(0),
      windowStartedAt: field.temporal.timestamptzString(),
      blockedUntil: field.temporal.timestamptzString().optional(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  });

  const Post = model('Post', {
    fields: {
      id: field.id.uuidv7String(),
      title: field.text(),
      content: field.text().optional(),
      authorId: field.uuidString(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  });

  // =========================================================
  // Family
  // =========================================================
  const Family = model('Family', {

    fields: {
      id: field.id.uuidv7String(),
      name: field.text(),
      address: field.text(),
      membershipDate: field.text(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },

  });


  // =========================================================
  // Family Member
  // =========================================================
  const FamilyMember = model('FamilyMember', {

    fields: {
      id: field.id.uuidv7String(),
      name: field.text(),
      phone: field.text().optional(),
      nationalId: field.text().unique(),
      education: field.text(),
      job: field.text().optional(),
      income: field.decimal().optional(),
      relation: field.text(),
      isHead: field.boolean().default(false),
      familyId: field.uuidString(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },

  });

  // =========================================================
  // Servant
  // =========================================================
  const Servant = model('Servant', {
    fields: {
      id: field.id.uuidv7String(),
      name: field.text(),
      address: field.text(),
      serviceStartDate: field.text(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  });

  // =========================================================
  // Servant Member
  // =========================================================
  const ServantMember = model('ServantMember', {
    fields: {
      id: field.id.uuidv7String(),
      name: field.text(),
      phone: field.text().optional(),
      nationalId: field.text().unique(),
      education: field.text(),
      job: field.text().optional(),
      income: field.decimal().optional(),
      relation: field.text(),
      isHead: field.boolean().default(false),
      servantId: field.uuidString(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  });

  // =========================================================
  // Relations
  // =========================================================
  return {
    models: {
      User: User.relations({
        posts: rel.hasMany(Post, { by: 'authorId' }),
        sessions: rel.hasMany(Session, { by: 'userId' }),
        passwordResetChallenges: rel.hasMany(PasswordResetChallenge, { by: 'userId' }),
      }),
      Session: Session.relations({
        user: rel.belongsTo(User, { from: 'userId', to: 'id' }),
      }),
      PasswordResetChallenge: PasswordResetChallenge.relations({
        user: rel.belongsTo(User, { from: 'userId', to: 'id' }),
      }),
      AuthRateLimit,
      Post: Post.relations({
        author: rel.belongsTo(User, { from: 'authorId', to: 'id' }),
      }),

      // -------------------------------------------------------
      // Family
      // -------------------------------------------------------
      Family: Family.relations({

        members: rel.hasMany(FamilyMember, {
          by: 'familyId',
        }),

      }),


      // -------------------------------------------------------
      // Family Member
      // -------------------------------------------------------
      FamilyMember: FamilyMember.relations({

        family: rel.belongsTo(Family, {
          from: 'familyId',
          to: 'id',
        }),

      }),

      // -------------------------------------------------------
      // Servant
      // -------------------------------------------------------
      Servant: Servant.relations({
        members: rel.hasMany(ServantMember, {
          by: 'servantId',
        }),
      }),

      // -------------------------------------------------------
      // Servant Member
      // -------------------------------------------------------
      ServantMember: ServantMember.relations({
        servant: rel.belongsTo(Servant, {
          from: 'servantId',
          to: 'id',
        }),
      }),

    },
  };
});
