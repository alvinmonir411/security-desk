"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function ManageGuards() {
  const [guards, setGuards] = useState([]);
  const [editingGuard, setEditingGuard] = useState(null);
  const [expandedGuardId, setExpandedGuardId] = useState(null);

  const fetchGuards = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}api/guards`
      );
      setGuards(res.data);
    } catch (err) {
      toast.error("Failed to fetch guards");
    }
  };

  useEffect(() => {
    fetchGuards();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this guard?")) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}api/guards/${id}`);
      toast.success("Guard deleted successfully!");
      fetchGuards();
    } catch (err) {
      toast.error("Failed to delete guard");
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingGuard({ ...editingGuard, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}api/guards/${editingGuard._id}`,
        editingGuard
      );
      toast.success("Guard updated successfully!");
      setEditingGuard(null);
      fetchGuards();
    } catch (err) {
      toast.error("Failed to update guard");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Manage Guards</h2>

      {/* Edit Form */}
      {editingGuard && (
        <form
          onSubmit={handleUpdate}
          className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded"
        >
          {Object.keys(editingGuard).map((key) => {
            if (key === "_id" || key === "role") return null;
            return (
              <input
                key={key}
                type="text"
                name={key}
                value={editingGuard[key] || ""}
                onChange={handleEditChange}
                placeholder={key}
                className="p-2 border rounded"
              />
            );
          })}
          <div className="col-span-2 flex gap-2 justify-end">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => setEditingGuard(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Guards Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-2">Card ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Designation</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Off Day</th>
              <th className="p-2">Shift</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {guards.map((guard) => (
              <React.Fragment key={guard._id}>
                <tr className="text-center border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="p-2">{guard.cardId}</td>
                  <td className="p-2">{guard.name}</td>
                  <td className="p-2">{guard.designation}</td>
                  <td className="p-2">{guard.phoneNo}</td>
                  <td className="p-2">{guard.offDay}</td>
                  <td className="p-2">{guard.shift || "Not assigned"}</td>
                  <td className="p-2 flex justify-center gap-2">
                    <button
                      onClick={() =>
                        setExpandedGuardId(
                          expandedGuardId === guard._id ? null : guard._id
                        )
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                      {expandedGuardId === guard._id ? "Hide" : "View"}
                    </button>
                    <button
                      onClick={() => setEditingGuard(guard)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(guard._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {expandedGuardId === guard._id && (
                  <tr className="bg-gray-100 border-b border-gray-200 transition">
                    <td colSpan={7} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.keys(guard).map((key) => {
                          if (key === "_id") return null;
                          return (
                            <div
                              key={key}
                              className="bg-white p-2 rounded shadow-sm"
                            >
                              <strong>{key}:</strong> {guard[key] || "N/A"}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
