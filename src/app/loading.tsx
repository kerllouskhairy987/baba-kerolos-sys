export default function Loading() {
    return (
        <div className="global-loading" role="status" aria-live="polite" aria-label="جاري التحميل">
            <div className="global-loading__indicator" aria-hidden="true" />
        </div>
    );
}
