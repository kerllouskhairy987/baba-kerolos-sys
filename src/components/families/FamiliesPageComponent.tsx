"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
    archiveFamily,
    createFamily,
    FamilyData,
    getFamilies,
    updateFamily,
} from "@/lib/families/families";

export default function FamiliesPage() {
    const [viewMode, setViewMode] = useState<"active" | "archived">("active");
    const [families, setFamilies] = useState<FamilyData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [search, setSearch] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFamily, setEditingFamily] = useState<FamilyData | null>(null);

    const [familyName, setFamilyName] = useState("");
    const [familyAddress, setFamilyAddress] = useState("");
    const [membershipDate, setMembershipDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    /*
      |--------------------------------------------------------------------------
      | Fetch Families
      |--------------------------------------------------------------------------
      */
    const loadFamilies = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getFamilies({
                isArchived: viewMode === "archived",
                search,
            });
            setFamilies(data);
        } catch (error) {
            console.error("Error loading families:", error);
        } finally {
            setLoading(false);
        }
    }, [viewMode, search]);

    useEffect(() => {
        loadFamilies();
    }, [loadFamilies]);

    /*
      |--------------------------------------------------------------------------
      | Open Add Modal
      |--------------------------------------------------------------------------
      */
    const handleOpenAddModal = () => {
        setEditingFamily(null);
        setFamilyName("");
        setFamilyAddress("");
        setMembershipDate("");
        setIsModalOpen(true);
    };

    /*
      |--------------------------------------------------------------------------
      | Open Edit Modal
      |--------------------------------------------------------------------------
      */
    const handleOpenEditModal = (family: FamilyData) => {
        setEditingFamily(family);
        setFamilyName(family.name);
        setFamilyAddress(family.address);
        setMembershipDate(family.membershipDate);
        setIsModalOpen(true);
    };

    /*
      |--------------------------------------------------------------------------
      | Close Modal
      |--------------------------------------------------------------------------
      */
    const handleCloseModal = () => {
        setEditingFamily(null);
        setFamilyName("");
        setFamilyAddress("");
        setMembershipDate("");
        setIsModalOpen(false);
    };

    /*
      |--------------------------------------------------------------------------
      | Save Family (Add or Edit)
      |--------------------------------------------------------------------------
      */
    const handleSaveFamily = async () => {
        const name = familyName.trim();
        const address = familyAddress.trim();

        if (!name || !address || !membershipDate || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingFamily) {
                await updateFamily(editingFamily.id, {
                    name,
                    address,
                    membershipDate,
                });
            } else {
                await createFamily({
                    name,
                    address,
                    membershipDate,
                });
            }

            handleCloseModal();
            await loadFamilies();
        } catch (error) {
            console.error("Error saving family:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    /*
      |--------------------------------------------------------------------------
      | Archive Family
      |--------------------------------------------------------------------------
      */
    const handleArchiveFamily = async (id: string) => {
        try {
            await archiveFamily(id);
            await loadFamilies();
        } catch (error) {
            console.error("Error archiving family:", error);
        }
    };

    /*
      |--------------------------------------------------------------------------
      | Format Date
      |--------------------------------------------------------------------------
      */
    const formatDate = (date: string) => {
        if (!date) return "-";
        const [year, month, day] = date.split("-");
        if (!year || !month || !day) return date;
        return `${day}/${month}/${year}`;
    };

    return (
        <main
            dir="rtl"
            className="
        min-h-screen
        bg-[var(--bg-page)]
        px-4
        py-8
        sm:px-6
        lg:px-8
      "
        >
            <div className="mx-auto max-w-7xl">
                {/* =====================================================
            PAGE HEADER
        ====================================================== */}

                <section className="mb-8">
                    <div
                        className="
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
                    >
                        {/* Title */}
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <div
                                    className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-[var(--radius-md)]
                    bg-[var(--primary-light)]
                    text-[var(--primary)]
                  "
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
                                            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.125-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.003A23.906 23.906 0 0 1 8.625 21c-2.331 0-4.512-.645-6.375-1.77 0-.78.207-1.514.568-2.14m12.182-3.612a4.125 4.125 0 1 0-7.533-2.493M12 10.5a4.125 4.125 0 1 1-8.25 0 4.125 4.125 0 0 1 8.25 0ZM12 10.5a4.125 4.125 0 0 1 7.533-2.493"
                                        />
                                    </svg>
                                </div>

                                <h1
                                    className="
                    text-2xl
                    font-bold
                    text-[var(--text-main)]
                    sm:text-3xl
                  "
                                >
                                    العائلات
                                </h1>
                            </div>

                            <p
                                className="
                  text-sm
                  text-[var(--text-muted)]
                "
                            >
                                إدارة عائلات الكنيسة وبياناتها
                            </p>
                        </div>

                        {/* View Filter Switch & Add Button */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setViewMode("active")}
                                className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-4 ${
                                    viewMode === "active"
                                        ? "bg-[var(--primary)] text-white shadow-sm hover:bg-[var(--primary-hover)] focus:ring-[var(--primary-focus)]"
                                        : "border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-[var(--primary-light)] focus:ring-[var(--primary-focus)]"
                                }`}
                            >
                                العائلات النشطة
                            </button>

                            <button
                                type="button"
                                onClick={() => setViewMode("archived")}
                                className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-4 ${
                                    viewMode === "archived"
                                        ? "bg-[var(--primary)] text-white shadow-sm hover:bg-[var(--primary-hover)] focus:ring-[var(--primary-focus)]"
                                        : "border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-[var(--primary-light)] focus:ring-[var(--primary-focus)]"
                                }`}
                            >
                                عرض العائلات المحذوفة
                            </button>

                            <button
                                type="button"
                                onClick={handleOpenAddModal}
                                className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-[var(--radius-md)]
                    bg-[var(--primary)]
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition-all
                    hover:-translate-y-0.5
                    hover:bg-[var(--primary-hover)]
                    focus:outline-none
                    focus:ring-4
                    focus:ring-[var(--primary-focus)]
                  "
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
                                إضافة عيلة
                            </button>
                        </div>
                    </div>
                </section>

                {/* =====================================================
            SEARCH
        ====================================================== */}

                <section
                    className="
            mb-6
            rounded-[var(--radius-lg)]
            border
            border-[var(--border-color)]
            bg-[var(--card-bg)]
            p-5
            shadow-[var(--shadow-card)]
          "
                >
                    <label
                        htmlFor="family-search"
                        className="
              mb-2
              block
              text-sm
              font-semibold
              text-[var(--text-main)]
            "
                    >
                        البحث في العائلات
                    </label>

                    <div className="relative">
                        {/* Search Icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="
                pointer-events-none
                absolute
                right-4
                top-1/2
                h-5
                w-5
                -translate-y-1/2
                text-[var(--text-muted)]
              "
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                            />
                        </svg>

                        <input
                            id="family-search"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث باسم العيلة..."
                            className="
                w-full
                rounded-[var(--radius-md)]
                border
                border-[var(--border-color)]
                bg-[var(--bg-page)]
                py-3
                pr-12
                pl-4
                text-sm
                text-[var(--text-main)]
                outline-none
                transition-all
                placeholder:text-[var(--text-muted)]
                focus:border-[var(--primary)]
                focus:ring-4
                focus:ring-[var(--primary-focus)]
              "
                        />
                    </div>
                </section>

                {/* =====================================================
            TABLE
        ====================================================== */}

                <section
                    className="
            overflow-hidden
            rounded-[var(--radius-lg)]
            border
            border-[var(--border-color)]
            bg-[var(--card-bg)]
            shadow-[var(--shadow-card)]
          "
                >
                    {/* Table Header */}
                    <div
                        className="
              flex
              flex-col
              gap-2
              border-b
              border-[var(--border-color)]
              px-5
              py-5
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-6
            "
                    >
                        <div>
                            <h2
                                className="
                  text-lg
                  font-bold
                  text-[var(--text-main)]
                "
                            >
                                {viewMode === "active" ? "قائمة العائلات النشطة" : "قائمة العائلات المحذوفة"}
                            </h2>

                            <p
                                className="
                  mt-1
                  text-sm
                  text-[var(--text-muted)]
                "
                            >
                                عدد العائلات: {families.length}
                            </p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table
                            className="
                w-full
                min-w-[850px]
                text-right
              "
                        >
                            <thead
                                className="
                  bg-[var(--primary-light)]
                "
                            >
                                <tr>
                                    <th
                                        scope="col"
                                        className="
                      px-6
                      py-4
                      text-sm
                      font-bold
                      text-[var(--text-main)]
                    "
                                    >
                                        اسم العيلة
                                    </th>

                                    <th
                                        scope="col"
                                        className="
                      px-6
                      py-4
                      text-sm
                      font-bold
                      text-[var(--text-main)]
                    "
                                    >
                                        تاريخ عضوية الكنيسة
                                    </th>

                                    <th
                                        scope="col"
                                        className="
                      px-6
                      py-4
                      text-sm
                      font-bold
                      text-[var(--text-main)]
                    "
                                    >
                                        العنوان
                                    </th>

                                    <th
                                        scope="col"
                                        className="
                      px-6
                      py-4
                      text-sm
                      font-bold
                      text-[var(--text-main)]
                    "
                                    >
                                        الأحداث
                                    </th>
                                </tr>
                            </thead>

                            <tbody
                                className="
                  divide-y
                  divide-[var(--border-color)]
                "
                            >
                                {families.map((family) => (
                                    <tr
                                        key={family.id}
                                        className="
                        transition-colors
                        hover:bg-[var(--primary-light)]/40
                      "
                                    >
                                        {/* Name */}
                                        <td className="px-6 py-5">
                                            <div
                                                className="
                            flex
                            items-center
                            gap-3
                          "
                                            >
                                                <div
                                                    className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-[var(--primary-light)]
                              font-bold
                              text-[var(--primary)]
                            "
                                                >
                                                    {family.name.charAt(0)}
                                                </div>

                                                <span
                                                    className="
                              font-semibold
                              text-[var(--text-main)]
                            "
                                                >
                                                    {family.name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Membership Date */}
                                        <td
                                            className="
                          px-6
                          py-5
                          text-sm
                          text-[var(--text-muted)]
                        "
                                        >
                                            {formatDate(family.membershipDate)}
                                        </td>

                                        {/* Address */}
                                        <td
                                            className="
                          px-6
                          py-5
                          text-sm
                          text-[var(--text-muted)]
                        "
                                        >
                                            {family.address}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* View Family Button */}
                                                {family.isArchived ? (
                                                    <button
                                                        type="button"
                                                        disabled
                                                        className="
                                flex
                                items-center
                                gap-2
                                rounded-[var(--radius-sm)]
                                border
                                border-[var(--border-color)]
                                bg-[var(--bg-page)]
                                px-4
                                py-2
                                text-sm
                                font-semibold
                                text-[var(--text-muted)]
                                opacity-50
                                cursor-not-allowed
                              "
                                                    >
                                                        عرض العيلة
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-4 w-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                                            />
                                                        </svg>
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href={`/families/${family.id}`}
                                                        className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-[var(--radius-sm)]
                                border
                                border-[var(--primary-border)]
                                bg-[var(--primary-light)]
                                px-4
                                py-2
                                text-sm
                                font-semibold
                                text-[var(--primary)]
                                transition-all
                                hover:bg-[var(--primary)]
                                hover:text-white
                              "
                                                    >
                                                        عرض العيلة
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={2}
                                                            stroke="currentColor"
                                                            className="h-4 w-4"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                                            />
                                                        </svg>
                                                    </Link>
                                                )}

                                                {/* Edit Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEditModal(family)}
                                                    className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-[var(--radius-sm)]
                            border
                            border-[var(--border-color)]
                            bg-[var(--card-bg)]
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-[var(--text-main)]
                            transition-all
                            hover:bg-[var(--primary-light)]
                            hover:text-[var(--primary)]
                          "
                                                >
                                                    تعديل
                                                </button>

                                                {/* Archive Button */}
                                                {!family.isArchived && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleArchiveFamily(family.id)}
                                                        className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-[var(--radius-sm)]
                              border
                              border-amber-200
                              bg-amber-50
                              px-4
                              py-2
                              text-sm
                              font-semibold
                              text-amber-700
                              transition-all
                              hover:bg-amber-100
                            "
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

                        {/* Empty State */}
                        {!loading && families.length === 0 && (
                            <div
                                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  px-6
                  py-16
                  text-center
                "
                            >
                                <div
                                    className="
                    mb-4
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-[var(--primary-light)]
                    text-[var(--primary)]
                  "
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.8}
                                        stroke="currentColor"
                                        className="h-7 w-7"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                                        />
                                    </svg>
                                </div>

                                <h3
                                    className="
                    font-bold
                    text-[var(--text-main)]
                  "
                                >
                                    لا توجد عائلات
                                </h3>

                                <p
                                    className="
                    mt-1
                    text-sm
                    text-[var(--text-muted)]
                  "
                                >
                                    {viewMode === "archived"
                                        ? "لا توجد عائلات مؤرشفة"
                                        : "لم يتم العثور على عيلة بهذا الاسم"}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* =========================================================
          ADD / EDIT FAMILY MODAL
      ========================================================== */}

            {isModalOpen && (
                <div
                    dir="rtl"
                    className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            px-4
            py-6
            backdrop-blur-sm
          "
                    onClick={handleCloseModal}
                >
                    <div
                        className="
              w-full
              max-w-lg
              rounded-[var(--radius-lg)]
              border
              border-[var(--border-color)]
              bg-[var(--card-bg)]
              shadow-2xl
            "
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div
                            className="
                flex
                items-center
                justify-between
                border-b
                border-[var(--border-color)]
                px-6
                py-5
              "
                        >
                            <div>
                                <h2
                                    className="
                    text-xl
                    font-bold
                    text-[var(--text-main)]
                  "
                                >
                                    {editingFamily ? "تعديل بيانات العيلة" : "إضافة عيلة"}
                                </h2>

                                <p
                                    className="
                    mt-1
                    text-sm
                    text-[var(--text-muted)]
                  "
                                >
                                    {editingFamily
                                        ? "تعديل البيانات الأساسية للعيلة"
                                        : "أضف بيانات العيلة الأساسية"}
                                </p>
                            </div>

                            {/* Close */}
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                aria-label="إغلاق"
                                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-[var(--radius-sm)]
                  text-lg
                  text-[var(--text-muted)]
                  transition-colors
                  hover:bg-[var(--primary-light)]
                  hover:text-[var(--primary)]
                "
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-5 px-6 py-6">
                            {/* Family Name */}
                            <div>
                                <label
                                    htmlFor="modal-family-name"
                                    className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[var(--text-main)]
                  "
                                >
                                    اسم العيلة
                                </label>

                                <input
                                    id="modal-family-name"
                                    type="text"
                                    value={familyName}
                                    onChange={(e) => setFamilyName(e.target.value)}
                                    placeholder="مثال: عائلة كيرلس"
                                    autoFocus
                                    className="
                    w-full
                    rounded-[var(--radius-md)]
                    border
                    border-[var(--border-color)]
                    bg-[var(--bg-page)]
                    px-4
                    py-3
                    text-sm
                    text-[var(--text-main)]
                    outline-none
                    transition-all
                    placeholder:text-[var(--text-muted)]
                    focus:border-[var(--primary)]
                    focus:ring-4
                    focus:ring-[var(--primary-focus)]
                  "
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label
                                    htmlFor="modal-family-address"
                                    className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[var(--text-main)]
                  "
                                >
                                    عنوان العيلة
                                </label>

                                <input
                                    id="modal-family-address"
                                    type="text"
                                    value={familyAddress}
                                    onChange={(e) => setFamilyAddress(e.target.value)}
                                    placeholder="مثال: خورشيد - الإسكندرية"
                                    className="
                    w-full
                    rounded-[var(--radius-md)]
                    border
                    border-[var(--border-color)]
                    bg-[var(--bg-page)]
                    px-4
                    py-3
                    text-sm
                    text-[var(--text-main)]
                    outline-none
                    transition-all
                    placeholder:text-[var(--text-muted)]
                    focus:border-[var(--primary)]
                    focus:ring-4
                    focus:ring-[var(--primary-focus)]
                  "
                                />
                            </div>

                            {/* Membership Date */}
                            <div>
                                <label
                                    htmlFor="modal-membership-date"
                                    className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[var(--text-main)]
                  "
                                >
                                    تاريخ عضوية الكنيسة
                                </label>

                                <input
                                    id="modal-membership-date"
                                    type="date"
                                    value={membershipDate}
                                    onChange={(e) => setMembershipDate(e.target.value)}
                                    className="
                    w-full
                    rounded-[var(--radius-md)]
                    border
                    border-[var(--border-color)]
                    bg-[var(--bg-page)]
                    px-4
                    py-3
                    text-sm
                    text-[var(--text-main)]
                    outline-none
                    transition-all
                    focus:border-[var(--primary)]
                    focus:ring-4
                    focus:ring-[var(--primary-focus)]
                  "
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div
                            className="
                flex
                flex-col-reverse
                gap-3
                border-t
                border-[var(--border-color)]
                p-6
                sm:flex-row
              "
                        >
                            {/* Cancel */}
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="
                  flex-1
                  rounded-[var(--radius-md)]
                  border
                  border-[var(--border-color)]
                  bg-[var(--card-bg)]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-[var(--text-main)]
                  transition-all
                  hover:bg-[var(--primary-light)]
                "
                            >
                                إلغاء
                            </button>

                            {/* Save */}
                            <button
                                type="button"
                                onClick={handleSaveFamily}
                                disabled={
                                    !familyName.trim() ||
                                    !familyAddress.trim() ||
                                    !membershipDate ||
                                    isSubmitting
                                }
                                className="
                  flex-1
                  rounded-[var(--radius-md)]
                  bg-[var(--primary)]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition-all
                  hover:bg-[var(--primary-hover)]
                  focus:outline-none
                  focus:ring-4
                  focus:ring-[var(--primary-focus)]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                            >
                                {isSubmitting ? "جاري الحفظ..." : "حفظ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
