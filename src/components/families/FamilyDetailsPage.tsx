"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
    archiveFamilyMember,
    checkFamilyMemberNationalIdExists,
    createFamilyMember,
    FamilyData,
    FamilyMemberData,
    getFamilyById,
    getFamilyMembers,
    updateFamilyMember,
} from "@/lib/families/families";

type Education =
    | "حضانة"
    | "ابتدائي"
    | "إعدادي"
    | "ثانوي عام"
    | "ثانوي فني"
    | "جامعة"
    | "متخرج"
    | "ليس لديه";

type Relation = "أب" | "أم" | "ابن" | "ابنة";

const educationOptions: Education[] = [
    "حضانة",
    "ابتدائي",
    "إعدادي",
    "ثانوي عام",
    "ثانوي فني",
    "جامعة",
    "متخرج",
    "ليس لديه",
];

const relationOptions: Relation[] = [
    "أب",
    "أم",
    "ابن",
    "ابنة",
];

/*
|--------------------------------------------------------------------------
| استخراج تاريخ الميلاد من الرقم القومي المصري
|--------------------------------------------------------------------------
*/
function getBirthDateFromNationalId(nationalId: string) {
    if (!/^\d{14}$/.test(nationalId)) {
        return "-";
    }

    const centuryCode = Number(nationalId[0]);

    let century = 1900;

    if (centuryCode === 3) {
        century = 2000;
    }

    if (centuryCode !== 2 && centuryCode !== 3) {
        return "-";
    }

    const year = century + Number(nationalId.substring(1, 3));
    const month = Number(nationalId.substring(3, 5));
    const day = Number(nationalId.substring(5, 7));

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return "-";
    }

    return `${String(day).padStart(2, "0")}/${String(month).padStart(
        2,
        "0"
    )}/${year}`;
}

type FamilyDetailsPageProps = {
    familyId?: string;
};

