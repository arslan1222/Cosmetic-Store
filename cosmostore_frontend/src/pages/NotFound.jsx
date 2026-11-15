import { Link } from "react-router-dom";
import { Button } from "../components/ui";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-32 text-center">
      <p className="font-display text-6xl italic text-berry-400 mb-4">404</p>
      <h1 className="text-2xl mb-2">Page not found</h1>
      <p className="text-ink/55 mb-8">The page you're looking for doesn't exist or has moved.</p>
      <Button as={Link} to="/">Back to home</Button>
    </div>
  );
}
