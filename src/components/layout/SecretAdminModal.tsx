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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const ok = await verifyAdminPasskey(pin);
      if (ok) {
        localStorage.setItem("apparrel_admin_auth", "true");
        localStorage.setItem("apparrel_admin_token", "adm_" + Date.now());
        success("Access Granted", "Welcome to the Secret Inventory & Restock Portal.");
        onClose();
        navigate("/secret-admin");
      } else {
        setErrorMsg("Invalid secret PIN. Please check .env ADMIN_SECRET_KEY");
        error("Access Denied", "Incorrect Admin Passkey");
      }
    } catch {
      setErrorMsg("Verification request failed");
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
            Restricted area for store managers to restock inventory & dispatch orders
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                placeholder="Default: apparrel2026 or 1234"
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
              Tip: You can change the master PIN in your <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.env</code> file under <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">ADMIN_SECRET_KEY</code>.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("apparrel_admin_auth", "true");
                localStorage.setItem("apparrel_admin_token", "adm_" + Date.now());
                success("Access Granted", "Admin session unlocked.");
                onClose();
                navigate("/admin");
              }}
              className="px-3 py-2 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              ⚡ Quick Unlock (Demo)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !pin}
                className="btn-primary text-xs py-2 px-4 rounded-xl disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Enter Portal"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
