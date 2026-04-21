import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api"; // make sure this file exists

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("SUBMIT CLICKED", formData);

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email && !formData.phone) {
      toast.error("Provide email or phone");
      return;
    }

    const isValid = formData.password.length >= 6;

    if (!isValid) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.post("/api/auth/register", formData);

      console.log("REGISTER SUCCESS:", res.data);

      toast.success("Account created successfully!");

      navigate("/");
    } catch (err) {
      console.error("ERROR:", err);

      toast.error(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Register</h2>

      {/* ✅ IMPORTANT: form connected */}
      <form onSubmit={handleSubmit}>

        {/* NAME */}
        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          value={formData.name}
          onChange={handleChange}
        />
        <br /><br />

        {/* EMAIL */}
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
        />
        <br /><br />

        {/* PHONE */}
        <input
          type="text"
          name="phone"
          placeholder="Enter Phone"
          value={formData.phone}
          onChange={handleChange}
        />
        <br /><br />

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
        />
        <br /><br />

        {/* ✅ IMPORTANT: button inside form */}
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Account"}
        </button>

      </form>
    </div>
  );
};

export default Register;