"use client";

import React, { useEffect, useState } from "react";
import LogoutButton from "@/app/Components/LogoutButton";

export default function Page() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) setUser(JSON.parse(data));
  }, []);

  if (!user) return <p>Loading...</p>;
  console.log(user?.name);
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">
          Security Desk - {user?.role} Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {user?.name}</span>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* User Info Card */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="flex flex-col gap-2">
            <p>
              <strong>Card ID:</strong> {user?.cardId}
            </p>
            <p>
              <strong>Designation:</strong>{" "}
              {user?.designation || "Not assigned"}
            </p>
            <p>
              <strong>Phone:</strong> {user?.phoneNo || "Not assigned"}
            </p>
            <p>
              <strong>Blood Group:</strong> {user?.bloodGroup || "Not assigned"}
            </p>
            <p>
              <strong>Off Day:</strong> {user?.offDay || "Not assigned"}
            </p>
            <p>
              <strong>Shift:</strong> {user?.shift || "Not assigned"}
            </p>
          </div>
        </div>

        {/* Dashboard Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-xl transition">
            <h3 className="text-lg font-semibold mb-2">View Schedule</h3>
            <p className="text-gray-600 mb-4">
              Check your assigned shifts and posts.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              View
            </button>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-xl transition">
            <h3 className="text-lg font-semibold mb-2">Update Attendance</h3>
            <p className="text-gray-600 mb-4">
              Mark your attendance for today’s shift.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Update
            </button>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-xl transition">
            <h3 className="text-lg font-semibold mb-2">Leave Request</h3>
            <p className="text-gray-600 mb-4">
              Apply for leave and track status.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Apply
            </button>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-xl transition">
            <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
            <p className="text-gray-600 mb-4">
              Change password or update personal info.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
