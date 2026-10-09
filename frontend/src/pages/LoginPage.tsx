import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, BookOpen, Users, Award } from 'lucide-react';
import { useState } from 'react';
import { authApi, extractError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const schema = z.object({ email: z.string().email(), password: z.string().min(1,'Password required') });
type FD = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth(); const nav = useNavigate(); const [err, setErr] = useState('');
  const { register, handleSubmit, formState:{errors,isSubmitting} } = useForm<FD>({ resolver: zodResolver(schema) });

  const onSubmit = async (fd: FD) => {
    setErr('');
    try { const { user, token } = await authApi.login(fd); login(user, token); nav('/dashboard', { replace:true }); }
    catch(e) { setErr(extractError(e)); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
        <Link to="/" className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-white text-xl tracking-tight">EduFlow</span>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Continue Your<br />Learning Journey
          </h2>
          <p className="text-violet-200 text-lg leading-relaxed mb-8">
            Access your courses, track progress, and earn certificates.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[{icon:BookOpen,label:'500+ Courses'},{icon:Users,label:'50k Students'},{icon:Award,label:'Certificates'}].map(({icon:Icon,label}) => (
              <div key={label} className="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/10">
                <Icon className="w-5 h-5 text-violet-300 mx-auto mb-1" />
                <p className="text-white text-xs font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-violet-400 text-sm">© 2026 EduFlow LMS</p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <GraduationCap className="w-6 h-6 text-violet-600" />
            <span className="font-black text-gray-900 dark:text-white">EduFlow</span>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Welcome back</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to access your courses</p>
            </div>
            {err && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 font-medium">{err}</div>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Email" type="email" placeholder="you@example.com" required leftIcon={<Mail className="w-4 h-4" />} error={errors.email?.message} {...register('email')} />
              <Input label="Password" type="password" placeholder="Your password" required leftIcon={<Lock className="w-4 h-4" />} error={errors.password?.message} {...register('password')} />
              <Button type="submit" className="w-full mt-2" size="lg" isLoading={isSubmitting}>Sign In</Button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              New to EduFlow?{' '}<Link to="/register" className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">Create free account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
