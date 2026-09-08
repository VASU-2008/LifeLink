import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole, BloodGroup } from '../../types';
import { HeartPulse, Mail, Lock, User, Phone, Building, Droplet, Loader2, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('DONOR');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [address, setAddress] = useState('Central District');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const allBloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      addToast('Missing Fields', 'Please complete all required fields', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        name,
        email,
        phone,
        password,
        role,
        bloodGroup: role === 'DONOR' ? bloodGroup : 'UNKNOWN',
        age: role === 'DONOR' ? Number(age) : undefined,
        gender: role === 'DONOR' ? gender : undefined,
        location: {
          address,
          city: 'Metropolis',
          coordinates: { lat: 28.6139 + (Math.random() - 0.5) * 0.08, lng: 77.2090 + (Math.random() - 0.5) * 0.08 },
        },
        hospitalDetails: role === 'HOSPITAL' ? { licenseNumber: licenseNumber || 'HOSP-NEW-99', emergencyContact: phone } : undefined,
        bloodBankDetails: role === 'BLOOD_BANK' ? { licenseNumber: licenseNumber || 'BB-NEW-99', emergencyContact: phone } : undefined,
      };

      const user = await register(payload);
      addToast('Registration Successful', `Welcome to LifeLink, ${user.name}!`, 'success');
      navigate(`/${role.toLowerCase()}/dashboard`);
    } catch (err: any) {
      addToast('Registration Failed', err.message || 'Could not create account', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-crimson-600/10 blur-[130px] pointer-events-none rounded-full"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-crimson-600 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-crimson-900/50 group-hover:scale-105 transition">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-2xl font-black text-white">LifeLink</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Create your LifeLink Account</h2>
        <p className="text-xs text-slate-400 mt-1">Join the intelligent emergency blood network.</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl backdrop-blur-md">
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { r: 'DONOR', label: 'Blood Donor' },
                { r: 'PATIENT', label: 'Patient / Attendant' },
                { r: 'HOSPITAL', label: 'Hospital' },
                { r: 'BLOOD_BANK', label: 'Blood Bank' },
              ].map((item) => (
                <button
                  key={item.r}
                  type="button"
                  onClick={() => setRole(item.r as UserRole)}
                  className={`py-2.5 px-2 rounded-xl font-bold border transition text-center ${
                    role === item.r
                      ? 'bg-crimson-600 text-white border-crimson-500 shadow-md shadow-crimson-950/60'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {role === 'HOSPITAL' ? 'Hospital Name' : role === 'BLOOD_BANK' ? 'Blood Bank Name' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder={role === 'HOSPITAL' ? 'Metropolitan Hospital' : 'John Doe'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-crimson-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+1-555-0100"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-crimson-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-crimson-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-crimson-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Donor Specific Fields */}
            {role === 'DONOR' && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-crimson-400 block uppercase">
                  Donor Health &amp; Medical Profile
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-crimson-500"
                    >
                      {allBloodGroups.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Age</label>
                    <input
                      type="number"
                      min={18}
                      max={65}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-crimson-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-crimson-500"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Hospital / Blood Bank specific fields */}
            {(role === 'HOSPITAL' || role === 'BLOOD_BANK') && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Medical License / Registration Number
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. HOSP-REG-2026-88"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-crimson-500 transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-sm shadow-lg shadow-crimson-900/40 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  <HeartPulse className="w-4 h-4" /> Complete Registration
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-crimson-400 hover:text-crimson-300 font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
