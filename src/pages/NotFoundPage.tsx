import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return <div className="not-found content"><span>404</span><h1>This route is outside the known path.</h1><p>Return to the curriculum map and continue from a registered lesson, milestone, or reference.</p><Link className="button button-primary" to="/path"><ArrowLeft size={16} />Return to the path</Link></div>;
}
