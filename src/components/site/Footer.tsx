import { Link } from "@tanstack/react-router";
import logo from "@/assets/truthguard-logo.png";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="TruthGuard AI logo"
              width={28}
              height={28}
              loading="lazy"
              className="size-7"
            />
            <span className="font-display font-semibold">TruthGuard AI</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Real-Time Fake News Detection &amp; Verification. Verify Before You Amplify.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Product</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <Link to="/analyze" className="hover:text-foreground">
                Analyze
              </Link>
            </li>
            <li>
              <Link to="/history" className="hover:text-foreground">
                History
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-medium">System</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <Link to="/how-it-works" className="hover:text-foreground">
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/model" className="hover:text-foreground">
                Model &amp; Architecture
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-foreground">
                About the Project
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70 px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
        TruthGuard AI is a decision-support tool. It reports likelihood and evidence, never
        absolute proof. Always apply human editorial judgement before publication.
      </div>
    </footer>
  );
}
