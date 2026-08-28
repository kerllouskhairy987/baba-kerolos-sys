import { defineContract } from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract({}, ({ field, model, rel }) => {
  const User = model('User', {
    fields: {
      id: field.id.uuidv7String(),
      email: field.text().unique(),
      username: field.text().optional(),
      name: field.text().optional(),
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
      }),
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
