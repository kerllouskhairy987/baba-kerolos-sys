"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

type FamilyMember = {
    id: string;
    name: string;
    phone: string;
    nationalId: string;
    education: Education;
    job: string;
    income: string;
    relation: Relation;
    isHead: boolean;
};

type Family = {
    id: string;
    name: string;
    membershipDate: string;
    address: string;
    members: FamilyMember[];
};

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
| بيانات مؤقتة
|--------------------------------------------------------------------------
| بعد توصيل Prisma هنجيب الـ Family والـ Members من Database
*/
const initialFamily: Family = {
    id: "1",
    name: " كيرلس",
    membershipDate: "2018/05/12",
    address: "الإسكندرية - خورشيد",

    members: [
        {
            id: "1",
            name: "كيرلس مينا",
            phone: "01000000000",
            nationalId: "29505151234567",
            education: "جامعة",
            job: "مهندس",
            income: "15000",
            relation: "أب",
            isHead: true,
        },
        {
            id: "2",
            name: "مريم جرجس",
            phone: "01111111111",
            nationalId: "29808221234567",
            education: "جامعة",
            job: "مدرسة",
            income: "9000",
            relation: "أم",
            isHead: false,
        },
        {
            id: "3",
            name: "مينا كيرلس",
            phone: "01222222222",
            nationalId: "32001151234567",
            education: "ابتدائي",
            job: "طالب",
            income: "0",
            relation: "ابن",
            isHead: false,
        },
        {
            id: "4",
            name: "مارينا كيرلس",
            phone: "01555555555",
            nationalId: "31507231234567",
            education: "إعدادي",
            job: "طالبة",
            income: "0",
            relation: "ابنة",
            isHead: false,
        },
    ],
};

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

export default function ServantsDetailsPage() {
    const [family, setFamily] = useState<Family>(initialFamily);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [searchName, setSearchName] = useState("");
    const [searchNationalId, setSearchNationalId] = useState("");

    const [educationFilter, setEducationFilter] = useState<
        Education | ""
    >("");

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


    /*
    |--------------------------------------------------------------------------
    | رب الأسرة
    |--------------------------------------------------------------------------
    */
    const familyHead = family.members.find((member) => member.isHead);

    /*
    |--------------------------------------------------------------------------
    | البحث والفلترة
    |--------------------------------------------------------------------------
    */
    const filteredMembers = useMemo(() => {
        return family.members.filter((member) => {
            const matchesName = member.name
                .toLowerCase()
                .includes(searchName.toLowerCase());

            const matchesNationalId = member.nationalId.includes(
                searchNationalId
            );

            const matchesEducation =
                educationFilter === "" ||
                member.education === educationFilter;

            return (
                matchesName &&
                matchesNationalId &&
                matchesEducation
            );
        });
    }, [
        family.members,
        searchName,
        searchNationalId,
        educationFilter,
    ]);

    /*
    |--------------------------------------------------------------------------
    | تغيير بيانات الفورم
    |--------------------------------------------------------------------------
    */
    const updateForm = (
        field: keyof typeof form,
        value: string | boolean
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | إضافة فرد
    |--------------------------------------------------------------------------
    */
    const handleAddMember = () => {
        if (
            !form.name.trim() ||
            !form.phone.trim() ||
            !form.nationalId.trim() ||
            !form.education ||
            !form.relation
        ) {
            return;
        }

        /*
         * لو الشخص الجديد رب الأسرة
         * نشيل الصفة من رب الأسرة القديم
         */
        const updatedMembers = family.members.map((member) => ({
            ...member,
            isHead: form.isHead ? false : member.isHead,
        }));

        const newMember: FamilyMember = {
            id: crypto.randomUUID(),
            name: form.name.trim(),
            phone: form.phone.trim(),
            nationalId: form.nationalId.trim(),
            education: form.education,
            job: form.job.trim(),
            income: form.income.trim(),
            relation: form.relation,
            isHead: form.isHead,
        };

        setFamily({
            ...family,
            members: [...updatedMembers, newMember],
        });

        resetForm();
    };

    /*
    |--------------------------------------------------------------------------
    | Reset Form
    |--------------------------------------------------------------------------
    */
    const resetForm = () => {
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


    return (
        <>
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
                                ← العودة للخدام
                            </Link>

                            <h1 className="text-3xl font-bold text-[var(--text-main)]">
                                عائلة الخادم {family.name}
                            </h1>

                            <p className="mt-2 text-sm text-[var(--text-muted)]">
                                إدارة أفراد الأسرة وبياناتهم
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-focus)]"
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

                    {/* =====================================================
              Family Information
          ====================================================== */}
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

                        <InfoBox
                            title="اسم الأسرة"
                            value={family.name}
                        />

                        <InfoBox
                            title="تاريخ عضوية الكنيسة"
                            value={family.membershipDate}
                        />

                        <InfoBox
                            title="العنوان"
                            value={family.address}
                        />

                    </div>

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
                                        value={familyHead.phone}
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
                                        أفراد الأسرة
                                    </h2>

                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        {filteredMembers.length} فرد
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

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-[var(--border-color)]">

                                    {filteredMembers.map((member) => (

                                        <tr
                                            key={member.id}
                                            className="transition-colors hover:bg-[var(--primary-light)]/40"
                                        >

                                            <td className="px-5 py-4 font-semibold text-[var(--text-main)]">
                                                {member.name}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-[var(--text-muted)]">
                                                {member.phone}
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

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                            {filteredMembers.length === 0 && (
                                <div className="px-6 py-12 text-center">
                                    <p className="font-semibold text-[var(--text-main)]">
                                        لا توجد نتائج
                                    </p>

                                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                                        جرب تغيير بيانات البحث
                                    </p>
                                </div>
                            )}

                        </div>

                    </section>


                </div>
            </main>

            {/* =========================================================
                ADD MEMBER MODAL
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
                                    إضافة فرد
                                </h2>

                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                    أضف بيانات فرد جديد إلى الأسرة
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
                                onClick={handleAddMember}
                                disabled={
                                    !form.name.trim() ||
                                    !form.phone.trim() ||
                                    !form.nationalId.trim() ||
                                    !form.education ||
                                    !form.relation
                                }
                                className="flex-1 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                حفظ
                            </button>

                        </div>

                    </div>

                </div>
            )}

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
}: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
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
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--bg-page)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-focus)]"
            />
        </div>
    );
}