export default function FamilyDetailsPage({ familyId = "1" }: FamilyDetailsPageProps) {
    const [family, setFamily] = useState<FamilyData | null>(null);
    const [members, setMembers] = useState<FamilyMemberData[]>([]);
    const [loadingFamily, setLoadingFamily] = useState<boolean>(true);
    const [loadingMembers, setLoadingMembers] = useState<boolean>(true);

    const [memberViewMode, setMemberViewMode] = useState<"active" | "archived">("active");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<FamilyMemberData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchName, setSearchName] = useState("");
    const [searchNationalId, setSearchNationalId] = useState("");
    const [educationFilter, setEducationFilter] = useState<Education | "">("");

    const [form, setForm] = useState({
        name: "",
        phone: "",
        nationalId: "",
        education: "" as Education | "",
        job: "",
        income: "",
        relation: "" as Relation | "",
        isHead: false,
    });

    const reportRef = useRef<HTMLDivElement>(null);

    /*
    |--------------------------------------------------------------------------
    | Load Family Details & Members
    |--------------------------------------------------------------------------
    */
    const loadFamilyData = useCallback(async () => {
        if (!familyId) return;
        setLoadingFamily(true);
        try {
            const data = await getFamilyById(familyId);
            setFamily(data);
        } catch (error) {
            console.error("Error loading family:", error);
        } finally {
            setLoadingFamily(false);
        }
    }, [familyId]);

    const loadMembersData = useCallback(async () => {
        if (!familyId) return;
        setLoadingMembers(true);
        try {
            const data = await getFamilyMembers({
                familyId,
                isArchived: memberViewMode === "archived",
                searchName,
                searchNationalId,
                educationFilter,
            });
            setMembers(data);
        } catch (error) {
            console.error("Error loading family members:", error);
        } finally {
            setLoadingMembers(false);
        }
    }, [familyId, memberViewMode, searchName, searchNationalId, educationFilter]);

    useEffect(() => {
        loadFamilyData();
    }, [loadFamilyData]);

    useEffect(() => {
        loadMembersData();
    }, [loadMembersData]);

    /*
    |--------------------------------------------------------------------------
    | رب الأسرة
    |--------------------------------------------------------------------------
    */
    const familyHead = useMemo(() => {
        return members.find((member) => member.isHead);
    }, [members]);

    const [isDuplicateNationalId, setIsDuplicateNationalId] = useState(false);

    useEffect(() => {
        const trimmedNationalId = form.nationalId.trim();
        if (trimmedNationalId.length === 14) {
            let active = true;
            checkFamilyMemberNationalIdExists(trimmedNationalId, editingMember?.id)
                .then((exists) => {
                    if (active) {
                        setIsDuplicateNationalId(exists);
                    }
                })
                .catch(() => {
                    if (active) {
                        setIsDuplicateNationalId(false);
                    }
                });
            return () => {
                active = false;
            };
        } else {
            setIsDuplicateNationalId(false);
        }
    }, [form.nationalId, editingMember?.id]);

    const phoneError =
        form.phone.trim() !== "" && form.phone.trim().length !== 11
            ? "رقم الموبايل يجب أن يتكون من 11 رقم"
            : "";

    const nationalIdError = useMemo(() => {
        const trimmed = form.nationalId.trim();
        if (trimmed !== "" && trimmed.length !== 14) {
            return "الرقم القومي يجب أن يتكون من 14 رقم";
        }
        if (trimmed.length === 14 && isDuplicateNationalId) {
            return "الرقم القومي موجود بالفعل";
        }
        return "";
    }, [form.nationalId, isDuplicateNationalId]);

    /*
    |--------------------------------------------------------------------------
    | تغيير بيانات الفورم
    |--------------------------------------------------------------------------
    */
    const updateForm = (
        field: keyof typeof form,
        value: string | boolean
    ) => {
        let cleanedValue = value;
        if (typeof value === "string") {
            if (field === "phone") {
                cleanedValue = value.replace(/\D/g, "").slice(0, 11);
            } else if (field === "nationalId") {
                cleanedValue = value.replace(/\D/g, "").slice(0, 14);
            }
        }
        setForm((prev) => ({
            ...prev,
            [field]: cleanedValue,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Open Add Member Modal
    |--------------------------------------------------------------------------
    */
    const handleOpenAddModal = () => {
        setEditingMember(null);
        setForm({
            name: "",
            phone: "",
            nationalId: "",
            education: "",
            job: "",
            income: "",
            relation: "",
            isHead: false,
        });
        setIsModalOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Open Edit Member Modal
    |--------------------------------------------------------------------------
    */
    const handleOpenEditModal = (member: FamilyMemberData) => {
        setEditingMember(member);
        setForm({
            name: member.name,
            phone: member.phone || "",
            nationalId: member.nationalId,
            education: (member.education as Education) || "",
            job: member.job || "",
            income: member.income || "",
            relation: (member.relation as Relation) || "",
            isHead: member.isHead,
        });
        setIsModalOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Reset / Close Form Modal
    |--------------------------------------------------------------------------
    */
    const resetForm = () => {
        setEditingMember(null);
        setForm({
            name: "",
            phone: "",
            nationalId: "",
            education: "",
            job: "",
            income: "",
            relation: "",
            isHead: false,
        });
        setIsModalOpen(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Save Member (Add or Edit)
    |--------------------------------------------------------------------------
    */
    const handleSaveMember = async () => {
        if (
            !form.name.trim() ||
            !form.nationalId.trim() ||
            !form.education ||
            !form.relation ||
            form.nationalId.trim().length !== 14 ||
            isDuplicateNationalId ||
            (form.phone.trim() !== "" && form.phone.trim().length !== 11) ||
            isSubmitting
        ) {
            return;
        }

        const isDup = await checkFamilyMemberNationalIdExists(
            form.nationalId.trim(),
            editingMember?.id
        );
        if (isDup) {
            setIsDuplicateNationalId(true);
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingMember) {
                await updateFamilyMember(editingMember.id, {
                    ...form,
                    familyId,
                });
            } else {
                await createFamilyMember({
                    ...form,
                    familyId,
                });
            }
            resetForm();
            await loadMembersData();
        } catch (error) {
            console.error("Error saving family member:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Archive Member
    |--------------------------------------------------------------------------
    */
    const handleArchiveMember = async (id: string) => {
        try {
            await archiveFamilyMember(id);
            await loadMembersData();
        } catch (error) {
            console.error("Error archiving family member:", error);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | إنشاء PDF
    |--------------------------------------------------------------------------
    */
    const handlePrintReport = async () => {
        if (!reportRef.current) return;

        const canvas = await html2canvas(reportRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const pageWidth = 210;
        const pageHeight = 297;

        const imgWidth = pageWidth;
        const imgHeight =
            (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(
            imgData,
            "PNG",
            0,
            position,
            imgWidth,
            imgHeight
        );

        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;

            pdf.addPage();

            pdf.addImage(
                imgData,
                "PNG",
                0,
                position,
                imgWidth,
                imgHeight
            );

            heightLeft -= pageHeight;
        }

        pdf.save(`استمارة-${family?.name || "العيلة"}.pdf`);
    };

    /*
    |--------------------------------------------------------------------------
    | تقسيم الأبناء للتقرير
    |--------------------------------------------------------------------------
    */
    const youngChildren = members
        .filter(
            (member) =>
                member.relation === "ابن" ||
                member.relation === "ابنة"
        )
        .filter((member) =>
            ["حضانة", "ابتدائي", "إعدادي"].includes(
                member.education
            )
        );

    const olderChildren = members
        .filter(
            (member) =>
                member.relation === "ابن" ||
                member.relation === "ابنة"
        )
        .filter((member) =>
            [
                "ثانوي عام",
                "ثانوي فني",
                "جامعة",
                "متخرج",
            ].includes(member.education)
        );

    const formatDateDisplay = (date: string) => {
        if (!date) return "-";
        const [year, month, day] = date.split("-");
        if (!year || !month || !day) return date;
        return `${day}/${month}/${year}`;
    };

    return (
        <>
            <section className="w-full overflow-x-hidden">
                <main
                    dir="rtl"
                    className="min-h-screen bg-[var(--bg-page)] px-1 py-8 sm:px-6 lg:px-8"
                >
                    <div className="mx-auto max-w-7xl">

                        {/* =====================================================
              Header
          ====================================================== */}
                        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <Link
                                    href="/families"
                                    className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
                                >
                                    ← العودة للعائلات
                                </Link>

                                <h1 className="text-3xl font-bold text-[var(--text-main)]">
                                    {family?.name || (loadingFamily ? "جاري التحميل..." : "تفاصيل العيلة")}
                                </h1>

                                <p className="mt-2 text-sm text-[var(--text-muted)]">
                                    إدارة أفراد الأسرة وبياناتهم
                                </p>
                            </div>

                            {/* View Switch Buttons & Add Member Button */}
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMemberViewMode("active")}
                                    className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-4 ${memberViewMode === "active"
                                        ? "bg-[var(--primary)] text-white shadow-sm hover:bg-[var(--primary-hover)] focus:ring-[var(--primary-focus)]"
                                        : "border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-[var(--primary-light)] focus:ring-[var(--primary-focus)]"
                                        }`}
                                >
                                    الأفراد النشطة
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setMemberViewMode("archived")}
                                    className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-4 ${memberViewMode === "archived"
                                        ? "bg-[var(--primary)] text-white shadow-sm hover:bg-[var(--primary-hover)] focus:ring-[var(--primary-focus)]"
                                        : "border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-[var(--primary-light)] focus:ring-[var(--primary-focus)]"
                                        }`}
                                >
                                    الأفراد المحذوفة
                                </button>

                                <button
                                    type="button"
                                    onClick={handleOpenAddModal}
                                    className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-focus)] w-full sm:w-fit"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="h-5 w-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 4.5v15m7.5-7.5h-15"
                                        />
                                    </svg>

                                    إضافة فرد
                                </button>
                            </div>
                        </div>

                        {/* =====================================================
              Family Information
          ====================================================== */}
                        {family && (
                            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

                                <InfoBox
                                    title="اسم الأسرة"
                                    value={family.name}
                                />

                                <InfoBox
                                    title="تاريخ عضوية الكنيسة"
                                    value={formatDateDisplay(family.membershipDate)}
                                />

                                <InfoBox
                                    title="العنوان"
                                    value={family.address}
                                />

                            </div>
                        )}

                        {/* =====================================================
              Family Head Card
          ====================================================== */}
                        {familyHead && (
                            <section className="mb-8 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--primary-border)] bg-[var(--card-bg)] shadow-[var(--shadow-card)]">

                                <div className="h-2 bg-[var(--primary)]" />

                                <div className="p-6">

                                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                        <div className="flex items-center gap-4">

                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">

                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="h-8 w-8"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                                                    />
                                                </svg>

                                            </div>

                                            <div>
                                                <p className="text-sm text-[var(--text-muted)]">
                                                    رب الأسرة
                                                </p>

                                                <h2 className="text-2xl font-bold text-[var(--text-main)]">
                                                    {familyHead.name}
                                                </h2>
                                            </div>

                                        </div>

                                        <span className="w-fit rounded-full bg-[var(--primary-light)] px-4 py-2 text-sm font-semibold text-[var(--primary)]">
                                            رب الأسرة
                                        </span>

                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                                        <DetailItem
                                            title="رقم الموبايل"
                                            value={familyHead.phone || "-"}
                                        />

                                        <DetailItem
                                            title="الرقم القومي"
                                            value={familyHead.nationalId}
                                        />

                                        <DetailItem
                                            title="الدرجة العلمية"
                                            value={familyHead.education}
                                        />

                                        <DetailItem
                                            title="الوظيفة"
                                            value={familyHead.job || "-"}
                                        />

                                        <DetailItem
                                            title="متوسط الدخل"
                                            value={
                                                familyHead.income
                                                    ? `${familyHead.income} جنيه`
                                                    : "-"
                                            }
                                        />

                                        <DetailItem
                                            title="صلة القرابة"
                                            value={familyHead.relation}
                                        />

                                        <DetailItem
                                            title="تاريخ الميلاد"
                                            value={getBirthDateFromNationalId(
                                                familyHead.nationalId
                                            )}
                                        />

                                    </div>

                                </div>
                            </section>
                        )}

                        {/* =====================================================
              Search
          ====================================================== */}
                        <section className="mb-6 rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-[var(--shadow-card)]">

                            <h2 className="mb-4 text-lg font-bold text-[var(--text-main)]">
                                البحث في أفراد الأسرة
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                                {/* Name */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">
                                        البحث بالاسم
                                    </label>

                                    <input
                                        type="text"
                                        value={searchName}
                                        onChange={(e) =>
                                            setSearchName(e.target.value)
                                        }
                                        placeholder="اكتب اسم الفرد..."
                                        className="w-full rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--bg-page)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-focus)]"
                                    />
                                </div>

                                {/* National ID */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">
                                        البحث بالرقم القومي
                                    </label>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={searchNationalId}
                                        onChange={(e) =>
                                            setSearchNationalId(e.target.value)
                                        }
                                        placeholder="اكتب الرقم القومي..."
                                        className="w-full rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--bg-page)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-focus)]"
                                    />
                                </div>

                                {/* Education */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">
                                        الدرجة العلمية
                                    </label>

                                    <select
                                        value={educationFilter}
                                        onChange={(e) =>
                                            setEducationFilter(
                                                e.target.value as Education | ""
                                            )
                                        }
                                        className="w-full rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--bg-page)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-focus)]"
                                    >
                                        <option value="">
                                            كل الدرجات العلمية
                                        </option>

                                        {educationOptions.map((education) => (
                                            <option
                                                key={education}
                                                value={education}
                                            >
                                                {education}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                        </section>

                        {/* =====================================================
              Members Table
          ====================================================== */}
                        <section className="mb-8 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--card-bg)] shadow-[var(--shadow-card)]">

                            <div className="border-b border-[var(--border-color)] px-6 py-5">
                                <div className="flex items-center justify-between">

                                    <div>
                                        <h2 className="text-xl font-bold text-[var(--text-main)]">
                                            {memberViewMode === "active" ? "أفراد الأسرة النشطة" : "أفراد الأسرة المحذوفة"}
                                        </h2>

                                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                                            {members.length} فرد
                                        </p>
                                    </div>

                                </div>
                            </div>

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[1000px] text-right">

                                    <thead className="bg-[var(--primary-light)]">

                                        <tr>

                                            <th className="px-5 py-4 text-sm font-bold text-[var(--text-main)]">
                                                الاسم
                                            </th>

                                            <th className="px-5 py-4 text-sm font-bold text-[var(--text-main)]">
                                                الموبايل
                                            </th>

                                            <th className="px-5 py-4 text-sm font-bold text-[var(--text-main)]">
                                                الرقم القومي
                                            </th>

                                            <th className="px-5 py-4 text-sm font-bold text-[var(--text-main)]">
                                                الدرجة العلمية
                                            </th>

                                            <th className="px-5 py-4 text-sm font-bold text-[var(--text-main)]">
                                                الوظيفة
                                            </th>

                                            <th className="px-5 py-4 text-sm font-bold text-[var(--text-main)]">
                                                الدخل
                                            </th>

                                            <th className="px-5 py-4 text-sm font-bold text-[var(--text-main)]">
                                                صلة القرابة
                                            </th>

                                            <th className="px-5 py-4 text-sm font-bold text-[var(--text-main)]">
                                                رب الأسرة
                                            </th>

                                            <th className="px-5 py-4 text-sm font-bold text-[var(--text-main)]">
                                                الأحداث
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody className="divide-y divide-[var(--border-color)]">

                                        {members.map((member) => (

                                            <tr
                                                key={member.id}
                                                className="transition-colors hover:bg-[var(--primary-light)]/40"
                                            >

                                                <td className="px-5 py-4 font-semibold text-[var(--text-main)]">
                                                    {member.name}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-[var(--text-muted)]">
                                                    {member.phone || "-"}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-[var(--text-muted)]">
                                                    {member.nationalId}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                                                        {member.education}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-sm text-[var(--text-muted)]">
                                                    {member.job || "-"}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-[var(--text-muted)]">
                                                    {member.income
                                                        ? `${member.income} جنيه`
                                                        : "-"}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-[var(--text-main)]">
                                                    {member.relation}
                                                </td>

                                                <td className="px-5 py-4">

                                                    {member.isHead ? (
                                                        <span className="inline-flex rounded-full bg-[var(--success-bg)] px-3 py-1 text-xs font-semibold text-[var(--success-text)]">
                                                            نعم
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-[var(--text-muted)]">
                                                            لا
                                                        </span>
                                                    )}

                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {/* Edit Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditModal(member)}
                                                            className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-all hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                                                        >
                                                            تعديل
                                                        </button>

                                                        {/* Archive Button */}
                                                        {!member.isArchived && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleArchiveMember(member.id)}
                                                                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-all hover:bg-amber-100"
                                                            >
                                                                إضافة للأرشيف
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                                {!loadingMembers && members.length === 0 && (
                                    <div className="px-6 py-12 text-center">
                                        <p className="font-semibold text-[var(--text-main)]">
                                            لا توجد نتائج
                                        </p>

                                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                                            {memberViewMode === "archived"
                                                ? "لا يوجد أفراد مؤرشفة لهذه الأسرة"
                                                : "جرب تغيير بيانات البحث"}
                                        </p>
                                    </div>
                                )}

                            </div>

                        </section>

                        {/* =====================================================
              Print Button
          ====================================================== */}
                        <div className="flex justify-center pb-8">

                            <button
                                type="button"
                                onClick={handlePrintReport}
                                className="inline-flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--primary)] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-focus)]"
                            >

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.8}
                                    stroke="currentColor"
                                    className="h-5 w-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6.75 9V4.5h10.5V9M6 18H4.5A1.5 1.5 0 0 1 3 16.5v-6A1.5 1.5 0 0 1 4.5 9h15a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H18m-12 0v1.5A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V15H6v3Z"
                                    />
                                </svg>

                                طباعة تقرير
                            </button>

                        </div>

                    </div>
                </main>

                {/* =========================================================
                ADD / EDIT MEMBER MODAL
            ========================================================== */}
                {isModalOpen && (
                    <div
                        dir="rtl"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 py-3 backdrop-blur-sm"
                        onClick={resetForm}
                    >

                        <div
                            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--card-bg)] shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >

                            {/* Modal Header */}
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--card-bg)] px-3 pe-0 sm:px-6 py-5">

                                <div>
                                    <h2 className="text-xl font-bold text-[var(--text-main)]">
                                        {editingMember ? "تعديل بيانات الفرد" : "إضافة فرد"}
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        {editingMember
                                            ? "تعديل بيانات الفرد بالأسرة"
                                            : "أضف بيانات فرد جديد إلى الأسرة"}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                                >
                                    ✕
                                </button>

                            </div>

                            {/* Form */}
                            <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">

                                {/* Name */}
                                <FormInput
                                    label="الاسم"
                                    placeholder="اسم الفرد"
                                    value={form.name}
                                    onChange={(value) =>
                                        updateForm("name", value)
                                    }
                                />

                                {/* Phone */}
                                <FormInput
                                    label="رقم الموبايل"
                                    placeholder="01xxxxxxxxx"
                                    value={form.phone}
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={11}
                                    error={phoneError}
                                    onChange={(value) =>
                                        updateForm("phone", value)
                                    }
                                />

                                {/* National ID */}
                                <FormInput
                                    label="الرقم القومي"
                                    placeholder="14 رقم"
                                    value={form.nationalId}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={14}
                                    error={nationalIdError}
                                    onChange={(value) =>
                                        updateForm("nationalId", value)
                                    }
                                />

                                {/* Education */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">
                                        الدرجة العلمية
                                    </label>

                                    <select
                                        value={form.education}
                                        onChange={(e) =>
                                            updateForm(
                                                "education",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--bg-page)] px-4 py-3 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-focus)]"
                                    >

                                        <option value="">
                                            اختر الدرجة العلمية
                                        </option>

                                        {educationOptions.map((education) => (
                                            <option
                                                key={education}
                                                value={education}
                                            >
                                                {education}
                                            </option>
                                        ))}

                                    </select>
                                </div>

                                {/* Job */}
                                <FormInput
                                    label="الوظيفة"
                                    placeholder="الوظيفة"
                                    value={form.job}
                                    onChange={(value) =>
                                        updateForm("job", value)
                                    }
                                />

                                {/* Income */}
                                <FormInput
                                    label="متوسط الدخل"
                                    placeholder="مثال: 10000"
                                    type="number"
                                    value={form.income}
                                    onChange={(value) =>
                                        updateForm("income", value)
                                    }
                                />

                                {/* Relation */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">
                                        صلة القرابة
                                    </label>

                                    <select
                                        value={form.relation}
                                        onChange={(e) =>
                                            updateForm(
                                                "relation",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--bg-page)] px-4 py-3 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-focus)]"
                                    >

                                        <option value="">
                                            اختر صلة القرابة
                                        </option>

                                        {relationOptions.map((relation) => (
                                            <option
                                                key={relation}
                                                value={relation}
                                            >
                                                {relation}
                                            </option>
                                        ))}

                                    </select>
                                </div>

                                {/* Head of Family */}
                                <div className="sm:col-span-2">

                                    <label className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--primary-light)] p-4">

                                        <input
                                            type="checkbox"
                                            checked={form.isHead}
                                            onChange={(e) =>
                                                updateForm(
                                                    "isHead",
                                                    e.target.checked
                                                )
                                            }
                                            className="h-5 w-5 accent-[var(--primary)]"
                                        />

                                        <div>
                                            <p className="font-semibold text-[var(--text-main)]">
                                                رب الأسرة
                                            </p>

                                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                حدد الاختيار إذا كان هذا الشخص هو رب الأسرة
                                            </p>
                                        </div>

                                    </label>

                                </div>

                            </div>

                            {/* Modal Buttons */}
                            <div className="flex flex-col-reverse gap-3 border-t border-[var(--border-color)] p-6 sm:flex-row">

                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 rounded-[var(--radius-md)] border border-[var(--border-color)] px-5 py-3 text-sm font-semibold text-[var(--text-main)] transition hover:bg-[var(--primary-light)]"
                                >
                                    إلغاء
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSaveMember}
                                    disabled={
                                        !form.name.trim() ||
                                        !form.nationalId.trim() ||
                                        !form.education ||
                                        !form.relation ||
                                        form.nationalId.trim().length !== 14 ||
                                        isDuplicateNationalId ||
                                        (form.phone.trim() !== "" && form.phone.trim().length !== 11) ||
                                        isSubmitting
                                    }
                                    className="flex-1 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? "جاري الحفظ..." : "حفظ"}
                                </button>

                            </div>

                        </div>

                    </div>
                )}
            </section>
            {/* =========================================================
          PDF REPORT
      ========================================================== */}
            <div
                ref={reportRef}
                dir="rtl"
                className="pointer-events-none fixed left-[-1000px] top-0 w-[794px] bg-white p-8 text-black"
            >

                {/* PDF Border */}
                <div className="border-[2px] border-[#455a72] p-5">

                    {/* Header */}
                    <div className="mb-5 flex items-center border-b border-black pb-5">

                        {/* Logo */}
                        <div className="w-[25%] text-center">
                            <img
                                src="/images/church-logo.png"
                                alt="لوجو الكنيسة"
                                className="mx-auto h-[100px] w-[100px] object-contain"
                            />
                        </div>

                        {/* Title */}
                        <div className="w-[50%] text-center">

                            <h1 className="text-[23px] font-bold">
                                استمارة عضوية الكنيسة
                            </h1>

                            <p className="mt-3 text-[18px] font-bold">
                                كنيسة البابا كيرلس
                            </p>

                        </div>

                        {/* Church */}
                        <div className="w-[25%] text-center text-[15px] font-bold">
                            كنيسة
                        </div>

                    </div>

                    {/* Family Header Table */}
                    <div className="mb-5 border border-black">

                        <div className="grid grid-cols-2 divide-x divide-black border-b border-black text-[14px]">

                            <div className="p-2.5 font-bold">
                                اسم الأسرة: {family?.name || ""}
                            </div>

                            <div className="p-2.5 font-bold">
                                تاريخ عضوية الكنيسة: {family ? formatDateDisplay(family.membershipDate) : ""}
                            </div>

                        </div>

                        <div className="p-2.5 text-[14px] font-bold">
                            العنوان: {family?.address || ""}
                        </div>

                    </div>

                    {/* Parents Details */}
                    <div className="border border-black">

                        <div className="border-b border-black bg-[#f1ebe6] p-2 text-center text-[15px] font-bold">
                            بيانات الوالدين
                        </div>

                        {/* Father */}
                        <div className="border-b border-black p-3 text-[13px]">

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <strong>اسم الزوج:</strong>{" "}
                                    {members.find(
                                        (m) => m.relation === "أب"
                                    )?.name || ""}
                                </div>

                                <div>
                                    <strong>تاريخ الميلاد:</strong>{" "}
                                    {getBirthDateFromNationalId(
                                        members.find(
                                            (m) => m.relation === "أب"
                                        )?.nationalId || ""
                                    )}
                                </div>

                            </div>

                            <div className="mt-2 grid grid-cols-3 gap-4">

                                <div>
                                    <strong>الدرجة العلمية:</strong>{" "}
                                    {members.find(
                                        (m) => m.relation === "أب"
                                    )?.education || ""}
                                </div>

                                <div>
                                    <strong>الوظيفة:</strong>{" "}
                                    {members.find(
                                        (m) => m.relation === "أب"
                                    )?.job || ""}
                                </div>

                                <div>
                                    <strong>الدخل:</strong>{" "}
                                    {members.find(
                                        (m) => m.relation === "أب"
                                    )?.income || ""}
                                </div>

                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-4">

                                <div>
                                    <strong>الرقم القومي:</strong>{" "}
                                    {members.find(
                                        (m) => m.relation === "أب"
                                    )?.nationalId || ""}
                                </div>

                                <div>
                                    <strong>رقم التليفون:</strong>{" "}
                                    {members.find(
                                        (m) => m.relation === "أب"
                                    )?.phone || ""}
                                </div>

                            </div>

                        </div>

                        {/* Mother */}
                        <div className="p-3 text-[13px]">

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <strong>اسم الزوجة:</strong>{" "}
                                    {members.find(
                                        (m) => m.relation === "أم"
                                    )?.name || ""}
                                </div>

                                <div>
                                    <strong>تاريخ الميلاد:</strong>{" "}
                                    {getBirthDateFromNationalId(
                                        members.find(
                                            (m) => m.relation === "أم"
                                        )?.nationalId || ""
                                    )}
                                </div>

                            </div>

                            <div className="mt-2 grid grid-cols-3 gap-4">

                                <div>
                                    <strong>الدرجة العلمية:</strong>{" "}
                                    {members.find(
                                        (m) => m.relation === "أم"
                                    )?.education || ""}
                                </div>

                                <div>
                                    <strong>الوظيفة:</strong>{" "}
                                    {members.find(
                                        (m) => m.relation === "أم"
                                    )?.job || ""}
                                </div>

                                <div>
                                    <strong>الدخل:</strong>{" "}
                                    {members.find(
                                        (m) => m.relation === "أم"
                                    )?.income || ""}
                                </div>

                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-4">

                                <div>
                                    <strong>الرقم القومي:</strong>{" "}
                                    {members.find(
                                        (m) => m.relation === "أم"
                                    )?.nationalId || ""}
                                </div>

                                <div>
                                    <strong>رقم التليفون:</strong>{" "}
                                    {members.find(
                                        (m) => m.relation === "أم"
                                    )?.phone || ""}
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Young Children */}
                    <ReportChildrenTable
                        title="الأبناء ( حضانة / ابتدائي / إعدادي )"
                        members={youngChildren}
                    />

                    {/* Older Children */}
                    <ReportChildrenTable
                        title="الأبناء ( ثانوي / جامعة / متخرجين )"
                        members={olderChildren}
                    />

                    {/* Relatives */}
                    <div className="mt-5 border border-black">

                        <div className="border-b border-black bg-[#f1ebe6] p-2 text-center font-bold">
                            الأقرباء المقيمين مع الأسرة
                        </div>

                        <table className="w-full border-collapse text-[13px]">

                            <thead>
                                <tr>
                                    <th className="border border-black p-2">
                                        م
                                    </th>

                                    <th className="border border-black p-2">
                                        الاسم
                                    </th>

                                    <th className="border border-black p-2">
                                        صلة القرابة
                                    </th>

                                    <th className="border border-black p-2">
                                        تاريخ الميلاد
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {[1, 2, 3].map((number) => (
                                    <tr key={number}>

                                        <td className="h-9 border border-black p-2 text-center">
                                            {number}
                                        </td>

                                        <td className="border border-black" />

                                        <td className="border border-black" />

                                        <td className="border border-black" />

                                    </tr>
                                ))}
                            </tbody>

                        </table>

                    </div>

                    {/* Footer */}
                    <div className="mt-8 grid grid-cols-2 gap-8 text-[15px]">

                        <div>
                            <strong>اسم الأب الكاهن:</strong>

                            <div className="mt-4 border-b border-black pb-2" />
                        </div>

                        <div>
                            <strong>تاريخ الزيارة:</strong>

                            <div className="mt-4 border-b border-black pb-2" />
                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Info Box
|--------------------------------------------------------------------------
*/
function InfoBox({
    title,
    value,
}: {
    title: string;
    value: string;
}) {
    return (
        <div className="rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-[var(--shadow-card)]">
            <p className="text-sm text-[var(--text-muted)]">
                {title}
            </p>

            <p className="mt-2 font-bold text-[var(--text-main)]">
                {value}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Detail Item
|--------------------------------------------------------------------------
*/
function DetailItem({
    title,
    value,
}: {
    title: string;
    value: string;
}) {
    return (
        <div className="rounded-[var(--radius-md)] bg-[var(--bg-page)] p-4">
            <p className="text-xs text-[var(--text-muted)]">
                {title}
            </p>

            <p className="mt-1 text-sm font-semibold text-[var(--text-main)]">
                {value}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Form Input
|--------------------------------------------------------------------------
*/
function FormInput({
    label,
    placeholder,
    value,
    onChange,
    type = "text",
    error,
    inputMode,
    maxLength,
}: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    error?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    maxLength?: number;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">
                {label}
            </label>

            <input
                type={type}
                value={value}
                placeholder={placeholder}
                inputMode={inputMode}
                maxLength={maxLength}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full rounded-[var(--radius-md)] border ${error ? "border-red-500" : "border-[var(--border-color)]"
                    } bg-[var(--bg-page)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-focus)]`}
            />

            {error && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| PDF Children Table
|--------------------------------------------------------------------------
*/
function ReportChildrenTable({
    title,
    members,
}: {
    title: string;
    members: FamilyMemberData[];
}) {
    return (
        <div className="mt-5 border border-black">

            <div className="border-b border-black bg-[#f1ebe6] p-2 text-center text-[15px] font-bold">
                {title}
            </div>

            <table className="w-full border-collapse text-[13px]">

                <thead>
                    <tr>

                        <th className="border border-black p-2">
                            م
                        </th>

                        <th className="border border-black p-2">
                            الاسم
                        </th>

                        <th className="border border-black p-2">
                            تاريخ الميلاد
                        </th>

                    </tr>
                </thead>

                <tbody>

                    {members.length > 0 ? (
                        members.map((member, index) => (
                            <tr key={member.id}>

                                <td className="border border-black p-2 text-center">
                                    {index + 1}
                                </td>

                                <td className="border border-black p-2">
                                    {member.name}
                                </td>

                                <td className="border border-black p-2 text-center">
                                    {getBirthDateFromNationalId(
                                        member.nationalId
                                    )}
                                </td>

                            </tr>
                        ))
                    ) : (
                        <tr>

                            <td className="h-10 border border-black text-center">
                                1
                            </td>

                            <td className="border border-black" />

                            <td className="border border-black" />

                        </tr>
                    )}

                </tbody>

            </table>

        </div>
    );
}