import Link from "next/link";
import {
  ShieldCheck, MapPin, MessageCircle, BookOpen,
  Monitor, Home, Gift, FileText, ArrowRight, Users, Store, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { name: "Textbooks", icon: BookOpen, href: "/browse?category=TEXTBOOKS", color: "bg-blue-100 text-blue-700" },
  { name: "Electronics", icon: Monitor, href: "/browse?category=ELECTRONICS", color: "bg-purple-100 text-purple-700" },
  { name: "Dorm Essentials", icon: Home, href: "/browse?category=DORM_ESSENTIALS", color: "bg-orange-100 text-orange-700" },
  { name: "Free Donations", icon: Gift, href: "/browse?category=FREE_DONATIONS", color: "bg-green-100 text-green-700" },
  { name: "Study Notes", icon: FileText, href: "/notes", color: "bg-pink-100 text-pink-700" },
];

const features = [
  { title: "Verified Students Only", desc: "Every account is verified with an institutional .edu email — no anonymous scammers.", icon: ShieldCheck, color: "text-green-600 bg-green-100" },
  { title: "Safe Campus Meetups", desc: "Exchange items at pre-designated safe zones like the Library Foyer or Student Union.", icon: MapPin, color: "text-blue-600 bg-blue-100" },
  { title: "In-App Chat", desc: "Negotiate and arrange exchanges without sharing personal phone numbers.", icon: MessageCircle, color: "text-purple-600 bg-purple-100" },
];

const steps = [
  { step: "01", title: "Sign Up with .edu Email", desc: "Create your account with your university email to verify your student identity." },
  { step: "02", title: "List or Browse", desc: "Post items for sale, browse listings, or share study notes with your campus community." },
  { step: "03", title: "Meet & Exchange Safely", desc: "Chat with verified peers, set a safe meetup point, and complete the exchange." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-blue-300 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Your Campus.
              <br />
              <span className="text-blue-200">Your Marketplace.</span>
            </h1>
            <p className="mt-6 text-lg text-blue-100 sm:text-xl max-w-2xl">
              The trusted peer-to-peer marketplace built exclusively for university students.
              Buy, sell, and share textbooks, electronics, dorm essentials, and study notes —
              all within your verified campus community.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/browse">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg gap-2 text-base font-semibold">
                  Browse Items <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/items/new">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2 text-base font-semibold">
                  Post a Listing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600 sm:text-3xl">500+</p>
              <p className="mt-1 text-sm text-gray-500">Active Listings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 sm:text-3xl">50+</p>
              <p className="mt-1 text-sm text-gray-500">Campuses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 sm:text-3xl">10K+</p>
              <p className="mt-1 text-sm text-gray-500">Students</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why CampusShare?</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">Built with student safety and trust at its core.</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`inline-flex rounded-xl p-3 ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="mt-3 text-gray-600">Find exactly what you need for campus life.</p>
          </div>
          <div className="mt-12 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className={`rounded-xl p-3 ${cat.color} group-hover:scale-110 transition-transform`}>
                  <cat.icon className="h-7 w-7" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-3 text-gray-600">Get started in three simple steps.</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="relative rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
                <span className="text-4xl font-extrabold text-blue-100">{s.step}</span>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <CheckCircle className="mx-auto h-12 w-12 text-blue-200" />
          <h2 className="mt-4 text-3xl font-bold">Ready to Join Your Campus Marketplace?</h2>
          <p className="mt-4 text-lg text-blue-100">
            Sign up with your university email and start trading with trusted peers today.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
