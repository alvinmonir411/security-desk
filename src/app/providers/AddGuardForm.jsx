"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function AddGuardForm() {
  const [formData, setFormData] = useState({
    cardId: "",
    name: "",
    designation: "",
    phoneNo: "",
    bloodGroup: "",
    qualification: "",
    accountNumber: "",
    dob: "",
    abc: "",
    leave: 0,
    offDay: "Sunday",
    shift: null,
    currentShift: null,
    daysWorked: 0,
    password: "",
    role: "guard",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}api/add-guard`,
        formData
      );
      toast.success("Guard added successfully!");
      setFormData({
        cardId: "",
        name: "",
        designation: "",
        phoneNo: "",
        bloodGroup: "",
        qualification: "",
        accountNumber: "",
        dob: "",
        abc: "",
        leave: 0,
        offDay: "Sunday",
        shift: null,
        currentShift: null,
        daysWorked: 0,
        password: "",
        role: "guard",
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add guard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">Add New Guard</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          type="text"
          name="cardId"
          placeholder="Card ID"
          value={formData.cardId}
          onChange={handleChange}
          className="p-3 border rounded"
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="p-3 border rounded"
          required
        />
        <input
          type="text"
          name="designation"
          placeholder="Designation"
          value={formData.designation}
          onChange={handleChange}
          className="p-3 border rounded"
          required
        />
        <input
          type="text"
          name="phoneNo"
          placeholder="Phone Number"
          value={formData.phoneNo}
          onChange={handleChange}
          className="p-3 border rounded"
          required
        />
        <input
          type="text"
          name="bloodGroup"
          placeholder="Blood Group"
          value={formData.bloodGroup}
          onChange={handleChange}
          className="p-3 border rounded"
          required
        />
        <input
          type="text"
          name="qualification"
          placeholder="Qualification"
          value={formData.qualification}
          onChange={handleChange}
          className="p-3 border rounded"
        />
        <input
          type="text"
          name="accountNumber"
          placeholder="Account Number"
          value={formData.accountNumber}
          onChange={handleChange}
          className="p-3 border rounded"
        />
        <input
          type="date"
          name="dob"
          placeholder="Date of Birth"
          value={formData.dob}
          onChange={handleChange}
          className="p-3 border rounded"
        />
        <input
          type="text"
          name="abc"
          placeholder="ABC"
          value={formData.abc}
          onChange={handleChange}
          className="p-3 border rounded"
        />
        <input
          type="number"
          name="leave"
          placeholder="Leave"
          value={formData.leave}
          onChange={handleChange}
          className="p-3 border rounded"
        />
        <select
          name="offDay"
          value={formData.offDay}
          onChange={handleChange}
          className="p-3 border rounded"
        >
          <option>Sunday</option>
          <option>Monday</option>
          <option>Tuesday</option>
          <option>Wednesday</option>
          <option>Thursday</option>
          <option>Friday</option>
          <option>Saturday</option>
        </select>
        <input
          type="text"
          name="shift"
          placeholder="Shift (day/night)"
          value={formData.shift || ""}
          onChange={handleChange}
          className="p-3 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="p-3 border rounded"
          required
        />
        <div className="col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Guard"}
          </button>
        </div>
      </form>
    </div>
  );
}
