import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button, Input } from "../components/ui";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success("Welcome back!");
      const dest =
        location.state?.from?.pathname ||
        (res.data.role === "admin" ? "/admin" : res.data.role === "vendor" ? "/vendor" : "/");
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-3xl mb-2 text-center">Welcome back</h1>
      <p className="text-ink/55 text-center mb-8">Log in to continue to CosmoStore.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-2xl p-7 space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading} className="w-full mt-2">
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="text-center text-sm text-ink/60 mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-berry-600 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
