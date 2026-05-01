import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Stethoscope, Plus, Trash2, ShieldCheck, DollarSign } from 'lucide-react';

const DoctorRegister = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    experience: '', specialization: 'Aquaculture',
    courses: [{ courseName: '', institutionName: '', year: '' }],
    certifications: [],
    availability: [{ day: 'Monday', slots: ['09:00 AM - 12:00 PM'] }],
    fees: {
      waterTesting: 200,
      soilTesting: 300,
      fieldVisitBase: 1000,
      perKmCharge: 20
    }
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addCourse = () => {
    setFormData({
      ...formData,
      courses: [...formData.courses, { courseName: '', institutionName: '', year: '' }]
    });
  };

  const removeCourse = (index) => {
    setFormData({
      ...formData,
      courses: formData.courses.filter((_, i) => i !== index)
    });
  };

  const handleCourseChange = (index, field, value) => {
    const newCourses = [...formData.courses];
    newCourses[index][field] = value;
    setFormData({ ...formData, courses: newCourses });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/doctors/register', formData);
      toast.success('Registration submitted! Awaiting Admin approval.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto glass-card p-8 bg-white/90">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Doctor Registration</h2>
          <p className="mt-2 text-slate-500">Join our network of expert aquaculture doctors</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Phone Number</label>
              <input type="text" name="phone" className="input-field" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Specialization</label>
                <select name="specialization" className="input-field" value={formData.specialization} onChange={handleChange}>
                  <option value="Aquaculture">Aquaculture</option>
                  <option value="Fish Health">Fish Health</option>
                  <option value="Prawn Culture">Prawn Culture</option>
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Experience (Years)</label>
                <input type="number" name="experience" className="input-field" value={formData.experience} onChange={handleChange} required />
             </div>
          </div>

          {/* Courses */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Courses Completed</h3>
              <button type="button" onClick={addCourse} className="text-blue-600 flex items-center gap-1 text-sm font-bold hover:bg-blue-50 px-3 py-1 rounded-lg">
                <Plus className="w-4 h-4" /> Add Course
              </button>
            </div>
            {formData.courses.map((course, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl relative">
                <input placeholder="Course Name" className="input-field bg-white" value={course.courseName} onChange={(e) => handleCourseChange(index, 'courseName', e.target.value)} required />
                <input placeholder="Institution" className="input-field bg-white" value={course.institutionName} onChange={(e) => handleCourseChange(index, 'institutionName', e.target.value)} required />
                <input placeholder="Year" className="input-field bg-white" value={course.year} onChange={(e) => handleCourseChange(index, 'year', e.target.value)} required />
                {formData.courses.length > 1 && (
                  <button type="button" onClick={() => removeCourse(index)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Consultation Fees */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" /> Consultation Fees
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Water Test (₹)</label>
                <input type="number" name="fees.waterTesting" className="input-field" value={formData.fees.waterTesting} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Soil Test (₹)</label>
                <input type="number" name="fees.soilTesting" className="input-field" value={formData.fees.soilTesting} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Field Base (₹)</label>
                <input type="number" name="fees.fieldVisitBase" className="input-field" value={formData.fees.fieldVisitBase} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Per KM (₹)</label>
                <input type="number" name="fees.perKmCharge" className="input-field" value={formData.fees.perKmCharge} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
             <ShieldCheck className="w-5 h-5 text-blue-600 mt-1" />
             <p className="text-sm text-blue-700">
               By registering, you agree to have your certifications verified by the Admin. Only verified doctors can provide services on AquaSmart.
             </p>
          </div>

          <button type="submit" className="w-full btn-primary py-4 text-lg">
            Complete Registration
          </button>

          <p className="text-center text-slate-600">
            Already registered? <Link to="/login" className="text-blue-600 font-bold">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default DoctorRegister;
