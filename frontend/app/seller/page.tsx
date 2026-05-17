"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const STATUSES = [
  "PENDING_UPLOAD",
  "SUBMITTED",
  "PENDING_VERIFICATION",
  "APPROVED",
  "REJECTED",
  "INCONCLUSIVE",
] as const;

type Document = {
  id: string;
  sellerId: string;
  fileUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function SellerPage() {
  const [sellerId, setSellerId] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const filteredDocuments = sellerId
    ? documents.filter((doc) => doc.sellerId === sellerId.trim())
    : [];

  async function loadDocuments() {
    if (!sellerId.trim()) {
      setError("Enter a seller ID to load your documents.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/documents/all`);
      if (!response.ok) {
        throw new Error("Unable to load documents");
      }
      const data = await response.json();
      setDocuments(data.documents ?? []);
      setMessage("Documents loaded.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!sellerId.trim() || !documentFile) {
      setError("Seller ID and document file are required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("sellerId", sellerId.trim());
      formData.append("document", documentFile);

      const response = await fetch(`${API_BASE_URL}/admin/documents/add`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setMessage("Document uploaded for verification. Refresh to see it in your list.");
      setDocumentFile(null);
      await loadDocuments();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    if (!sellerId.trim()) {
      setDocuments([]);
    }
  }, [sellerId]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold">Seller Verification</h1>
            <p className="text-slate-600">
              Upload a verification document URL and check your documents by seller ID.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Current flow</p>
              <p className="text-base text-slate-700">Seller side only, no selling flow included.</p>
            </div>
            <Link href="/" className="text-slate-700 hover:text-slate-900">
              Back to home
            </Link>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold">Upload document</h2>
            <p className="mt-2 text-slate-600">Provide your seller ID and a file to submit for verification.</p>
            <form className="mt-6 space-y-5" onSubmit={handleUpload}>
              <label className="block space-y-2 text-sm text-slate-700">
                <span>Seller ID</span>
                <input
                  value={sellerId}
                  onChange={(event) => setSellerId(event.target.value)}
                  placeholder="Enter seller ID"
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-500"
                />
              </label>
              <label className="block space-y-2 text-sm text-slate-700">
                <span>Document file</span>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-500"
                />
                {documentFile ? (
                  <p className="text-xs text-slate-500">Selected: {documentFile.name}</p>
                ) : null}
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Upload for verification
              </button>
            </form>
            {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
            {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Your documents</h2>
                <p className="mt-2 text-slate-600">Load documents for the seller ID you provided above.</p>
              </div>
              <button
                type="button"
                onClick={loadDocuments}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Load my documents
              </button>
            </div>
            <div className="mt-6 space-y-4">
              {loading ? (
                <p className="text-slate-600">Loading documents...</p>
              ) : filteredDocuments.length === 0 ? (
                <p className="text-slate-600">No documents available for this seller ID yet.</p>
              ) : (
                filteredDocuments.map((document) => (
                  <div key={document.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Document ID: {document.id}</p>
                    <p className="mt-2 text-base font-medium text-slate-900">Status: {document.status}</p>
                    <p className="mt-2 text-sm text-slate-700">URL: {document.fileUrl}</p>
                    <p className="mt-2 text-sm text-slate-500">Created: {new Date(document.createdAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
