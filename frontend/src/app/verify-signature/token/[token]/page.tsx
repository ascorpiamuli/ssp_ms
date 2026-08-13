"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useSignature } from "@/hooks/useSignature";

import Image from "next/image";
import Link from "next/link";

export default function VerifySignatureByTokenPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  console.log("📄 [VerifyPage] Component rendered", { token });

  const { mutateAsync: verifyByToken, isPending } = useSignature().verifyByToken;

  const [localError, setLocalError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);
  const [isDataReady, setIsDataReady] = useState<boolean>(false); // NEW: Guard state

  // useRef to hold data persistently across re-renders
  const dataRef = useRef<any>(null);

  useEffect(() => {
    if (!token) {
      setLocalError("Invalid verification link.");
      setIsDataReady(true); // Mark as ready so Error screen shows
      return;
    }

    // Prevent double-firing in React Strict Mode
    if (dataRef.current) return;

    const verifyToken = async () => {
      try {
        console.log("📄 [VerifyPage] Calling API...");
        const response = await verifyByToken({ token });

        console.log("📄 [VerifyPage] API Response received:", response);

        // Store in both state AND ref for persistence
        dataRef.current = response;
        setSuccessData(response);


      } catch (err: any) {
        console.error("❌ [VerifyPage] API Error:", err);
        const message = err?.response?.data?.message || "Failed to verify signature.";
        setLocalError(message);
      } finally {
        // CRITICAL: Mark data as ready AFTER state updates are complete
        // This stops the "flash of error"
        setIsDataReady(true);
      }
    };

    verifyToken();
  }, [token, verifyByToken]);

  // Use the ref as the primary source of truth, fallback to state
  const displayData = dataRef.current || successData;

  console.log("📄 [VerifyPage] Current State:", {
    isPending,
    isDataReady,
    hasSuccessData: !!successData,
    hasRefData: !!dataRef.current,
    localError,
    token
  });

  // ==========================================
  // 1. LOADING STATE (Shows while API is calling)
  // ==========================================
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Verifying Signature...</h2>
          <p className="text-gray-500 mt-2">Please wait while we validate the token.</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. WAIT STATE (Crucial Fix!)
  // If the API finished but React hasn't updated state yet, show a spinner
  // ==========================================
  if (!isDataReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Data...</h2>
          <p className="text-gray-500 mt-2">Finalizing verification details.</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. ERROR STATE
  // Only renders if we have a specific localError
  // ==========================================
  if (localError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{localError}</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. SUCCESS STATE
  // Only renders if data exists and no errors
  // ==========================================
  const specimen = displayData?.specimen;
  const qrCodeImage = displayData?.qr_code?.image;

  console.log("📄 [VerifyPage] Rendering Success State", {
    hasSpecimen: !!specimen,
    hasQR: !!qrCodeImage,
    specimenId: specimen?.id
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Success Banner */}
        <div className="bg-green-600 px-6 py-4 flex items-center gap-3">
          <div className="bg-white rounded-full p-1">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Signature Verified Successfully</h1>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: QR Code & Details */}
            <div className="md:col-span-2 space-y-4">
              <div className="border-b pb-3">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Signed By</h2>
                <p className="text-lg font-semibold text-gray-900">
                  {specimen?.user?.full_name || "Unknown User"}
                </p>
                <p className="text-sm text-gray-600">{specimen?.user?.email || "No email provided"}</p>
              </div>

              <div className="border-b pb-3">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Role</h2>
                <p className="text-gray-900">
                  {specimen?.user?.role_label || specimen?.user?.role || "Unknown Role"}
                </p>
              </div>

              <div className="border-b pb-3">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Document Reference</h2>
                <p className="text-gray-900 font-mono">{specimen?.document_reference || "N/A"}</p>
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Verified At</h2>
                <p className="text-gray-900">
                  {specimen?.verified_at
                    ? new Date(specimen.verified_at).toLocaleString("en-US", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Right Column: Signature Image & QR */}
            <div className="flex flex-col items-center justify-start space-y-4 pt-2 md:pt-0">
              {specimen?.signature_image_url && (
                <div className="border rounded-lg p-2 bg-gray-50">
                  <h3 className="text-xs text-center text-gray-500 mb-2 uppercase tracking-wider">Signature</h3>
                  <Image
                    src={specimen.signature_image_url}
                    alt="Signature"
                    width={200}
                    height={100}
                    className="object-contain max-h-24"
                  />
                </div>
              )}

              {qrCodeImage && (
                <div className="border rounded-lg p-2 bg-gray-50 mt-2">
                  <h3 className="text-xs text-center text-gray-500 mb-2 uppercase tracking-wider">QR Code</h3>
                  <Image
                    src={qrCodeImage}
                    alt="QR Code"
                    width={120}
                    height={120}
                    className="object-contain rounded"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t flex justify-between items-center">
            <p className="text-xs text-gray-400">
              Token: <span className="font-mono">{token.substring(0, 12)}...</span>
            </p>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
