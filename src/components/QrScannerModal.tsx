"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";

// Dynamic import with SSR disabled to avoid camera/navigator issues during SSR
const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "280px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          background: "rgba(0,0,0,0.5)",
          borderRadius: "14px",
          color: "#94A3B8",
          fontSize: "13px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.1)",
            borderTopColor: "var(--theme-color, #10B981)",
            animation: "spin-slow 1s linear infinite",
          }}
        />
        <span>Initializing camera stream…</span>
      </div>
    ),
  }
);

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
  title?: string;
  subtitle?: string;
  themeColor?: string;
  themeRgb?: string;
}

export default function QrScannerModal({
  isOpen,
  onClose,
  onScan,
  title = "QR / RFID Scanner",
  subtitle = "Align runner QR code within the viewfinder to scan",
  themeColor = "#10B981",
  themeRgb = "16,185,129",
}: QrScannerModalProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isSuccessFlash, setIsSuccessFlash] = useState(false);
  const [paused, setPaused] = useState(false);

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setLastScanned(null);
      setIsSuccessFlash(false);
      setPaused(false);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDetected = (detectedCodes: IDetectedBarcode[]) => {
    if (!detectedCodes || detectedCodes.length === 0) return;
    const rawVal = detectedCodes[0]?.rawValue?.trim();
    if (!rawVal) return;

    setLastScanned(rawVal);
    setIsSuccessFlash(true);
    setPaused(true);

    // Provide quick audio/haptic feedback if supported
    try {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(100);
      }
    } catch {}

    // Call user callback
    onScan(rawVal);

    // Auto resume or reset flash after short delay
    setTimeout(() => {
      setIsSuccessFlash(false);
      setPaused(false);
    }, 1800);
  };

  const handleError = (error: unknown) => {
    console.warn("QR Scanner error:", error);
    const msg =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unable to access camera. Please verify camera permissions.";
    setErrorMsg(msg);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(6,5,12,0.82)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-slide-up"
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "rgba(13,12,24,0.95)",
          border: `1px solid rgba(${themeRgb},0.28)`,
          borderRadius: "20px",
          boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 35px rgba(${themeRgb},0.15)`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Top Glow Accent Bar */}
        <div
          style={{
            height: "3px",
            background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)`,
          }}
        />

        {/* Modal Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: `rgba(${themeRgb},0.15)`,
                border: `1px solid rgba(${themeRgb},0.35)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              📷
            </div>
            <div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#fff",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </h3>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0" }}>
                {subtitle}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close Scanner Modal"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94A3B8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.15)";
              e.currentTarget.style.color = "#EF4444";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "#94A3B8";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body / Camera Scanner Viewport */}
        <div style={{ padding: "20px" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1/1",
              maxWidth: "380px",
              margin: "0 auto",
              borderRadius: "16px",
              overflow: "hidden",
              background: "#000",
              border: `2px solid ${
                isSuccessFlash ? themeColor : `rgba(${themeRgb},0.35)`
              }`,
              boxShadow: isSuccessFlash
                ? `0 0 30px ${themeColor}`
                : `0 0 20px rgba(0,0,0,0.5)`,
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          >
            <Scanner
              onScan={handleDetected}
              onError={handleError}
              paused={paused}
              styles={{
                container: {
                  width: "100%",
                  height: "100%",
                  borderRadius: "14px",
                },
                video: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                },
              }}
              components={{
                finder: true,
                torch: true,
                zoom: true,
              }}
            />

            {/* Scanning Laser Animation Overlay */}
            {!paused && !errorMsg && (
              <div
                style={{
                  position: "absolute",
                  left: "10%",
                  right: "10%",
                  height: "2px",
                  background: `linear-gradient(90deg, transparent, ${themeColor}, #fff, ${themeColor}, transparent)`,
                  boxShadow: `0 0 12px ${themeColor}, 0 0 20px ${themeColor}`,
                  animation: "float 2s ease-in-out infinite",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Success flash overlay */}
            {isSuccessFlash && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `rgba(${themeRgb},0.3)`,
                  backdropFilter: "blur(2px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  zIndex: 10,
                  animation: "slide-up 0.2s ease-out",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: themeColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    color: "#000",
                    fontWeight: "bold",
                    boxShadow: `0 0 20px ${themeColor}`,
                  }}
                >
                  ✓
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "#fff",
                    textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                  }}
                >
                  QR Code Detected!
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: themeColor,
                    background: "rgba(0,0,0,0.6)",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                  }}
                >
                  {lastScanned}
                </div>
              </div>
            )}
          </div>

          {/* Error Message if camera failed */}
          {errorMsg && (
            <div
              style={{
                marginTop: "14px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
                fontSize: "12px",
                color: "#F87171",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>⚠️</span>
              <span style={{ flex: 1 }}>{errorMsg}</span>
            </div>
          )}

          {/* Scanned result indicator */}
          {lastScanned && !isSuccessFlash && (
            <div
              style={{
                marginTop: "14px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: `rgba(${themeRgb},0.08)`,
                border: `1px solid rgba(${themeRgb},0.25)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Last Scanned Code
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: themeColor,
                    fontFamily: "monospace",
                    marginTop: "2px",
                  }}
                >
                  {lastScanned}
                </div>
              </div>
              <button
                onClick={() => {
                  setLastScanned(null);
                  setPaused(false);
                }}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  background: `rgba(${themeRgb},0.15)`,
                  border: `1px solid rgba(${themeRgb},0.3)`,
                  color: themeColor,
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Scan Next
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "14px 20px",
            background: "rgba(0,0,0,0.25)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "11px", color: "#475569" }}>
            Press <kbd style={{ padding: "2px 5px", borderRadius: "4px", background: "rgba(255,255,255,0.08)", color: "#94A3B8" }}>ESC</kbd> to exit
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: `rgba(${themeRgb},0.18)`,
                border: `1px solid rgba(${themeRgb},0.35)`,
                color: themeColor,
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Done Scanning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
