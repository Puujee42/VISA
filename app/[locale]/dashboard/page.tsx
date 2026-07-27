"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import {
   Clock, Calendar, MapPin, ArrowUpRight, Activity,
   CheckCircle2, Shield, MoreHorizontal, Loader2,
   Settings, Plane, Globe, BookOpen, AlertCircle,
   Sparkles,
   FileText,
   User,
   Phone,
   GraduationCap,
   Baby,
   Heart,
   Video,
   Folder,
} from "lucide-react";
import { m } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

// --- CONSTANTS ---
const STEPS = ["Applied", "Documents", "Interview", "Matching", "Visa", "Departure"];

const STEP_INSTRUCTIONS: Record<string, { link: string }> = {
   "Applied": { link: "/aupair" },
   "Documents": { link: "/submit-documents" },
   "Interview": { link: "/lessons" },
   "Matching": { link: "#" },
   "Visa": { link: "/aupair/germany" },
   "Departure": { link: "/lessons" }
};

// --- TYPES ---
interface UserData {
   _id: string;
   fullName: string;
   email: string;
   role: 'student' | 'guest' | 'admin';
   studentId?: string;
   country?: string;
   step?: string;
   profile?: any;
}

interface ActivityLog {
   title: string;
   date: string;
   type: 'event' | 'doc' | 'system';
}

