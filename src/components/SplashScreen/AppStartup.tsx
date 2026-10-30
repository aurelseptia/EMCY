import { useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../../services/firebase";
import SplashScreen from "./SplashScreen";

type AppStartupProps = {
  children: ReactNode;
};

export default function AppStartup({ children }: AppStartupProps) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let authReady = false;
    let minimumElapsed = false;

    setReady(false);
    setError(null);

    const finishIfReady = () => {
      if (active && authReady && minimumElapsed) {
        setError(null);
        setReady(true);
      }
    };

    // Durasi minimum hanya untuk transisi visual.
    const minimumTimer = window.setTimeout(() => {
      minimumElapsed = true;
      finishIfReady();
    }, 1000);

    const timeoutTimer = window.setTimeout(() => {
      if (active && !authReady) {
        setError(
          "Aplikasi belum selesai disiapkan. Silakan coba lagi."
        );
      }
    }, 15000);

    const unsubscribe = onAuthStateChanged(
      auth,
      () => {
        if (!active) return;

        authReady = true;
        window.clearTimeout(timeoutTimer);
        finishIfReady();
      },
      () => {
        if (!active) return;

        window.clearTimeout(timeoutTimer);
        setError(
          "Gagal memeriksa sesi akun. Silakan coba lagi."
        );
      }
    );

    return () => {
      active = false;
      window.clearTimeout(minimumTimer);
      window.clearTimeout(timeoutTimer);
      unsubscribe();
    };
  }, [attempt]);

  if (!ready) {
    return (
      <SplashScreen
        error={error}
        onRetry={() => setAttempt((value) => value + 1)}
      />
    );
  }

  return <>{children}</>;
}