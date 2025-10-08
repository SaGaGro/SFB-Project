import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiPhone, 
  FiCheckCircle 
} from 'react-icons/fi';
import { FaDumbbell } from 'react-icons/fa6';
import useAuthStore from '../../stores/authStore';
import Navbar from '../../components/common/Navbar';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/venues');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    } else if (formData.username.length < 3) {
      newErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
    }

    if (!formData.email) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.phone) {
      newErrors.phone = 'กรุณากรอกเบอร์โทร';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก';
    }

    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'กรุณายอมรับข้อกำหนดและเงื่อนไข';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const { confirmPassword, agreeTerms, ...registerData } = formData;
      await register(registerData);
      
      toast.success(
        <div className="p-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎉</span>
            <strong className="text-base">ลงทะเบียนสำเร็จ!</strong>
          </div>
          <p className="text-sm">กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...</p>
        </div>,
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('❌ Register error:', err);
      
      let errorMessage = 'ลงทะเบียนไม่สำเร็จ';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      toast.error(
        <div className="p-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">❌</span>
            <strong className="text-base">ลงทะเบียนไม่สำเร็จ</strong>
          </div>
          <p className="text-sm mb-2">{errorMessage}</p>
          <div className="text-xs opacity-75 border-t border-red-200 pt-2 mt-2">
            💡 <strong>คำแนะนำ:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>ตรวจสอบว่าอีเมลนี้ยังไม่เคยลงทะเบียน</li>
              <li>ตรวจสอบว่ากรอกข้อมูลครบถ้วน</li>
              <li>รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</li>
            </ul>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          style: {
            minWidth: '380px',
          }
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Icon Header */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <FaDumbbell className="text-white text-3xl" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Join SportsFit</h1>
              <p className="text-gray-500 text-sm">Start your fitness journey today</p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="mr-2 text-gray-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:border-orange-400 transition-all h-12`}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="mr-2 text-gray-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:border-orange-400 transition-all h-12`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FiPhone className="mr-2 text-gray-400" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0812345678"
                  maxLength={10}
                  className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:border-orange-400 transition-all h-12`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FiLock className="mr-2 text-gray-400" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:border-orange-400 transition-all h-12`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FiLock className="mr-2 text-gray-400" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent hover:border-orange-400 transition-all h-12`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start pt-2">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                />
                <label className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-orange-500 hover:text-orange-600 font-medium">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-orange-500 hover:text-orange-600 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.agreeTerms && (
                <p className="text-xs text-red-500 mt-1">{errors.agreeTerms}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-12 mt-6"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังลงทะเบียน...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="mr-2 text-lg" />
                    Register Now
                  </>
                )}
              </button>

              {/* Sign In Link */}
              <div className="text-center pt-4">
                <span className="text-gray-600 text-sm">Already have an account? </span>
                <Link to="/login" className="text-orange-500 hover:text-orange-600 font-semibold text-sm">
                  Sign in here
                </Link>
              </div>
            </form>
          </div>

          {/* Stats
          <div className="grid grid-cols-3 gap-4 mt-8 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-500">50K+</div>
              <div className="text-xs text-gray-600">Active Members</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">100+</div>
              <div className="text-xs text-gray-600">Workout Plans</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">24/7</div>
              <div className="text-xs text-gray-600">Support</div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 Sport Booking System - ระบบจองคอร์ทกีฬาออนไลน์</p>
        </div>
      </footer>
    </div>
  );
};

export default Register;