// --- COMPONENTS ---
const DashboardCard = ({ children, className = "", delay = 0 }: any) => (
   <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative bg-white border border-slate-100 rounded-[2.5rem] p-6 overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(227,27,35,0.1)] hover:border-slate-200 transition-all duration-500 group ${className}`}
   >
      {children}
   </m.div>
);

const FullSnapshotSection = ({ profile }: { profile: any }) => {
   const t = useTranslations("dashboard");
   return (
      <div className="space-y-8">
         <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
               <Activity size={20} />
            </div>
            <div>
               <h2 className="text-2xl font-black text-slate-900 leading-tight">{t('applicationSnapshot')}</h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('fullRecord')}</p>
            </div>
         </div>

         {!profile ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
               <AlertCircle className="mx-auto text-slate-200 mb-4" size={48} />
               <p className="text-slate-400 font-bold">{t('motivationMissing')}</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <DashboardCard className="lg:col-span-1 p-8!">
                  <h3 className="flex items-center gap-2 text-[#E31B23] font-black text-[10px] uppercase tracking-widest mb-6">
                     <User size={14} /> {t('identity')}
                  </h3>
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-[8px] font-black text-slate-400 uppercase">{t('sex')}</p><p className="text-xs font-bold text-slate-900">{profile.sex || t('missing')}</p></div>
                        <div><p className="text-[8px] font-black text-slate-400 uppercase">{t('nationality')}</p><p className="text-xs font-bold text-slate-900">{profile.nationality || t('missing')}</p></div>
                     </div>
                     <div><p className="text-[8px] font-black text-slate-400 uppercase">{t('birth')}</p><p className="text-xs font-bold text-slate-900">{profile.dob ? new Date(profile.dob).toLocaleDateString() : t('missing')}</p></div>
                     <div className="pt-4 border-t border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase">{t('phoneMobile')}</p>
                        <p className="text-xs font-bold text-slate-900">{profile.phone || t('missing')} / {profile.mobile || "-"}</p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{t('address')}</p>
                        <p className="text-[10px] font-bold text-slate-600 leading-tight">
                           {profile.address?.street} {profile.address?.number}, {profile.address?.city}, {profile.address?.country}
                        </p>
                     </div>
                  </div>
               </DashboardCard>

               <DashboardCard className="lg:col-span-1 p-8!">
                  <h3 className="flex items-center gap-2 text-[#E31B23] font-black text-[10px] uppercase tracking-widest mb-6">
                     <Heart size={14} /> {t('family')}
                  </h3>
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 gap-3">
                        <div><p className="text-[8px] font-black text-slate-400 uppercase">{t('fatherJob')}</p><p className="text-xs font-bold text-slate-900">{profile.fatherProfession || t('missing')}</p></div>
                        <div><p className="text-[8px] font-black text-slate-400 uppercase">{t('motherJob')}</p><p className="text-xs font-bold text-slate-900">{profile.motherProfession || t('missing')}</p></div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <div><p className="text-[8px] font-black text-slate-400 uppercase">{t('languages')}</p><p className="text-xs font-bold text-slate-900">{profile.languages || t('missing')}</p></div>
                        <div><p className="text-[8px] font-black text-slate-400 uppercase">{t('education')}</p><p className="text-xs font-bold text-slate-900 capitalize">{profile.educationLevel || t('missing')}</p></div>
                     </div>
                     <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl">
                        <p className="text-[8px] font-black text-slate-400 uppercase">{t('driverLicense')}</p>
                        <span className={`text-[10px] font-black uppercase ${profile.driversLicense === 'yes' ? t('yes') : t('no')}`}>{profile.driversLicense === 'yes' ? t('yes') : t('no')}</span>
                     </div>
                  </div>
               </DashboardCard>

               <DashboardCard className="lg:col-span-1 p-8!">
                  <h3 className="flex items-center gap-2 text-[#E31B23] font-black text-[10px] uppercase tracking-widest mb-6">
                     <Baby size={14} /> {t('childcare')}
                  </h3>
                  <div className="space-y-6">
                     <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-2">{t('ageExperience')}</p>
                        <div className="flex flex-wrap gap-1.5">
                           {profile.childcareExperience?.length > 0 ? profile.childcareExperience.map((e: any) => (
                              <span key={e} className="bg-slate-100 px-2 py-1 rounded text-[9px] font-bold text-slate-600">{e}</span>
                           )) : <span className="text-[10px] italic text-slate-300">{t('noneListed')}</span>}
                        </div>
                     </div>
                     <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-2">{t('household')}</p>
                        <div className="flex flex-wrap gap-1.5">
                           {profile.householdTasks?.length > 0 ? profile.householdTasks.map((t: any) => (
                              <span key={t} className="bg-slate-100 px-2 py-1 rounded text-[9px] font-bold text-slate-600">{t}</span>
                           )) : <span className="text-[10px] italic text-slate-300">{t('noneListed')}</span>}
                        </div>
                     </div>
                     <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                        <p className="text-[8px] font-black text-amber-600 uppercase mb-1">{t('timeline')}</p>
                        <div className="flex justify-between text-[10px] font-bold text-slate-700">
                           <span>{profile.earliestStart || "Earliest: -"}</span>
                           <span>{profile.latestStart || "Latest: -"}</span>
                        </div>
                     </div>
                  </div>
               </DashboardCard>

               <DashboardCard className="lg:col-span-3 p-10! bg-slate-50 border-none">
                  <h3 className="flex items-center gap-2 text-[#E31B23] font-black text-[10px] uppercase tracking-widest mb-6">
                     <FileText size={14} /> {t('motivation')}
                  </h3>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed italic relative z-10 max-w-4xl">
                     "{profile.motivation || t('motivationMissing')}"
                  </p>
                  <MoreHorizontal className="absolute bottom-6 right-10 text-slate-200" size={48} />
               </DashboardCard>
            </div>
         )}
      </div>
   );
};

export default function MemberDashboard() {
   const t = useTranslations("dashboard");
   const locale = useLocale();
   const { user, isLoaded } = useAuth();
   const router = useRouter();

   const [userData, setUserData] = useState<UserData | null>(null);
   const [activities, setActivities] = useState<ActivityLog[]>([]);
   const [userApps, setUserApps] = useState<any[]>([]);
   const [bookings, setBookings] = useState<any[]>([]);
   const [materials, setMaterials] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   const formatDate = (date: string) => {
      try {
         return new Date(date.replace(/-/g, "/")).toLocaleDateString(locale === 'mn' ? 'mn-MN' : 'en-US', { month: 'short', day: 'numeric' });
      } catch (e) {
         return date;
      }
   };

   useEffect(() => {
      if (!isLoaded) return;

      if (!user) {
         router.replace("/sign-in");
         return;
      }

      if (user.role === "admin") {
         router.replace("/admin");
         return;
      }

      const init = async () => {
         try {
            const [dashRes, materialsRes] = await Promise.all([
               fetch('/api/user/dashboard'),
               fetch('/api/user/materials')
            ]);

            if (dashRes.ok) {
               const data = await dashRes.json();
               if (data.user?.role === 'admin') {
                  router.replace('/admin');
                  return;
               }
               setUserData(data.user);
               setActivities(data.activity || []);
               setBookings(data.bookings || []);
               setUserApps(data.applications || []);
            } else {
               setUserData({ _id: "new", fullName: user.fullName || "Guest User", email: user.email || "", role: "guest" });
            }

            if (materialsRes.ok) {
               const matData = await materialsRes.json();
               setMaterials(matData.materials || []);
            }
         } catch (e) {
            console.error("Dashboard Error:", e);
         } finally {
            setLoading(false);
         }
      };
      init();
   }, [isLoaded, user, router]);

   if (!isLoaded || loading) return (
      <div className="min-h-dvh flex items-center justify-center bg-[#FAFAFA]">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#E31B23]" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t('loading')}</p>
         </div>
      </div>
   );

   if (!userData) return null;

   const isStudent = userData.role === 'student';
   const normalizedStep = (!userData.step || userData.step === "-") ? "Applied" : userData.step;
   const currentStepIndex = STEPS.indexOf(normalizedStep);
   const progressPercent = Math.max(5, ((currentStepIndex + 1) / STEPS.length) * 100);
   const pendingApp = userApps.find(a => a.status === 'pending');

   // 1. Next CONFIRMED meeting (for joining)
   const now = new Date();
   const upcomingConfirmed = bookings
      .filter(b => b.status === 'confirmed')
      .filter(b => {
         const meetingDate = new Date(`${b.date}T${b.time}`);
         return meetingDate >= new Date(now.getTime() - 60 * 60 * 1000); 
      })
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())[0];

   // 2. Absolute LATEST booking (most recently created)
   const latestBooking = bookings.length > 0 ? [...bookings].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
   )[0] : null;

   const stepKey = normalizedStep;
   
   // Instruction logic
   const currentInstruction = {
      title: t(`instructions.${stepKey}.title`),
      action: t(`instructions.${stepKey}.action`),
      button: t(`instructions.${stepKey}.button`),
      link: STEP_INSTRUCTIONS[stepKey]?.link || "/aupair",
      isMeeting: false
   };

   return (
      <div className="min-h-dvh bg-[#FAFAFA] font-sans text-slate-900 pt-28 pb-12 px-6">
         <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-200 h-200 bg-[#E31B23] rounded-full blur-[200px] opacity-[0.03]" />
            <div className="absolute bottom-0 left-0 w-150 h-150 bg-[#00C896] rounded-full blur-[200px] opacity-[0.03]" />
         </div>

         <div className="relative z-10 max-w-7xl mx-auto space-y-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
               <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="flex items-center gap-3 mb-2">
                     <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px] ${isStudent ? 'bg-[#00C896] shadow-[#00C896]' : 'bg-slate-400 shadow-slate-400'}`} />
                     <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${isStudent ? 'text-[#00C896]' : 'text-slate-400'}`}>
                        {isStudent ? t('activeStudent') : t('guestAccount')}
                     </p>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-1 text-slate-900">
                     {t('hello')}, <br /><span className="text-transparent bg-clip-text bg-linear-to-r from-[#E31B23] to-rose-400">{userData.fullName}</span>
                  </h1>
               </m.div>
               <m.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                  <Link href="/events" className="group relative px-8 py-4 rounded-2xl overflow-hidden transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 bg-[#E31B23]">
                     <span className="relative z-10 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><Calendar size={14} /> {t('findEvents')}</span>
                  </Link>
                  <button className="p-4 border border-slate-200 bg-white text-slate-400 hover:text-slate-900 rounded-2xl transition-all active:scale-95"><Settings size={18} /></button>
               </m.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-4 gap-6">
               <DashboardCard className="md:col-span-3 lg:col-span-2 row-span-2 p-0! border-t-4 border-t-[#E31B23]">
                  <div className="relative h-full p-8 flex flex-col justify-between z-10">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-6">
                           <div className="relative">
                              <div className="w-20 h-20 rounded-3xl p-1 shadow-xl bg-white ring-4 ring-slate-50 -rotate-3">
                                 <Image src={user?.imageUrl || "/image.png"} alt="User" width={80} height={80} className="rounded-[1.2rem] w-full h-full object-cover" />
                              </div>
                              {isStudent && <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg border border-slate-100"><Shield size={14} className="text-[#00C896] fill-[#00C896]/20" /></div>}
                           </div>
                           <div>
                              <h2 className="text-xl font-black text-slate-900 mb-1">{userData.fullName}</h2>
                              {isStudent ? <p className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md text-slate-500 inline-block">{userData.studentId || "NO-ID"}</p> : <Link href="/apply" className="text-[10px] font-bold text-[#E31B23] hover:underline flex items-center gap-1">{t('completeApplication')} <ArrowUpRight size={10} /></Link>}
                           </div>
                        </div>
                        {isStudent && userData.country && (
                           <div className="text-right hidden sm:block">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('destination')}</p>
                              <div className="flex items-center justify-end gap-1.5 text-sm font-bold text-[#E31B23]"><Plane size={14} /> {userData.country}</div>
                           </div>
                        )}
                     </div>

                     {isStudent ? (
                        <div className="space-y-8 mt-12">
                           <div className="space-y-3">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                 <span className="flex items-center gap-2">{t('currentStep')}: <span className="text-white bg-slate-900 px-2 py-0.5 rounded ml-1">{t(`steps.${normalizedStep}`)}</span></span>
                                 <span className="text-[#E31B23]">{Math.round(progressPercent)}% {t('ready')}</span>
                              </div>
                              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                 <m.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1.5, ease: "circOut" }} className="h-full bg-[#E31B23] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-size-[1rem_1rem] animate-[progress_1s_linear_infinite]" />
                                 </m.div>
                              </div>
                              <div className="flex justify-between mt-2">
                                 {STEPS.map((s, i) => (
                                    <div key={s} className="flex flex-col items-center gap-1">
                                       <div className={`h-1.5 w-1.5 rounded-full ${i <= currentStepIndex ? 'bg-[#E31B23]' : 'bg-slate-200'}`} />
                                       <span className={`text-[7px] font-black uppercase ${i === currentStepIndex ? 'text-[#E31B23]' : 'text-slate-300'}`}>{t(`steps.${s}`)}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                           {pendingApp ? (
                              <>
                                 <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3"><Clock size={24} /></div>
                                 <h3 className="text-lg font-black text-slate-900 mb-1">{t('pending')}</h3>
                                 <p className="text-xs text-slate-500 mb-4">{t('appliedFor')} <b>{pendingApp.programId}</b> {t('on')} {formatDate(pendingApp.createdAt)}</p>
                                 <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block">{t('underReview')}</div>
                              </>
                           ) : (
                              <><Sparkles size={24} className="text-[#E31B23] mx-auto mb-3" /><h3 className="text-lg font-black text-slate-900 mb-2">{t('startYourJourney')}</h3><p className="text-sm text-slate-500 mb-4">{t('startJourneyDesc')}</p><Link href="/apply" className="inline-block bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#E31B23] transition-colors">{t('applyNow')}</Link></>
                           )}
                        </div>
                     )}
                  </div>
               </DashboardCard>

               <DashboardCard className={`md:col-span-3 lg:col-span-2 p-0! group relative overflow-hidden ${currentInstruction.isMeeting ? 'bg-[#E31B23]' : 'bg-slate-900'}`} delay={0.1}>
                  {currentInstruction.isMeeting ? (
                     <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#ffffff,transparent)] animate-pulse" />
                  ) : (
                     <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-30 transition-opacity duration-500">
                        {userData.country === "Germany" && <Image src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80" alt="Germany" fill className="object-cover" />}
                        {userData.country === "Belgium" && <Image src="https://images.unsplash.com/photo-1572084682035-c54363297371?auto=format&fit=crop&w=800&q=80" alt="Belgium" fill className="object-cover" />}
                        {!userData.country && <Image src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80" alt="Travel" fill className="object-cover" />}
                     </div>
                  )}
                  
                  <div className="relative z-10 h-full p-8 flex flex-col justify-between text-white">
                     <div className="flex justify-between items-center">
                        <span className="bg-[#E31B23] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-lg">
                           {t('actionRequired')}
                        </span>
                        <Globe size={18} className="opacity-80" />
                     </div>
                     <div>
                        <h3 className="text-3xl font-black tracking-tight leading-none mb-3">{currentInstruction.title}</h3>
                        <p className="text-xs font-bold text-slate-300 opacity-90 max-w-xs leading-relaxed">{currentInstruction.action}</p>
                     </div>
                     
                     <Link href={currentInstruction.link} className="mt-6 w-full py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-2">
                        {currentInstruction.button} <ArrowUpRight size={14} />
                     </Link>
                  </div>
               </DashboardCard>

               {/* LATEST BOOKING STATUS */}
               <DashboardCard className="md:col-span-4 lg:col-span-2 p-0!" delay={0.4}>
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                     <h3 className="font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 text-slate-900"><Clock size={14} className="text-[#E31B23]" /> Latest Appointment</h3>
                     {latestBooking && (
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                           latestBooking.status === 'confirmed' ? 'bg-emerald-500 text-white' : 
                           latestBooking.status === 'rejected' ? 'bg-red-500 text-white' : 
                           'bg-amber-500 text-white'
                        }`}>
                           {latestBooking.status}
                        </span>
                     )}
                  </div>
                  <div className="p-6">
                     {latestBooking ? (
                        <div className="space-y-4">
                           <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-lg">
                                 <Calendar size={24} />
                              </div>
                              <div>
                                 <h4 className="text-lg font-black text-slate-900 leading-tight">{latestBooking.serviceTitle}</h4>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {formatDate(latestBooking.date)} at {latestBooking.time}
                                 </p>
                              </div>
                           </div>
                           
                           <div className={`p-4 rounded-2xl border ${
                              latestBooking.status === 'confirmed' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                              latestBooking.status === 'rejected' ? 'bg-red-50 border-red-100 text-red-800' :
                              'bg-amber-50 border-amber-100 text-amber-800'
                           }`}>
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Current Status</p>
                              <p className="text-sm font-bold">
                                 {latestBooking.status === 'confirmed' ? "Your appointment is confirmed. See you in the meeting room!" : 
                                  latestBooking.status === 'rejected' ? "Unfortunately, this time is unavailable. Please try booking another slot." : 
                                  "Our team is reviewing your request. We will notify you shortly."}
                              </p>
                           </div>

                           {latestBooking.status === 'confirmed' && (
                              <div className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em]">
                                 <CheckCircle2 size={14} /> Appointment Confirmed
                              </div>
                           )}
                        </div>
                     ) : (
                        <div className="py-10 text-center space-y-3">
                           <AlertCircle className="mx-auto text-slate-200" size={40} />
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No appointments found</p>
                           <Link href="/booking" className="inline-block text-[10px] font-black text-[#E31B23] hover:underline uppercase tracking-widest">Book your first appointment →</Link>
                        </div>
                     )}
                  </div>
               </DashboardCard>

               <DashboardCard className="md:col-span-4 lg:col-span-2 p-0! overflow-hidden bg-[#FFF5F5] border-red-100" delay={0.5}>
                  <div className="p-8 h-full flex flex-col justify-center relative">
                     <div className="absolute top-0 right-0 w-32 h-full bg-linear-to-l from-white to-transparent opacity-50" />
                     <h3 className="font-black text-xl text-[#E31B23] mb-4">{t('studyMaterial')}</h3>
                     <div className="grid grid-cols-2 gap-4 relative z-10">
                        <button className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group"><BookOpen size={20} className="text-slate-400 mb-2 group-hover:text-[#E31B23] transition-colors" /><span className="text-xs font-bold text-slate-900 block">{t('languageTips')}</span></button>
                        <button className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group"><Globe size={20} className="text-slate-400 mb-2 group-hover:text-[#E31B23] transition-colors" /><span className="text-xs font-bold text-slate-900 block">{t('cultureGuide')}</span></button>
                     </div>
                  </div>
               </DashboardCard>
            </div>

            {/* ─── MY MATERIALS SECTION ─── */}
            {materials.length > 0 && (
               <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                     <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                        <Folder size={20} />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">Миний материалууд / My Materials</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Хүлээн авсан гарын авлага, маягтууд</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {materials.map((mat, idx) => {
                        const dateObj = new Date(mat.createdAt);
                        const year = dateObj.getFullYear();
                        const month = dateObj.toLocaleString("default", { month: "short" });
                        const day = dateObj.getDate();
                        
                        return (
                           <DashboardCard key={mat._id} className="p-8! flex flex-col justify-between" delay={idx * 0.1}>
                              <div>
                                 <div className="flex justify-between items-start gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-[#E31B23]">
                                       <FileText size={24} />
                                    </div>
                                    <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                                       {mat.category || "File"}
                                    </span>
                                 </div>
                                 <h3 className="text-lg font-black text-slate-900 mb-2 leading-snug">{mat.title}</h3>
                                 {mat.description && (
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">{mat.description}</p>
                                 )}
                              </div>
                              
                              <div className="pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                                 <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    {month} {day}, {year}
                                 </div>
                                 <a
                                    href={mat.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-4 py-2 bg-slate-900 hover:bg-[#E31B23] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                                 >
                                    Татах / Get
                                 </a>
                              </div>
                           </DashboardCard>
                        );
                     })}
                  </div>
               </div>
            )}

            <FullSnapshotSection profile={userData.profile} />
         </div>
      </div>
   );
}