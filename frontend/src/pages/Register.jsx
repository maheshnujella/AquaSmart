import api from "../api";

const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("SUBMIT CLICKED", formData); // ✅ confirm trigger

  // ✅ name check
  if (!formData.name || !formData.name.trim()) {
    toast.error("Name is required");
    return;
  }

  // ✅ email or phone
  if (!formData.email && !formData.phone) {
    toast.error("Please provide an email or phone number.");
    return;
  }

  // ✅ password presence
  if (!formData.password) {
    toast.error("Password is required");
    return;
  }

  // ✅ strong password check (match backend)
  const isValid =
    formData.password.length >= 6 &&
    formData.password.length <= 10 &&
    /[A-Z]/.test(formData.password) &&
    /[0-9]/.test(formData.password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

  if (!isValid) {
    toast.error("Password must contain A-Z, number, special char");
    return;
  }

  try {
    setSubmitting(true);

    const res = await api.post("/api/auth/register", formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("REGISTER SUCCESS:", res.data);

    // ✅ safer login call
    login(res.data);

    toast.success("Account created successfully! 🐟");

    navigate("/");
  } catch (err) {
    console.error("REGISTER ERROR FULL:", err);

    // ✅ show real backend message clearly
    const message =
      err.response?.data?.message ||
      err.response?.data ||
      err.message ||
      "Registration failed";

    console.log("BACKEND MESSAGE:", message);

    toast.error(message);
  } finally {
    setSubmitting(false);
  }
};