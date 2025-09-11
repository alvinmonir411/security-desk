"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function LoginForm() {
  const [cardId, setCardId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}api/login`,
        { cardId, password }
      );

      if (res.data.user.role === "admin") {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        console.log("okay ");
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/user");
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast(`Welcome ${res.data.user.name}! Role: ${res.data.user.role}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Welcome to Security Desk
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Card ID"
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className="text-sm text-center text-gray-500 mt-4">
          First time?{" "}
          <a href="/register" className="text-blue-600">
            Set your password
          </a>
        </p>
      </form>
    </div>
  );
}
