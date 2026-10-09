import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { authApi, extractError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const schema = z.object({
  first_name:       z.string().min(1,'Required'),
  last_name:        z.string().min(1,'Required'),
  email:            z.string().email('Valid email required'),
  password:         z.string().min(8,'8+ chars').regex(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/,'Needs uppercase, lowercase & number'),
  confirm_password: z.string(),
}).refine(d => d.password===d.confirm_password, { message:'Passwords do not match', path:['confirm_password'] });
type FD = z.infer<typeof schema>;

export default function RegisterPage() {
  const { login } = useAuth(); const nav = useNavigate(); const [err, setErr] = useState('');
  const { register, handleSubmit, formState:{errors,isSubmitting} } = useForm<FD>({ resolver: zodResolver(schema) });

  const onSubmit = async (fd: FD) => {
    setErr('');
    try {
      const { user, token } = await authApi.register({ email:fd.email, password:fd.password, first_name:fd.first_name, last_name:fd.last_name });
      login(user, token); nav('/dashboard', { replace:true });
    } catch(e) { setErr(extractError(e)); }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-violet-800 to-purple-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <Link to="/" className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-white text-xl">EduFlow</span>
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">Start Learning.<br />Start Growing.</h2>
          <p className="text-violet-200 text-lg leading-relaxed mb-8">Join 50,000+ learners building in-demand skills today.</p>
          <div className="space-y-3">
            {['Access to 500+ courses','Learn at your own pace','Earn verified certificates','Free forever — no credit card'].map(f => (
              <div key={f} className="flex items-center gap-3 text-white text-sm">
                <span className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-900 flex-shrink-0">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-violet-400 text-sm">© 2026 EduFlow LMS</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Create your account</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Free access to all courses</p>
            </div>
            {err && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 font-medium">{err}</div>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" placeholder="John" required leftIcon={<User className="w-4 h-4" />} error={errors.first_name?.message} {...register('first_name')} />
                <Input label="Last Name" placeholder="Doe" required error={errors.last_name?.message} {...register('last_name')} />
              </div>
              <Input label="Email" type="email" placeholder="you@example.com" required leftIcon={<Mail className="w-4 h-4" />} error={errors.email?.message} {...register('email')} />
              <Input label="Password" type="password" placeholder="Min 8 characters" required leftIcon={<Lock className="w-4 h-4" />} hint="Uppercase, lowercase & number" error={errors.password?.message} {...register('password')} />
              <Input label="Confirm Password" type="password" placeholder="Repeat password" required leftIcon={<Lock className="w-4 h-4" />} error={errors.confirm_password?.message} {...register('confirm_password')} />
              <Button type="submit" className="w-full mt-2" size="lg" isLoading={isSubmitting}>Create Free Account</Button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}<Link to="/login" className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
