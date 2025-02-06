"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import { supabase } from '@/lib/supabase';

const inter = Inter({ subsets: ['latin'] });
const anke = Noto_Sans_Devanagari({ 
  weight: ['700'],
  subsets: ['devanagari'] 
});

const schema = yup.object({
  email: yup.string().email("Please enter a valid email").required("Email is required"),
  phone: yup.string().matches(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number").optional(),
  userTypes: yup.array(yup.string()).min(1, "Please select at least one option").required(),
}).required();

type FormData = yup.InferType<typeof schema>;

const testimonials = [
  {
    name: "Coming Soon",
    platform: "Early Access",
    comment: "Real user testimonials will be displayed here once our early access program begins. Join the waitlist to be one of the first to share your experience!",
    avatar: "/avatars/placeholder.jpg",
    rating: 5,
  },
];

const features = [
  {
    icon: "🚀",
    title: "Instant Relief",
    description: "AI-guided support when you need it most",
  },
  {
    icon: "🧘",
    title: "Grounding on Demand",
    description: "Meditations & exercises designed to actually work",
  },
  {
    icon: "📊",
    title: "Therapist-Approved",
    description: "Auto-logs sessions so your therapist gets real insights, not just guesswork",
  },
];

// Add theme type and colors object
type Theme = 'light' | 'dark';

const colors = {
  light: {
    background: '#F8FAFC',
    text: '#1E293B',
    muted: '#475569',
    mutedSecondary: '#64748B',
    placeholder: '#94A3B8',
    border: '#E2E8F0',
    cardBg: 'white',
    primary: '#60A5FA',
    secondary: '#818CF8',
    tertiary: '#38BDF8',
  },
  dark: {
    background: '#0A0F1A',
    text: '#F8FAFC',
    muted: 'rgba(248, 250, 252, 0.8)',
    mutedSecondary: 'rgba(248, 250, 252, 0.6)',
    placeholder: 'rgba(248, 250, 252, 0.4)',
    border: '#1E293B',
    cardBg: '#111827',
    primary: '#60A5FA',
    secondary: '#818CF8',
    tertiary: '#38BDF8',
    inputBg: '#0F172A',
  },
};

export default function Home() {
  const [theme, setTheme] = useState<Theme>('light');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [signupNumber, setSignupNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      phone: "",
      userTypes: [] as string[],
    }
  });

  const userTypes = watch("userTypes") || [];

  const toggleUserType = (type: string) => {
    const currentTypes = userTypes;
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    setValue("userTypes", newTypes);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      
      // Check for duplicate email
      const { data: existingSignup } = await supabase
        .from('signups')
        .select('id')
        .eq('email', data.email)
        .single();

      if (existingSignup) {
        return;
      }

      // Insert new signup
      const { error: insertError } = await supabase
        .from('signups')
        .insert([
          {
            email: data.email,
            phone: data.phone || null,
            user_types: data.userTypes,
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      // Get total signup count
      const { count } = await supabase
        .from('signups')
        .select('*', { count: 'exact', head: true });

      setSignupNumber(count);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Form submission error:', error);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <main className={`${inter.className} min-h-screen relative overflow-hidden ${
      theme === 'light' ? 'bg-[#F8FAFC] text-[#1E293B]' : 'bg-[#0A0F1A] text-[#F8FAFC]'
    }`}>
      {/* Theme Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className={`fixed top-6 right-6 z-50 p-2.5 rounded-xl flex items-center gap-2 transition-all duration-500 ${
          theme === 'light'
            ? 'bg-white text-[#1E293B] shadow-lg shadow-black/5 border border-slate-200 hover:border-slate-300'
            : 'bg-[#111827] text-[#F8FAFC] shadow-lg shadow-black/20 border border-[#1E293B] hover:border-[#2C4875]'
        }`}
      >
        <motion.div
          initial={false}
          animate={{ rotate: theme === 'light' ? 0 : 180 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="relative w-5 h-5"
        >
          <div className={`absolute inset-0 transition-all duration-500 ${
            theme === 'light'
              ? 'opacity-100 rotate-0'
              : 'opacity-0 rotate-180'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          </div>
          <div className={`absolute inset-0 transition-all duration-500 ${
            theme === 'light'
              ? 'opacity-0 rotate-180'
              : 'opacity-100 rotate-0'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          </div>
        </motion.div>
        <span className="text-sm font-medium">{theme === 'light' ? 'Dark' : 'Light'}</span>
      </motion.button>

      {/* Base gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b opacity-90 ${
        theme === 'light'
          ? 'from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0]'
          : 'from-[#0A0F1A] via-[#111827] to-[#1E293B]'
      }`}></div>

      {/* Animated gradients */}
      <div className="absolute inset-0">
        {theme === 'light' ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#60A5FA_0%,transparent_60%)] opacity-[0.07] animate-[wave_8s_ease-in-out_infinite]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,#818CF8_0%,transparent_50%)] opacity-[0.05] animate-[wave_12s_ease-in-out_infinite_1s]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,#38BDF8_0%,transparent_55%)] opacity-[0.06] animate-[wave_10s_ease-in-out_infinite_2s]"></div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#60A5FA_0%,transparent_60%)] opacity-[0.08] animate-[wave_8s_ease-in-out_infinite]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,#818CF8_0%,transparent_50%)] opacity-[0.06] animate-[wave_12s_ease-in-out_infinite_1s]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,#38BDF8_0%,transparent_55%)] opacity-[0.07] animate-[wave_10s_ease-in-out_infinite_2s]"></div>
          </>
        )}
      </div>

      {/* Ethereal light rays */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 left-[20%] w-[300px] h-[1000px] opacity-[0.05] blur-[100px] rotate-[25deg] animate-[rays_6s_ease-in-out_infinite] ${
          theme === 'light' ? 'bg-[#60A5FA]' : 'bg-[#60A5FA]'
        }`}></div>
        <div className={`absolute top-0 right-[20%] w-[300px] h-[800px] opacity-[0.05] blur-[100px] rotate-[-25deg] animate-[rays_8s_ease-in-out_infinite_2s] ${
          theme === 'light' ? 'bg-[#818CF8]' : 'bg-[#818CF8]'
        }`}></div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12 sm:px-6 lg:px-8 relative min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="max-w-[1200px] mx-auto flex-grow">
          {/* Hero Section */}
          <div className="text-center max-w-6xl mx-auto mb-10 pt-4 sm:pt-6 lg:pt-8">
            <h1 className={`${anke.className} text-6xl sm:text-7xl lg:text-9xl font-bold mb-3 tracking-tight relative`}>
              <span className="absolute inset-0 bg-[length:400%_400%] bg-gradient-to-r from-[#2DD4BF] via-[#60A5FA] to-[#A78BFA] opacity-25 blur-3xl animate-flow"></span>
              <span className="relative bg-clip-text text-transparent bg-[length:400%_400%] bg-gradient-to-r from-[#2DD4BF] via-[#60A5FA] to-[#A78BFA] animate-flow">
                Panic Button
              </span>
            </h1>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start w-full">
            {/* Left Column - Sign Up Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="order-2 lg:order-1"
            >
              {/* Form Section */}
              {!isSubmitted ? (
                <motion.form
                  onSubmit={handleSubmit(onSubmit)}
                  className={`space-y-8 backdrop-blur-xl p-8 sm:p-10 rounded-xl transition-all duration-300 shadow-xl border-2 ${
                    theme === 'light'
                      ? 'bg-white/90 border-[#E2E8F0]'
                      : 'bg-[#111827]/90 border-[#1E293B]'
                  }`}
                >
                  <div className="space-y-6">
                    <div>
                      <label className={`block text-lg font-medium mb-3 ${
                        theme === 'light' ? 'text-[#1E293B]' : 'text-[#F8FAFC]'
                      }`}>Email address</label>
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="Enter your email"
                        className={`w-full px-5 py-4 rounded-lg border-2 transition-all duration-300 text-lg outline-none ${
                          theme === 'light'
                            ? 'bg-white border-[#E2E8F0] focus:border-[#60A5FA] focus:ring-2 focus:ring-[#60A5FA]/20 text-[#1E293B] placeholder-[#94A3B8]'
                            : 'bg-[#0F172A] border-[#1E293B] focus:border-[#60A5FA] focus:ring-2 focus:ring-[#60A5FA]/20 text-[#F8FAFC] placeholder-[#F8FAFC]/40'
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-3 text-[#60A5FA] text-base font-medium">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-lg font-medium mb-3 ${
                        theme === 'light' ? 'text-[#1E293B]' : 'text-[#F8FAFC]'
                      }`}>Phone number (optional)</label>
                      <input
                        {...register("phone")}
                        type="tel"
                        placeholder="Enter your phone number"
                        className={`w-full px-5 py-4 rounded-lg border-2 transition-all duration-300 text-lg outline-none ${
                          theme === 'light'
                            ? 'bg-white border-[#E2E8F0] focus:border-[#60A5FA] focus:ring-2 focus:ring-[#60A5FA]/20 text-[#1E293B] placeholder-[#94A3B8]'
                            : 'bg-[#0F172A] border-[#1E293B] focus:border-[#60A5FA] focus:ring-2 focus:ring-[#60A5FA]/20 text-[#F8FAFC] placeholder-[#F8FAFC]/40'
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-3 text-[#60A5FA] text-base font-medium">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className={`block text-lg font-medium ${
                        theme === 'light' ? 'text-[#1E293B]' : 'text-[#F8FAFC]'
                      }`}>I am a: (select all that apply)</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => toggleUserType("individual")}
                          className={`group px-5 py-4 rounded-lg border-2 text-base flex items-center justify-center gap-3 transition-all duration-300 ${
                            userTypes.includes("individual")
                              ? theme === 'light'
                                ? 'border-[#60A5FA] bg-[#60A5FA]/10 text-[#1E293B]'
                                : 'border-[#60A5FA] bg-[#60A5FA]/10 text-[#F8FAFC]'
                              : theme === 'light'
                                ? 'border-[#E2E8F0] hover:border-[#60A5FA] hover:bg-[#60A5FA]/5 text-[#64748B] hover:text-[#1E293B]'
                                : 'border-[#1E293B] hover:border-[#60A5FA] hover:bg-[#60A5FA]/5 text-[#F8FAFC]/60 hover:text-[#F8FAFC]'
                          }`}
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform duration-300">👤</span>
                          Individual User
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleUserType("healthcare")}
                          className={`group px-5 py-4 rounded-lg border-2 text-base flex items-center justify-center gap-3 transition-all duration-300 ${
                            userTypes.includes("healthcare")
                              ? theme === 'light'
                                ? 'border-[#60A5FA] bg-[#60A5FA]/10 text-[#1E293B]'
                                : 'border-[#60A5FA] bg-[#60A5FA]/10 text-[#F8FAFC]'
                              : theme === 'light'
                                ? 'border-[#E2E8F0] hover:border-[#60A5FA] hover:bg-[#60A5FA]/5 text-[#64748B] hover:text-[#1E293B]'
                                : 'border-[#1E293B] hover:border-[#60A5FA] hover:bg-[#60A5FA]/5 text-[#F8FAFC]/60 hover:text-[#F8FAFC]'
                          }`}
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform duration-300">👨‍⚕️</span>
                          Healthcare Provider
                        </button>
                      </div>
                      {errors.userTypes && (
                        <p className="mt-2 text-[#60A5FA] text-base font-medium">{errors.userTypes.message}</p>
                      )}
                    </div>
                  </div>

                  {error && (
                    <p className="mt-3 text-red-500 text-base font-medium text-center">
                      {error}
                    </p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-gradient-to-r from-[#60A5FA] via-[#818CF8] to-[#38BDF8] text-white font-bold py-5 px-8 rounded-lg transition-all duration-300 text-xl shadow-lg hover:shadow-xl hover:shadow-[#60A5FA]/20"
                    type="submit"
                  >
                    Reserve My Spot
                  </motion.button>
                  <p className={`text-base text-center font-medium ${
                    theme === 'light' ? 'text-[#94A3B8]' : 'text-[#F8FAFC]/40'
                  }`}>
                    By joining, you agree to our Terms of Service and Privacy Policy
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className={`backdrop-blur-xl p-8 rounded-xl transition-all duration-300 shadow-sm border ${
                    theme === 'light'
                      ? 'bg-white/80 border-[#E2E8F0]'
                      : 'bg-[#111827]/80 border-[#1E293B]'
                  }`}
                >
                  {signupNumber && (
                    <div className={`mb-6 p-4 rounded-lg backdrop-blur-xl border-2 ${
                      theme === 'light' 
                        ? 'bg-[#60A5FA]/5 border-[#60A5FA]/20' 
                        : 'bg-[#60A5FA]/10 border-[#60A5FA]/20'
                    }`}>
                      <p className={`text-center ${
                        theme === 'light' ? 'text-[#1E293B]' : 'text-[#F8FAFC]'
                      }`}>
                        <span className="block text-sm font-medium mb-1">You are</span>
                        <span className={`${anke.className} text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2DD4BF] via-[#60A5FA] to-[#A78BFA] animate-flow`}>
                          #{signupNumber}
                        </span>
                        <span className="block text-sm font-medium mt-1">to join the waitlist! 🎉</span>
                      </p>
                    </div>
                  )}
                  <p className={`text-base mb-6 ${
                    theme === 'light' ? 'text-[#64748B]' : 'text-[#F8FAFC]/60'
                  }`}>
                    Thank you for joining! Help spread the word about Panic Button and let others know about this anxiety support companion.
                  </p>
                  <div className="space-y-4">
                    <p className={`text-sm font-medium ${
                      theme === 'light' ? 'text-[#1E293B]' : 'text-[#F8FAFC]'
                    }`}>Share on:</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.open('https://twitter.com/intent/tweet?text=Just%20joined%20the%20waitlist%20for%20@PanicButton%20-%20an%20AI-powered%20anxiety%20support%20companion%20that%20helps%20you%20through%20panic%20attacks%20in%20real-time.%20🌟')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                          theme === 'light'
                            ? 'bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20'
                            : 'bg-[#1DA1F2]/20 text-[#1DA1F2] hover:bg-[#1DA1F2]/30'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span className="text-sm font-medium">X (Twitter)</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.open('https://www.instagram.com/create/story')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                          theme === 'light'
                            ? 'bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F]/20'
                            : 'bg-[#E4405F]/20 text-[#E4405F] hover:bg-[#E4405F]/30'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.384 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                        </svg>
                        <span className="text-sm font-medium">Instagram</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.open('https://www.threads.net')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                          theme === 'light'
                            ? 'bg-[#000000]/10 text-[#000000] hover:bg-[#000000]/20'
                            : 'bg-[#FFFFFF]/20 text-[#FFFFFF] hover:bg-[#FFFFFF]/30'
                        }`}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 192 192" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"/>
                        </svg>
                        <span className="text-sm font-medium">Threads</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.open('https://www.facebook.com/sharer/sharer.php?u=https://panicbutton.app')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                          theme === 'light'
                            ? 'bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20'
                            : 'bg-[#1877F2]/20 text-[#1877F2] hover:bg-[#1877F2]/30'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
                        </svg>
                        <span className="text-sm font-medium">Facebook</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.open('https://www.linkedin.com/sharing/share-offsite/?url=https://panicbutton.app')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                          theme === 'light'
                            ? 'bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20'
                            : 'bg-[#0A66C2]/20 text-[#0A66C2] hover:bg-[#0A66C2]/30'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        <span className="text-sm font-medium">LinkedIn</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Trust Indicators */}
              <div className={`mt-6 flex flex-wrap justify-center lg:justify-start items-center gap-4 text-sm font-medium ${
                theme === 'light' ? 'text-[#64748B]' : 'text-[#F8FAFC]/60'
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#60A5FA]">★</span>
                  <span>Early Access Program</span>
                </div>
                <div className={`h-3 w-px ${
                  theme === 'light' ? 'bg-[#E2E8F0]' : 'bg-[#1E293B]'
                }`}></div>
                <span>HIPAA Compliant</span>
                <div className={`h-3 w-px ${
                  theme === 'light' ? 'bg-[#E2E8F0]' : 'bg-[#1E293B]'
                }`}></div>
                <span>End-to-End Encrypted</span>
              </div>
            </motion.div>

            {/* Right Column - Features & Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="order-1 lg:order-2 space-y-8"
            >
              {/* Main Description */}
              <div className={`text-base sm:text-lg leading-relaxed ${
                theme === 'light' ? 'text-[#475569]' : 'text-[#F8FAFC]/80'
              }`}>
                <p>
                  This AI-powered voice assistant talks you through panic in real-time, logs your sessions automatically, and gives your therapist actual data—not just vibes—so they can help you faster.
                </p>
              </div>

              {/* Features Section */}
              <div className="mb-8">
                <h2 className={`${anke.className} text-lg font-bold mb-3 ${
                  theme === 'light' ? 'text-[#1E293B]' : 'text-[#F8FAFC]'
                }`}>
                  What makes it a no-brainer?
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl transition-all duration-300 shadow-sm ${
                        theme === 'light'
                          ? 'bg-white border-[#E2E8F0] hover:border-[#60A5FA] hover:bg-[#60A5FA]/5'
                          : 'bg-[#111827] border-[#1E293B] hover:border-[#60A5FA] hover:bg-[#60A5FA]/5'
                      } border`}
                    >
                      <span className="text-xl">{feature.icon}</span>
                      <div>
                        <div className={`${anke.className} text-sm font-bold ${
                          theme === 'light' ? 'text-[#1E293B]' : 'text-[#F8FAFC]'
                        }`}>{feature.title}</div>
                        <div className={`text-xs ${
                          theme === 'light' ? 'text-[#475569]' : 'text-[#F8FAFC]/60'
                        }`}>{feature.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`backdrop-blur-xl p-6 rounded-xl transition-all duration-300 shadow-sm border relative ${
                    theme === 'light'
                      ? 'bg-white/80 border-[#E2E8F0] hover:border-[#60A5FA]/50 hover:bg-[#60A5FA]/5'
                      : 'bg-[#111827]/80 border-[#1E293B] hover:border-[#60A5FA]/50 hover:bg-[#60A5FA]/5'
                  }`}
                >
                  <div className="h-full px-8">
                    <div className={`text-sm font-medium mb-4 ${
                      theme === 'light' ? 'text-[#60A5FA]' : 'text-[#60A5FA]'
                    }`}>
                      ✨ Testimonials Coming Soon
                    </div>
                    <p className={`text-base italic mb-5 leading-relaxed ${
                      theme === 'light' ? 'text-[#64748B]' : 'text-[#F8FAFC]/70'
                    }`}>{testimonials[0].comment}</p>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        theme === 'light'
                          ? 'bg-[#60A5FA]/10 text-[#60A5FA]'
                          : 'bg-[#60A5FA]/20 text-[#60A5FA]'
                      }`}>
                        <span className="text-lg">✨</span>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${
                          theme === 'light' ? 'text-[#1E293B]' : 'text-[#F8FAFC]'
                        }`}>{testimonials[0].name}</p>
                        <p className={`text-xs ${
                          theme === 'light' ? 'text-[#94A3B8]' : 'text-[#F8FAFC]/50'
                        }`}>{testimonials[0].platform}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes wave {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-1%) scale(1.02);
          }
        }

        @keyframes rays {
          0%, 100% {
            opacity: 0.03;
            transform: rotate(25deg) translateY(0);
          }
          50% {
            opacity: 0.05;
            transform: rotate(25deg) translateY(-2%);
          }
        }

        @keyframes float1 {
          0% { transform: translate(20vw, 100vh); }
          100% { transform: translate(25vw, -10vh); }
        }

        @keyframes float2 {
          0% { transform: translate(60vw, 100vh); }
          100% { transform: translate(55vw, -10vh); }
        }

        @keyframes float3 {
          0% { transform: translate(80vw, 100vh); }
          100% { transform: translate(75vw, -10vh); }
        }

        .animate-float1 {
          animation: float1 20s linear infinite;
        }

        .animate-float2 {
          animation: float2 25s linear infinite;
        }

        .animate-float3 {
          animation: float3 22s linear infinite;
        }

        @keyframes flow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-flow {
          animation: flow 10s ease infinite;
        }
      `}</style>
    </main>
  );
}

