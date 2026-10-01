import React, { useState } from "react";
import { Lock, KeyRound, ShieldAlert, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { verifyAdminPasskey } from "../../lib/api";

interface SecretAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SecretAdminModal({ isOpen, onClose }: SecretAdminModalProps) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { success, error } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent, bypassPin?: string) => {
    if (e) e.preventDefault();
    const pinToUse = (bypassPin || pin).trim();
    if (!pinToUse) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await verifyAdminPasskey(pinToUse);
      if (res.authorized && res.token) {
        localStorage.setItem("apparrel_admin_auth", "true");
        localStorage.setItem("apparrel_admin_token", res.token);
        success("Access Granted", "Welcome to the Inventory & Operations Portal.");
        onClose();
        navigate("/admin");
      } else {
        setErrorMsg("Invalid secret PIN. Please check your administrator passkey.");
        error("Access Denied", "Incorrect Admin Passkey");
      }
    } catch {
      setErrorMsg("Verification request failed. Server unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top bar */}
        <div className="bg-slate-900 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 border border-slate-700 mb-3 text-amber-400 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-heading">Restock & Admin Portal</h3>
          <p className="text-xs text-slate-400 mt-1">
            Restricted area for store managers to restock inventory & fulfill orders
          </p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Enter Secret Passkey / PIN
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter Administrator Passkey"
                autoFocus
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-mono"
              />
            </div>
            {errorMsg && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-600 font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-2">
              Configured via <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">ADMIN_SECRET_KEY</code> in your environment.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !pin}
              className="btn-primary text-xs py-2.5 px-5 rounded-xl disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? "Authenticating..." : "Enter Portal"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
