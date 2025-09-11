"use client";

import React, { useEffect, useState } from "react";

import LogoutButton from "@/app/Components/LogoutButton";
import AddGuardForm from "@/app/providers/AddGuardForm";
import ManageGuards from "@/app/providers/ManageGuards";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [section, setSection] = useState("overview");

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) setUser(JSON.parse(data));
  }, []);

  if (!user) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold tracking-wide">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline">Welcome, {user?.name}</span>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 max-w-7xl mx-auto p-6 space-y-8">
        {/* Overview */}
        {section === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">Total Guards</h3>
              <p className="text-3xl font-bold text-blue-600">50</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">Active Today</h3>
              <p className="text-3xl font-bold text-green-600">42</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">Pending Leaves</h3>
              <p className="text-3xl font-bold text-red-600">3</p>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={() => setSection("addGuard")}
            className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-xl hover:scale-105 transition cursor-pointer"
          >
            <h3 className="text-lg font-semibold mb-2">Add Guard</h3>
            <p className="text-gray-600 mb-4">
              Add new security personnel to the system.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Add
            </button>
          </div>

          <div
            onClick={() => setSection("manageGuards")}
            className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-xl hover:scale-105 transition cursor-pointer"
          >
            <h3 className="text-lg font-semibold mb-2">Manage Guards</h3>
            <p className="text-gray-600 mb-4">
              Edit or remove existing guards.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Manage
            </button>
          </div>

          <div
            onClick={() => setSection("approveLeaves")}
            className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-xl hover:scale-105 transition cursor-pointer"
          >
            <h3 className="text-lg font-semibold mb-2">Approve Leaves</h3>
            <p className="text-gray-600 mb-4">
              Review and approve guard leave requests.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Approve
            </button>
          </div>

          <div
            onClick={() => setSection("settings")}
            className="bg-white shadow-md rounded-lg p-6 text-center hover:shadow-xl hover:scale-105 transition cursor-pointer"
          >
            <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
            <p className="text-gray-600 mb-4">
              Update personal information or change password.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Settings
            </button>
          </div>
        </div>

        {/* Dynamic Section */}
        <div className="mt-8">
          {section === "addGuard" && <AddGuardForm />}
          {section === "manageGuards" && <ManageGuards />}
          {section === "approveLeaves" && (
            <p>Approve Leaves Component Coming Soon</p>
          )}
          {section === "settings" && <p>Profile Settings Coming Soon</p>}
        </div>
      </main>
    </div>
  );
}
