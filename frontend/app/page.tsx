import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Verification dashboard</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
              Seller and admin flows for document verification.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Choose a side to manage documents, upload verification files as a seller, or review and update document status as an admin.
            </p>
          </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/seller"
            className="rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-slate-500">Seller</p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">Upload and track documents</h2>
            <p className="mt-3 text-slate-600">
              Upload a document URL for verification and view the status of your documents by seller ID.
            </p>
          </Link>

          <Link
            href="/admin"
            className="rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-slate-500">Admin</p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">Review and change status</h2>
            <p className="mt-3 text-slate-600">
              View all uploaded documents, inspect their verification status, and update status directly.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
