"use server";

import { db } from "@/prisma/db";

export type PriestData = {
  id: string;
  name: string;
  nationalId: string;
  ordinationDate: string;
  archpriestDate: string;
  deathDate: string;
  address: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PriestMemberData = {
  id: string;
  name: string;
  phone: string;
  nationalId: string;
  education: string;
  job: string;
  income: string;
  relation: string;
  isHead: boolean;
  priestId: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

/*
|--------------------------------------------------------------------------
| Priest Server Actions
|--------------------------------------------------------------------------
*/

export async function createPriest(data: {
  name: string;
  nationalId: string;
  ordinationDate: string;
  archpriestDate?: string;
  deathDate?: string;
  address: string;
}): Promise<PriestData> {
  const priest = await db.orm.public.Priest.create({
    name: data.name.trim(),
    nationalId: data.nationalId.trim(),
    ordinationDate: data.ordinationDate.trim(),
    archpriestDate: data.archpriestDate?.trim() || null,
    deathDate: data.deathDate?.trim() || null,
    address: data.address.trim(),
    isArchived: false,
  });

  return {
    ...priest,
    archpriestDate: priest.archpriestDate || "",
    deathDate: priest.deathDate || "",
    isArchived: priest.isArchived ?? false,
  };
}

export async function getPriests(params?: {
  isArchived?: boolean;
  search?: string;
}): Promise<PriestData[]> {
  const isArchivedTarget = params?.isArchived ?? false;

  let query = db.orm.public.Priest.where((s) => s.isArchived.eq(isArchivedTarget));

  if (params?.search && params.search.trim() !== "") {
    const searchTerm = `%${params.search.trim()}%`;
    query = query.where((s) => s.name.ilike(searchTerm));
  }

  const priests = await query.orderBy((s) => s.createdAt.desc()).all();

  return priests.map((s) => ({
    ...s,
    archpriestDate: s.archpriestDate || "",
    deathDate: s.deathDate || "",
    isArchived: s.isArchived ?? false,
  }));
}

export async function getPriestById(id: string): Promise<PriestData | null> {
  const priest = await db.orm.public.Priest.where((s) => s.id.eq(id as any)).first();
  if (!priest) return null;

  return {
    ...priest,
    archpriestDate: priest.archpriestDate || "",
    deathDate: priest.deathDate || "",
    isArchived: priest.isArchived ?? false,
  };
}

export async function updatePriest(
  id: string,
  data: {
    name: string;
    nationalId: string;
    ordinationDate: string;
    archpriestDate?: string;
    deathDate?: string;
    address: string;
  }
): Promise<PriestData> {
  const updated = await db.orm.public.Priest.where((s) => s.id.eq(id as any)).update({
    name: data.name.trim(),
    nationalId: data.nationalId.trim(),
    ordinationDate: data.ordinationDate.trim(),
    archpriestDate: data.archpriestDate?.trim() || null,
    deathDate: data.deathDate?.trim() || null,
    address: data.address.trim(),
  });

  const priest = Array.isArray(updated) ? updated[0] : updated;

  return {
    ...priest,
    archpriestDate: priest.archpriestDate || "",
    deathDate: priest.deathDate || "",
    isArchived: priest.isArchived ?? false,
  };
}

export async function archivePriest(id: string): Promise<void> {
  await db.orm.public.Priest.where((s) => s.id.eq(id as any)).update({
    isArchived: true,
  });
}

export async function checkPriestNationalIdExists(
  nationalId: string,
  excludePriestId?: string
): Promise<boolean> {
  const trimmed = nationalId.trim();
  if (!trimmed) return false;

  const priests = await db.orm.public.Priest.where((m) =>
    m.nationalId.eq(trimmed)
  ).all();

  const existing = priests.find((m) => m.id !== excludePriestId);
  return !!existing;
}

/*
|--------------------------------------------------------------------------
| PriestMember Server Actions
|--------------------------------------------------------------------------
*/

export async function createPriestMember(data: {
  name: string;
  phone?: string;
  nationalId: string;
  education: string;
  job?: string;
  income?: string;
  relation: string;
  isHead?: boolean;
  priestId: string;
}): Promise<PriestMemberData> {
  const member = await db.orm.public.PriestMember.create({
    name: data.name.trim(),
    phone: data.phone?.trim() || null,
    nationalId: data.nationalId.trim(),
    education: data.education.trim(),
    job: data.job?.trim() || null,
    income: data.income?.trim() ? String(data.income.trim()) : null,
    relation: data.relation.trim(),
    isHead: !!data.isHead,
    priestId: data.priestId as any,
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

export async function getPriestMembers(params: {
  priestId: string;
  isArchived?: boolean;
  searchName?: string;
  searchNationalId?: string;
  educationFilter?: string;
}): Promise<PriestMemberData[]> {
  const isArchivedTarget = params.isArchived ?? false;

  let query = db.orm.public.PriestMember.where((m) =>
    m.priestId.eq(params.priestId as any)
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

export async function updatePriestMember(
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
    priestId: string;
  }
): Promise<PriestMemberData> {
  const updated = await db.orm.public.PriestMember.where((m) => m.id.eq(id as any)).update({
    name: data.name.trim(),
    phone: data.phone?.trim() || null,
    nationalId: data.nationalId.trim(),
    education: data.education.trim(),
    job: data.job?.trim() || null,
    income: data.income?.trim() ? String(data.income.trim()) : null,
    relation: data.relation.trim(),
    isHead: !!data.isHead,
    priestId: data.priestId as any,
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

export async function archivePriestMember(id: string): Promise<void> {
  await db.orm.public.PriestMember.where((m) => m.id.eq(id as any)).update({
    isArchived: true,
  });
}

export async function checkPriestMemberNationalIdExists(
  nationalId: string,
  excludeMemberId?: string
): Promise<boolean> {
  const trimmed = nationalId.trim();
  if (!trimmed) return false;

  const members = await db.orm.public.PriestMember.where((m) =>
    m.nationalId.eq(trimmed)
  ).all();

  const existing = members.find((m) => m.id !== excludeMemberId);
  return !!existing;
}
