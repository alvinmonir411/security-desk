"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // 1. Remove user data from localStorage
    localStorage.removeItem("user");

    // 2. Show a logout success toast
    toast.success("You have been logged out!");

    // 3. Redirect to login page
    router.push("/Login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
}
