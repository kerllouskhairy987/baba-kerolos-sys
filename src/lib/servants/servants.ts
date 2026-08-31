"use server";

import { db } from "@/prisma/db";

export type ServantData = {
  id: string;
  name: string;
  address: string;
  serviceStartDate: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ServantMemberData = {
  id: string;
  name: string;
  phone: string;
  nationalId: string;
  education: string;
  job: string;
  income: string;
  relation: string;
  isHead: boolean;
  servantId: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

/*
|--------------------------------------------------------------------------
| Servant Server Actions
|--------------------------------------------------------------------------
*/

export async function createServant(data: {
  name: string;
  address: string;
  serviceStartDate: string;
}): Promise<ServantData> {
  const servant = await db.orm.public.Servant.create({
    name: data.name.trim(),
    address: data.address.trim(),
    serviceStartDate: data.serviceStartDate.trim(),
    isArchived: false,
  });

  return {
    ...servant,
    isArchived: servant.isArchived ?? false,
  };
}

export async function getServants(params?: {
  isArchived?: boolean;
  search?: string;
}): Promise<ServantData[]> {
  const isArchivedTarget = params?.isArchived ?? false;

  let query = db.orm.public.Servant.where((s) => s.isArchived.eq(isArchivedTarget));

  if (params?.search && params.search.trim() !== "") {
    const searchTerm = `%${params.search.trim()}%`;
    query = query.where((s) => s.name.ilike(searchTerm));
  }

  const servants = await query.orderBy((s) => s.createdAt.desc()).all();

  return servants.map((s) => ({
    ...s,
    isArchived: s.isArchived ?? false,
  }));
}

export async function getServantById(id: string): Promise<ServantData | null> {
  const servant = await db.orm.public.Servant.where((s) => s.id.eq(id as any)).first();
  if (!servant) return null;

  return {
    ...servant,
    isArchived: servant.isArchived ?? false,
  };
}

export async function updateServant(
  id: string,
  data: {
    name: string;
    address: string;
    serviceStartDate: string;
  }
): Promise<ServantData> {
  const updated = await db.orm.public.Servant.where((s) => s.id.eq(id as any)).update({
    name: data.name.trim(),
    address: data.address.trim(),
    serviceStartDate: data.serviceStartDate.trim(),
  });

  const servant = Array.isArray(updated) ? updated[0] : updated;

  return {
    ...servant,
    isArchived: servant.isArchived ?? false,
  };
}

export async function archiveServant(id: string): Promise<void> {
  await db.orm.public.Servant.where((s) => s.id.eq(id as any)).update({
    isArchived: true,
  });
}

/*
|--------------------------------------------------------------------------
| ServantMember Server Actions
|--------------------------------------------------------------------------
*/

export async function createServantMember(data: {
  name: string;
  phone?: string;
  nationalId: string;
  education: string;
  job?: string;
  income?: string;
  relation: string;
  isHead?: boolean;
  servantId: string;
}): Promise<ServantMemberData> {
  const member = await db.orm.public.ServantMember.create({
    name: data.name.trim(),
    phone: data.phone?.trim() || null,
    nationalId: data.nationalId.trim(),
    education: data.education.trim(),
    job: data.job?.trim() || null,
    income: data.income?.trim() ? String(data.income.trim()) : null,
    relation: data.relation.trim(),
    isHead: !!data.isHead,
    servantId: data.servantId as any,
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

export async function getServantMembers(params: {
  servantId: string;
  isArchived?: boolean;
  searchName?: string;
  searchNationalId?: string;
  educationFilter?: string;
}): Promise<ServantMemberData[]> {
  const isArchivedTarget = params.isArchived ?? false;

  let query = db.orm.public.ServantMember.where((m) =>
    m.servantId.eq(params.servantId as any)
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

export async function updateServantMember(
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
    servantId: string;
  }
): Promise<ServantMemberData> {
  const updated = await db.orm.public.ServantMember.where((m) => m.id.eq(id as any)).update({
    name: data.name.trim(),
    phone: data.phone?.trim() || null,
    nationalId: data.nationalId.trim(),
    education: data.education.trim(),
    job: data.job?.trim() || null,
    income: data.income?.trim() ? String(data.income.trim()) : null,
    relation: data.relation.trim(),
    isHead: !!data.isHead,
    servantId: data.servantId as any,
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

export async function archiveServantMember(id: string): Promise<void> {
  await db.orm.public.ServantMember.where((m) => m.id.eq(id as any)).update({
    isArchived: true,
  });
}

export async function checkServantMemberNationalIdExists(
  nationalId: string,
  excludeMemberId?: string
): Promise<boolean> {
  const trimmed = nationalId.trim();
  if (!trimmed) return false;

  const members = await db.orm.public.ServantMember.where((m) =>
    m.nationalId.eq(trimmed)
  ).all();

  const existing = members.find((m) => m.id !== excludeMemberId);
  return !!existing;
}
