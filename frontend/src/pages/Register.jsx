const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.email && !formData.phone) {
    toast.error('Please provide an email or phone number.');
    return;
  }

  if (!isPasswordValid) {
    toast.error('Password does not meet the requirements.');
    return;
  }

  setSubmitting(true);

  try {
    const res = await api.post('/api/auth/register', formData);

    login(res.data);

    toast.success('Account created successfully! Welcome to AquaSmart 🐟');

    navigate('/');

  } catch (err) {
    console.error(err);

    toast.error(
      err.response?.data?.message ||
      err.message ||
      'Registration failed.'
    );
  } finally {
    setSubmitting(false);
  }
};