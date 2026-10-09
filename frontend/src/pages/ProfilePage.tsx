import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Globe, FileText } from 'lucide-react';
import { authApi, extractError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import PublicNavbar from '../components/layout/PublicNavbar';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { initials, fmt } from '../utils/helpers';

const profileSchema = z.object({
  first_name: z.string().min(1,'Required'), last_name: z.string().min(1,'Required'),
  headline: z.string().optional(), bio: z.string().optional(), website: z.string().optional(),
});
const pwdSchema = z.object({
  current_password: z.string().min(1,'Required'),
  new_password: z.string().min(8,'8+ chars').regex(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/,'Needs uppercase, lowercase & number'),
  confirm: z.string(),
}).refine(d => d.new_password===d.confirm, { message:'Passwords do not match', path:['confirm'] });

type PFD = z.infer<typeof profileSchema>;
type WFD = z.infer<typeof pwdSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuth(); const toast = useToast();

  const { register: pReg, handleSubmit: pSub, formState:{errors:pErr, isSubmitting:pPending} } = useForm<PFD>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name:user?.first_name??'', last_name:user?.last_name??'', headline:user?.headline??'', bio:user?.bio??'', website:user?.website??'' },
  });
  const { register: wReg, handleSubmit: wSub, reset:wReset, formState:{errors:wErr, isSubmitting:wPending} } = useForm<WFD>({ resolver: zodResolver(pwdSchema) });

  const profileMut = useMutation({ mutationFn: (d: PFD) => authApi.updateProfile(d), onSuccess:(u)=>{ setUser(u); toast.success('Profile updated!'); }, onError:(e)=>toast.error(extractError(e)) });
  const pwdMut = useMutation({ mutationFn:(d:WFD)=>authApi.changePassword(d.current_password,d.new_password), onSuccess:()=>{ wReset(); toast.success('Password changed!'); }, onError:(e)=>toast.error(extractError(e)) });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <PublicNavbar />
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Profile & Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">Manage your account information</p>
        </div>

        {/* Profile header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-2xl font-black">
            {initials(user.first_name, user.last_name)}
          </div>
          <div>
            <p className="text-xl font-black text-white">{user.first_name} {user.last_name}</p>
            <p className="text-violet-200 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-semibold rounded-full capitalize">{user.role}</span>
              <span className="text-violet-300 text-xs">Joined {fmt(user.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2"><User className="w-4 h-4 text-violet-600" />Edit Profile</h3>
          <form onSubmit={pSub((d) => profileMut.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" required error={pErr.first_name?.message} {...pReg('first_name')} />
              <Input label="Last Name" required error={pErr.last_name?.message} {...pReg('last_name')} />
            </div>
            <Input label="Email" value={user.email} disabled hint="Email cannot be changed" leftIcon={<Mail className="w-4 h-4" />} />
            <Input label="Headline" placeholder="e.g. Full Stack Developer" leftIcon={<FileText className="w-4 h-4" />} {...pReg('headline')} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
              <textarea {...pReg('bio')} rows={3} placeholder="Tell us about yourself…"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
            </div>
            <Input label="Website" placeholder="https://yourwebsite.com" leftIcon={<Globe className="w-4 h-4" />} {...pReg('website')} />
            <div className="flex justify-end"><Button type="submit" isLoading={pPending}>Save Changes</Button></div>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2"><Lock className="w-4 h-4 text-violet-600" />Change Password</h3>
          <form onSubmit={wSub((d) => pwdMut.mutate(d))} className="space-y-4">
            <Input label="Current Password" type="password" required error={wErr.current_password?.message} {...wReg('current_password')} />
            <Input label="New Password" type="password" required hint="8+ chars, uppercase, lowercase & number" error={wErr.new_password?.message} {...wReg('new_password')} />
            <Input label="Confirm New Password" type="password" required error={wErr.confirm?.message} {...wReg('confirm')} />
            <div className="flex justify-end"><Button type="submit" variant="secondary" isLoading={wPending}>Update Password</Button></div>
          </form>
        </div>
      </div>
    </div>
  );
}
