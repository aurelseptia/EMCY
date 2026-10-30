import "./SplashScreen.css";

type SplashScreenProps = {
    error?: string | null;
    onRetry?: () => void;
};

export default function SplashScreen({
    error = null,
    onRetry,
}: SplashScreenProps) {
    return (
        <main className="splash-screen" aria-busy={!error}>
            <div className="splash-content">
                <div className="splash-logo-container">
                    <img
                        src="/logo.png"
                        alt="Logo SarprasCheck"
                        className="splash-logo"
                        width={96}
                        height={96}
                    />
                </div>

                <h1 className="splash-title">EMCY</h1>

                <p className="splash-description">
                    Monitoring dan Maintenance
                    <br />
                    Sarana Prasarana Kampus
                </p>

                {error ? (
                    <div className="splash-error" role="alert">
                        <p>{error}</p>

                        {onRetry && (
                            <button
                                type="button"
                                className="splash-retry"
                                onClick={onRetry}
                            >
                                Coba Lagi
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="splash-loading" role="status">
                        <span className="splash-spinner" aria-hidden="true" />
                        <span>Menyiapkan aplikasi…</span>
                    </div>
                )}
            </div>

            <p className="splash-footer">
                Pencatatan sarpras dalam satu aplikasi
            </p>
        </main>
    );
}