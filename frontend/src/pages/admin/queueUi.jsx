import React, { useCallback, useEffect, useRef, useState } from "react";
import { AuthError, POLL_MS } from "./queueApi";

/* ---------- polling: runs even in background tabs, no overlap, abortable, backs off on errors ---------- */
export function usePolling(task, { intervalMs = POLL_MS, onAuthError } = {}) {
    const taskRef = useRef(task);
    taskRef.current = task;
    const authRef = useRef(onAuthError);
    authRef.current = onAuthError;

    const seq = useRef(0);
    const inFlight = useRef(false);
    const failures = useRef(0);
    const timer = useRef(null);
    const stopped = useRef(false);
    const controller = useRef(null);

    const run = useCallback(async () => {
        if (inFlight.current) return;
        const id = ++seq.current;
        inFlight.current = true;
        controller.current = new AbortController();
        try {
            await taskRef.current(controller.current.signal);
            failures.current = 0;
        } catch (e) {
            if (e?.name === "AbortError") return;
            if (e instanceof AuthError) {
                stopped.current = true;
                authRef.current?.(e);
                return;
            }
            failures.current += 1;
        } finally {
            if (seq.current === id) inFlight.current = false;
        }
    }, []);

    const refresh = useCallback(() => {
        controller.current?.abort();
        inFlight.current = false;
        return run();
    }, [run]);

    useEffect(() => {
        stopped.current = false;
        let cancelled = false;

        const loop = async () => {
            timer.current = null;
            if (cancelled || stopped.current) return;
            await run();
            if (cancelled || stopped.current) return;
            const delay = Math.min(intervalMs * 2 ** failures.current, 60000);
            timer.current = setTimeout(loop, delay);
        };

        const onVisible = () => {
            if (!document.hidden && timer.current) {
                clearTimeout(timer.current);
                loop();
            }
        };

        loop();
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            cancelled = true;
            clearTimeout(timer.current);
            controller.current?.abort();
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [run, intervalMs]);

    return refresh;
}

/* ---------- timeouts that are cleaned up on unmount ---------- */
export function useLater() {
    const ids = useRef(new Set());
    useEffect(() => {
        const set = ids.current;
        return () => set.forEach(clearTimeout);
    }, []);
    return useCallback((fn, ms) => {
        const id = setTimeout(() => {
            ids.current.delete(id);
            fn();
        }, ms);
        ids.current.add(id);
    }, []);
}

/* ---------- in-flight guard per key (prevents double submits) ---------- */
export function useBusy() {
    const ref = useRef(new Set());
    const [, setTick] = useState(0);
    const run = useCallback(async (key, fn) => {
        if (ref.current.has(key)) return undefined;
        ref.current.add(key);
        setTick((t) => t + 1);
        try {
            return await fn();
        } finally {
            ref.current.delete(key);
            setTick((t) => t + 1);
        }
    }, []);
    const isBusy = (key) => ref.current.has(key);
    return { run, isBusy };
}

/* ---------- alert sound: one shared AudioContext, unlocked by a user gesture ---------- */
let audioCtx = null;

export function isAudioUnlocked() {
    return Boolean(audioCtx && audioCtx.state === "running");
}

export async function unlockAudio() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return false;
        if (!audioCtx) audioCtx = new Ctx();
        if (audioCtx.state === "suspended") await audioCtx.resume();
        return audioCtx.state === "running";
    } catch {
        return false;
    }
}

export function playAlert(kind = "order") {
    try {
        if (!audioCtx || audioCtx.state !== "running") return;
        const now = audioCtx.currentTime;
        const tones = kind === "reservation" ? [660, 880] : [880];
        tones.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            const start = now + i * 0.16;
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
            osc.start(start);
            osc.stop(start + 0.15);
        });
    } catch {
        /* sound is optional */
    }
}

/* ---------- accessible modal ---------- */
export function Modal({ label, onClose, children, widthClass = "max-w-md" }) {
    const panelRef = useRef(null);
    const closeRef = useRef(onClose);
    closeRef.current = onClose;

    useEffect(() => {
        const previous = document.activeElement;
        const panel = panelRef.current;
        const focusables = () =>
            panel.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

        focusables()[0]?.focus();

        const onKey = (e) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                closeRef.current();
            } else if (e.key === "Tab") {
                const items = focusables();
                if (!items.length) return;
                const first = items[0];
                const last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("keydown", onKey);
            previous?.focus?.();
        };
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={label}
                className={`bg-white rounded-[2rem] shadow-2xl w-full ${widthClass} overflow-hidden`}
            >
                {children}
            </div>
        </div>
    );
}

/* ---------- promise-based confirm dialog ---------- */
export function useConfirm() {
    const [state, setState] = useState(null);

    const confirm = useCallback(
        (message, confirmLabel = "Yes, cancel") =>
            new Promise((resolve) => setState({ message, confirmLabel, resolve })),
        []
    );

    const close = (value) => {
        state?.resolve(value);
        setState(null);
    };

    const dialog = state && (
        <Modal label="Confirm" onClose={() => close(false)} widthClass="max-w-sm">
            <div className="p-8">
                <p className="text-[#2C3E2D] font-semibold mb-6">{state.message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={() => close(false)}
                        className="flex-1 bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-semibold transition-all"
                    >
                        Keep it
                    </button>
                    <button
                        onClick={() => close(true)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all"
                    >
                        {state.confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );

    return [confirm, dialog];
}