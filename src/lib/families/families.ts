"use server";

import { db } from "@/prisma/db";

export type FamilyData = {
  id: string;
  name: string;
  address: string;
  membershipDate: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FamilyMemberData = {
  id: string;
  name: string;
  phone: string;
  nationalId: string;
  education: string;
  job: string;
  income: string;
  relation: string;
  isHead: boolean;
  familyId: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

/*
|--------------------------------------------------------------------------
| Family Server Actions
|--------------------------------------------------------------------------
*/

export async function createFamily(data: {
  name: string;
  address: string;
  membershipDate: string;
}): Promise<FamilyData> {
  const family = await db.orm.public.Family.create({
    name: data.name.trim(),
    address: data.address.trim(),
    membershipDate: data.membershipDate.trim(),
    isArchived: false,
  });

  return {
    ...family,
    isArchived: family.isArchived ?? false,
  };
}

export async function getFamilies(params?: {
  isArchived?: boolean;
  search?: string;
}): Promise<FamilyData[]> {
  const isArchivedTarget = params?.isArchived ?? false;

  let query = db.orm.public.Family.where((f) => f.isArchived.eq(isArchivedTarget));

  if (params?.search && params.search.trim() !== "") {
    const searchTerm = `%${params.search.trim()}%`;
    query = query.where((f) => f.name.ilike(searchTerm));
  }

  const families = await query.orderBy((f) => f.createdAt.desc()).all();

  return families.map((f) => ({
    ...f,
    isArchived: f.isArchived ?? false,
  }));
}

export async function getFamilyById(id: string): Promise<FamilyData | null> {
  const family = await db.orm.public.Family.where((f) => f.id.eq(id as any)).first();
  if (!family) return null;

  return {
    ...family,
    isArchived: family.isArchived ?? false,
  };
}

export async function updateFamily(
  id: string,
  data: {
    name: string;
    address: string;
    membershipDate: string;
  }
): Promise<FamilyData> {
  const updated = await db.orm.public.Family.where((f) => f.id.eq(id as any)).update({
    name: data.name.trim(),
    address: data.address.trim(),
    membershipDate: data.membershipDate.trim(),
  });

  const family = Array.isArray(updated) ? updated[0] : updated;

  return {
    ...family,
    isArchived: family.isArchived ?? false,
  };
}

export async function archiveFamily(id: string): Promise<void> {
  await db.orm.public.Family.where((f) => f.id.eq(id as any)).update({
    isArchived: true,
  });
}

/*
|--------------------------------------------------------------------------
| FamilyMember Server Actions
|--------------------------------------------------------------------------
*/

export async function createFamilyMember(data: {
  name: string;
  phone?: string;
  nationalId: string;
  education: string;
  job?: string;
  income?: string;
  relation: string;
  isHead?: boolean;
  familyId: string;
}): Promise<FamilyMemberData> {
  if (data.isHead) {
    await db.orm.public.FamilyMember.where((m) => m.familyId.eq(data.familyId as any)).update({
      isHead: false,
    });
  }

  const member = await db.orm.public.FamilyMember.create({
    name: data.name.trim(),
    phone: data.phone?.trim() || null,
    nationalId: data.nationalId.trim(),
    education: data.education.trim(),
    job: data.job?.trim() || null,
    income: data.income?.trim() ? String(data.income.trim()) : null,
    relation: data.relation.trim(),
    isHead: !!data.isHead,
    familyId: data.familyId as any,
    isArchived: false,
  });

  return {
    ...member,
    phone: member.phone || "",
    job: member.job || "",
    income: member.income != null ? String(member.income) : "",
    isArchived: member.isArchived ?? false,
  };
}

export async function getFamilyMembers(params: {
  familyId: string;
  isArchived?: boolean;
  searchName?: string;
  searchNationalId?: string;
  educationFilter?: string;
}): Promise<FamilyMemberData[]> {
  const isArchivedTarget = params.isArchived ?? false;

  let query = db.orm.public.FamilyMember.where((m) =>
    m.familyId.eq(params.familyId as any)
  ).where((m) => m.isArchived.eq(isArchivedTarget));

  if (params.searchName && params.searchName.trim() !== "") {
    const nameTerm = `%${params.searchName.trim()}%`;
    query = query.where((m) => m.name.ilike(nameTerm));
  }

  if (params.searchNationalId && params.searchNationalId.trim() !== "") {
    const nationalIdTerm = `%${params.searchNationalId.trim()}%`;
    query = query.where((m) => m.nationalId.like(nationalIdTerm));
  }

  if (params.educationFilter && params.educationFilter.trim() !== "") {
    query = query.where((m) => m.education.eq(params.educationFilter!.trim()));
  }

  const members = await query.orderBy((m) => m.createdAt.asc()).all();

  return members.map((m) => ({
    ...m,
    phone: m.phone || "",
    job: m.job || "",
    income: m.income != null ? String(m.income) : "",
    isArchived: m.isArchived ?? false,
  }));
}

export async function updateFamilyMember(
  id: string,
  data: {
    name: string;
    phone?: string;
    nationalId: string;
    education: string;
    job?: string;
    income?: string;
    relation: string;
    isHead?: boolean;
    familyId: string;
  }
): Promise<FamilyMemberData> {
  if (data.isHead) {
    await db.orm.public.FamilyMember.where((m) => m.familyId.eq(data.familyId as any)).update({
      isHead: false,
    });
  }

  const updated = await db.orm.public.FamilyMember.where((m) => m.id.eq(id as any)).update({
    name: data.name.trim(),
    phone: data.phone?.trim() || null,
    nationalId: data.nationalId.trim(),
    education: data.education.trim(),
    job: data.job?.trim() || null,
    income: data.income?.trim() ? String(data.income.trim()) : null,
    relation: data.relation.trim(),
    isHead: !!data.isHead,
    familyId: data.familyId as any,
  });

  const member = Array.isArray(updated) ? updated[0] : updated;

  return {
    ...member,
    phone: member.phone || "",
    job: member.job || "",
    income: member.income != null ? String(member.income) : "",
    isArchived: member.isArchived ?? false,
  };
}

export async function archiveFamilyMember(id: string): Promise<void> {
  await db.orm.public.FamilyMember.where((m) => m.id.eq(id as any)).update({
    isArchived: true,
  });
}

export async function checkFamilyMemberNationalIdExists(
  nationalId: string,
  excludeMemberId?: string
): Promise<boolean> {
  const trimmed = nationalId.trim();
  if (!trimmed) return false;

  const members = await db.orm.public.FamilyMember.where((m) =>
    m.nationalId.eq(trimmed)
  ).all();

  const existing = members.find((m) => m.id !== excludeMemberId);
  return !!existing;
}
