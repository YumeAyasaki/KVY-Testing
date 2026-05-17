"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const STATUS_OPTIONS = [
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

export default function AdminPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  async function loadDocuments() {
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
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  function handleStatusChange(id: string, newStatus: string) {
    setDocuments((current) =>
      current.map((doc) => (doc.id === id ? { ...doc, status: newStatus } : doc)),
    );
  }

  async function updateDocumentStatus(document: Document) {
    setError("");
    setMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/documents/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ document: { id: document.id, status: document.status } }),
      });
      if (!response.ok) {
        throw new Error("Unable to update document status");
      }
      setMessage(`Status updated for document ${document.id}`);
      await loadDocuments();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Admin panel</p>
              <h1 className="mt-3 text-3xl font-semibold">Document verification review</h1>
              <p className="mt-2 text-slate-600">
                View every uploaded document and change the status of documents as needed.
              </p>
            </div>
            <Link href="/" className="text-slate-700 hover:text-slate-900">
              Back to home
            </Link>
          </div>
        </header>

        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">All documents</h2>
              <p className="text-slate-600">Review documents and click a status button to apply a new state.</p>
            </div>
            <button
              type="button"
              onClick={loadDocuments}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Refresh list
            </button>
          </div>

          {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-left text-sm uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Seller ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      Loading documents...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      No documents found.
                    </td>
                  </tr>
                ) : (
                  documents.map((document) => (
                    <tr key={document.id}>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{document.id}</div>
                        <div className="mt-1 text-xs text-slate-500">{document.fileUrl}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{document.sellerId}</td>
                      <td className="px-4 py-4">
                        <select
                          value={document.status}
                          onChange={(event) => handleStatusChange(document.id, event.target.value)}
                          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {new Date(document.updatedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => updateDocumentStatus(document)}
                          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
