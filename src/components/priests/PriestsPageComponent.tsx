"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    archivePriest,
    checkPriestNationalIdExists,
    createPriest,
    getPriests,
    PriestData,
    updatePriest,
} from "@/lib/priests/priests";

export default function PriestsPage() {
    const [viewMode, setViewMode] = useState<"active" | "archived">("active");
    const [priests, setPriests] = useState<PriestData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [search, setSearch] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPriest, setEditingPriest] = useState<PriestData | null>(null);

    const [name, setName] = useState("");
    const [nationalId, setNationalId] = useState("");
    const [ordinationDate, setOrdinationDate] = useState("");
    const [archpriestDate, setArchpriestDate] = useState("");
    const [deathDate, setDeathDate] = useState("");
    const [address, setAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isDuplicateNationalId, setIsDuplicateNationalId] = useState(false);

    /*
      |--------------------------------------------------------------------------
      | Fetch Priests
      |--------------------------------------------------------------------------
      */
    const loadPriests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getPriests({
                isArchived: viewMode === "archived",
                search,
            });
            setPriests(data);
        } catch (error) {
            console.error("Error loading priests:", error);
        } finally {
            setLoading(false);
        }
    }, [viewMode, search]);

    useEffect(() => {
        loadPriests();
    }, [loadPriests]);

    /*
      |--------------------------------------------------------------------------
      | National ID Duplicate Check
      |--------------------------------------------------------------------------
      */
    useEffect(() => {
        const trimmedNationalId = nationalId.trim();
        if (trimmedNationalId.length === 14) {
            let active = true;
            checkPriestNationalIdExists(trimmedNationalId, editingPriest?.id)
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
    }, [nationalId, editingPriest?.id]);

    const nationalIdError = useMemo(() => {
        const trimmed = nationalId.trim();
        if (trimmed !== "" && trimmed.length !== 14) {
            return "الرقم القومي يجب أن يتكون من 14 رقم";
        }
        if (trimmed.length === 14 && isDuplicateNationalId) {
            return "الرقم القومي موجود بالفعل";
        }
        return "";
    }, [nationalId, isDuplicateNationalId]);

    /*
      |--------------------------------------------------------------------------
      | Open Add Modal
      |--------------------------------------------------------------------------
      */
    const handleOpenAddModal = () => {
        setEditingPriest(null);
        setName("");
        setNationalId("");
        setOrdinationDate("");
        setArchpriestDate("");
        setDeathDate("");
        setAddress("");
        setIsDuplicateNationalId(false);
        setIsModalOpen(true);
    };

    /*
      |--------------------------------------------------------------------------
      | Open Edit Modal
      |--------------------------------------------------------------------------
      */
    const handleOpenEditModal = (priest: PriestData) => {
        setEditingPriest(priest);
        setName(priest.name);
        setNationalId(priest.nationalId);
        setOrdinationDate(priest.ordinationDate);
        setArchpriestDate(priest.archpriestDate || "");
        setDeathDate(priest.deathDate || "");
        setAddress(priest.address);
        setIsDuplicateNationalId(false);
        setIsModalOpen(true);
    };

    /*
      |--------------------------------------------------------------------------
      | Close Modal
      |--------------------------------------------------------------------------
      */
    const closeModal = () => {
        setEditingPriest(null);
        setName("");
        setNationalId("");
        setOrdinationDate("");
        setArchpriestDate("");
        setDeathDate("");
        setAddress("");
        setIsDuplicateNationalId(false);
        setIsModalOpen(false);
    };

    /*
      |--------------------------------------------------------------------------
      | Save Priest (Add or Edit)
      |--------------------------------------------------------------------------
      */
    const handleSavePriest = async () => {
        const trimmedName = name.trim();
        const trimmedAddress = address.trim();
        const trimmedNationalId = nationalId.trim();

        if (
            !trimmedName ||
            !trimmedAddress ||
            !trimmedNationalId ||
            !ordinationDate ||
            trimmedNationalId.length !== 14 ||
            isDuplicateNationalId ||
            isSubmitting
        ) {
            return;
        }

        const isDup = await checkPriestNationalIdExists(
            trimmedNationalId,
            editingPriest?.id
        );
        if (isDup) {
            setIsDuplicateNationalId(true);
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingPriest) {
                await updatePriest(editingPriest.id, {
                    name: trimmedName,
                    nationalId: trimmedNationalId,
                    ordinationDate,
                    archpriestDate: archpriestDate || undefined,
                    deathDate: deathDate || undefined,
                    address: trimmedAddress,
                });
            } else {
                await createPriest({
                    name: trimmedName,
                    nationalId: trimmedNationalId,
                    ordinationDate,
                    archpriestDate: archpriestDate || undefined,
                    deathDate: deathDate || undefined,
                    address: trimmedAddress,
                });
            }
            closeModal();
            await loadPriests();
        } catch (error) {
            console.error("Error saving priest:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    /*
      |--------------------------------------------------------------------------
      | Archive Priest
      |--------------------------------------------------------------------------
      */
    const handleArchivePriest = async (id: string) => {
        try {
            await archivePriest(id);
            await loadPriests();
        } catch (error) {
            console.error("Error archiving priest:", error);
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
                            <div className="mb-2 flex items-center gap-3">
                                <div
                                    className="
                    flex
                    h-11
                    w-11
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
                                        className="h-6 w-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
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
                                    الآباء الكهنة
                                </h1>
                            </div>

                            <p
                                className="
                  text-sm
                  text-[var(--text-muted)]
                "
                            >
                                إدارة بيانات الآباء الكهنة
                            </p>
                        </div>

                        {/* View Switch & Add Button */}
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
                                الآباء النشطة
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
                                عرض الآباء المحذوفة
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
                    w-full sm:w-fit
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
                                إضافة أب كاهن
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
                        htmlFor="priest-search"
                        className="
              mb-2
              block
              text-sm
              font-semibold
              text-[var(--text-main)]
            "
                    >
                        البحث في الآباء الكهنة
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
                            id="priest-search"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث باسم الأب الكاهن..."
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
                                {viewMode === "active" ? "قائمة الآباء النشطة" : "قائمة الآباء المحذوفة"}
                            </h2>

                            <p
                                className="
                  mt-1
                  text-sm
                  text-[var(--text-muted)]
                "
                            >
                                عدد الآباء: {priests.length}
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
                                        اسم الأب الكاهن
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
                                        الرقم القومي
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
                                        تاريخ الرسامة
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
                                {priests.map((priest) => (
                                    <tr
                                        key={priest.id}
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
                                                    {priest.name.charAt(0)}
                                                </div>

                                                <span
                                                    className="
                              font-semibold
                              text-[var(--text-main)]
                            "
                                                >
                                                    {priest.name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* National ID */}
                                        <td
                                            className="
                          px-6
                          py-5
                          text-sm
                          text-[var(--text-muted)]
                        "
                                        >
                                            {priest.nationalId}
                                        </td>

                                        {/* Ordination Date */}
                                        <td
                                            className="
                          px-6
                          py-5
                          text-sm
                          text-[var(--text-muted)]
                        "
                                        >
                                            {formatDate(priest.ordinationDate)}
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
                                            {priest.address}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* View Priest Family Button */}
                                                {priest.isArchived ? (
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
                                                        عرض عيلة الكاهن
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
                                                        href={`/priests/${priest.id}`}
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
                                                        عرض عيلة الكاهن
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
                                                    onClick={() => handleOpenEditModal(priest)}
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
                                                {!priest.isArchived && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleArchivePriest(priest.id)}
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
                        {!loading && priests.length === 0 && (
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
                                    لا يوجد آباء كهنة
                                </h3>

                                <p
                                    className="
                    mt-1
                    text-sm
                    text-[var(--text-muted)]
                  "
                                >
                                    {viewMode === "archived"
                                        ? "لا يوجد آباء مؤرشفين"
                                        : "لم يتم العثور على أب كاهن بهذا الاسم"}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* =========================================================
          ADD / EDIT PRIEST MODAL
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
            backdrop-blur-sm
          "
                    onClick={closeModal}
                >
                    <div
                        className="
              max-h-[90vh]
              w-full
              max-w-lg
              overflow-y-auto
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
                sticky
                top-0
                z-10
                flex
                items-center
                justify-between
                border-b
                border-[var(--border-color)]
                bg-[var(--card-bg)]
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
                                    {editingPriest ? "تعديل بيانات الأب الكاهن" : "إضافة أب كاهن"}
                                </h2>

                                <p
                                    className="
                    mt-1
                    text-sm
                    text-[var(--text-muted)]
                  "
                                >
                                    {editingPriest
                                        ? "تعديل البيانات الأساسية للأب الكاهن"
                                        : "أضف بيانات الأب الكاهن الجديد"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-[var(--radius-sm)]
                  text-2xl
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
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="priest-name"
                                    className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[var(--text-main)]
                  "
                                >
                                    اسم الأب الكاهن
                                </label>

                                <input
                                    id="priest-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="مثال: القمص بيشوي كامل"
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

                            {/* National ID */}
                            <div>
                                <label
                                    htmlFor="priest-national-id"
                                    className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[var(--text-main)]
                  "
                                >
                                    الرقم القومي
                                </label>

                                <input
                                    id="priest-national-id"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={14}
                                    value={nationalId}
                                    onChange={(e) => setNationalId(e.target.value.replace(/\D/g, "").slice(0, 14))}
                                    placeholder="14 رقم"
                                    className={`
                    w-full
                    rounded-[var(--radius-md)]
                    border
                    ${nationalIdError ? "border-red-500" : "border-[var(--border-color)]"}
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
                  `}
                                />

                                {nationalIdError && (
                                    <p className="mt-1.5 text-xs font-semibold text-red-500">
                                        {nationalIdError}
                                    </p>
                                )}
                            </div>

                            {/* Ordination Date */}
                            <div>
                                <label
                                    htmlFor="priest-ordination-date"
                                    className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[var(--text-main)]
                  "
                                >
                                    تاريخ الرسامة
                                </label>

                                <input
                                    id="priest-ordination-date"
                                    type="date"
                                    value={ordinationDate}
                                    onChange={(e) => setOrdinationDate(e.target.value)}
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

                            {/* Archpriest Date */}
                            <div>
                                <label
                                    htmlFor="priest-archpriest-date"
                                    className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[var(--text-main)]
                  "
                                >
                                    تاريخ القمسية
                                </label>

                                <input
                                    id="priest-archpriest-date"
                                    type="date"
                                    value={archpriestDate}
                                    onChange={(e) => setArchpriestDate(e.target.value)}
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

                            {/* Death Date */}
                            <div>
                                <label
                                    htmlFor="priest-death-date"
                                    className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[var(--text-main)]
                  "
                                >
                                    تاريخ النياحة
                                </label>

                                <input
                                    id="priest-death-date"
                                    type="date"
                                    value={deathDate}
                                    onChange={(e) => setDeathDate(e.target.value)}
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

                            {/* Address */}
                            <div>
                                <label
                                    htmlFor="priest-address"
                                    className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[var(--text-main)]
                  "
                                >
                                    العنوان
                                </label>

                                <input
                                    id="priest-address"
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
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
                                onClick={closeModal}
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
                                onClick={handleSavePriest}
                                disabled={
                                    !name.trim() ||
                                    !address.trim() ||
                                    !nationalId.trim() ||
                                    nationalId.trim().length !== 14 ||
                                    !ordinationDate ||
                                    isDuplicateNationalId ||
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
