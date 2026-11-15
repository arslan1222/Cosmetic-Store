import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button, Input } from "../components/ui";

export default function Register() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", role: "customer" });
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      await login(form.email, form.password);
      toast.success("Account created! Welcome to CosmoStore.");
      navigate(form.role === "vendor" ? "/vendor" : "/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-20">
      <h1 className="text-3xl mb-2 text-center">Create your account</h1>
      <p className="text-ink/55 text-center mb-8">Shop from independent beauty boutiques.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-2xl p-7 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, role: "customer" }))}
            className={`rounded-lg py-2.5 text-sm font-medium border ${
              form.role === "customer" ? "border-berry-500 bg-berry-50 text-berry-700" : "border-ink/15 text-ink/60"
            }`}
          >
            I'm shopping
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, role: "vendor" }))}
            className={`rounded-lg py-2.5 text-sm font-medium border ${
              form.role === "vendor" ? "border-berry-500 bg-berry-50 text-berry-700" : "border-ink/15 text-ink/60"
            }`}
          >
            I'm selling
          </button>
        </div>

        <Input label="Full name" value={form.full_name} onChange={update("full_name")} required />
        <Input label="Email" type="email" value={form.email} onChange={update("email")} required />
        <Input label="Phone" value={form.phone} onChange={update("phone")} placeholder="03xx-xxxxxxx" />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={update("password")}
          required
          minLength={6}
        />
        <Button type="submit" disabled={loading} className="w-full mt-2">
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-ink/60 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-berry-600 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
