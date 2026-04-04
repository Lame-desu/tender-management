"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, getRoleDashboard } from "@/lib/auth";
import {
  Landmark,
  ArrowRight,
  Shield,
  FileText,
  Users,
  Search,
  Bell,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Scale,
  Eye,
  MessageSquare,
  Award,
  Lock,
  Globe,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(getRoleDashboard(user.role));
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* ─── NAVBAR ─────────────────────────────────────────────── */}
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200">
              <Landmark className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              TenderETH
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#categories" className="hover:text-foreground transition-colors">Categories</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-md shadow-blue-200 font-medium">
                Register Free <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ───────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient + pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm font-medium text-blue-700 mb-6">
              <Zap className="h-3.5 w-3.5" />
              Ethiopia&apos;s Digital Procurement Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Transparent Tender{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Management
              </span>{" "}
              Made Simple
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              A secure online platform for government and private organizations to publish tenders,
              receive and evaluate bids, and award contracts — all in one place.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-200 text-base px-8 h-12">
                  Start Bidding Today <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-base px-8 h-12 border-gray-300">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>

            {/* Stats bar */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { label: "Tender Categories", value: "3+", icon: ClipboardList },
                { label: "Role-Based Access", value: "4", icon: Users },
                { label: "Evaluation Types", value: "2", icon: BarChart3 },
                { label: "Bid Statuses", value: "7+", icon: CheckCircle2 },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-xl p-4 shadow-sm">
                  <stat.icon className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ───────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything You Need to Manage Tenders
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              From publishing to awarding, our platform covers every step of the procurement process.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "Tender Publishing",
                desc: "Create and publish tenders with detailed requirements, eligibility criteria, required documents, and submission deadlines.",
                color: "blue",
              },
              {
                icon: Search,
                title: "Browse & Discover",
                desc: "Bidders can search and filter tenders by category (Goods, Works, Consulting), status, and keywords to find relevant opportunities.",
                color: "emerald",
              },
              {
                icon: ClipboardList,
                title: "Bid Submission",
                desc: "Submit technical and financial proposals with supporting documents including bid security, all through a secure online portal.",
                color: "violet",
              },
              {
                icon: Scale,
                title: "Fair Evaluation",
                desc: "Transparent evaluation with weighted technical and financial scoring. Dedicated evaluators ensure unbiased assessment of every bid.",
                color: "amber",
              },
              {
                icon: Bell,
                title: "Real-Time Notifications",
                desc: "Stay informed with instant notifications for tender updates, bid status changes, evaluation results, and important deadlines.",
                color: "rose",
              },
              {
                icon: MessageSquare,
                title: "Clarifications & Addenda",
                desc: "Bidders can ask questions before the deadline, and officers can issue addenda with updates or deadline extensions.",
                color: "cyan",
              },
              {
                icon: Award,
                title: "Award & Debriefing",
                desc: "Winning bids are selected based on combined scores. Unsuccessful bidders can request formal debriefing sessions.",
                color: "indigo",
              },
              {
                icon: BarChart3,
                title: "Reports & Analytics",
                desc: "Generate PDF reports with tender summaries, bid comparisons, and evaluation results for full audit trails.",
                color: "teal",
              },
              {
                icon: Lock,
                title: "Security & Audit",
                desc: "Role-based access control, JWT authentication, and comprehensive audit logging for every critical action on the platform.",
                color: "slate",
              },
            ].map((feature) => {
              const colorMap: Record<string, string> = {
                blue: "bg-blue-50 text-blue-600",
                emerald: "bg-emerald-50 text-emerald-600",
                violet: "bg-violet-50 text-violet-600",
                amber: "bg-amber-50 text-amber-600",
                rose: "bg-rose-50 text-rose-600",
                cyan: "bg-cyan-50 text-cyan-600",
                indigo: "bg-indigo-50 text-indigo-600",
                teal: "bg-teal-50 text-teal-600",
                slate: "bg-slate-100 text-slate-600",
              };
              return (
                <div
                  key={feature.title}
                  className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${colorMap[feature.color]}`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              Our streamlined procurement process ensures transparency and efficiency at every step.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* For Officers */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm font-semibold text-blue-700 mb-8">
                <Landmark className="h-3.5 w-3.5" />
                For Procurement Officers
              </div>
              <div className="space-y-8">
                {[
                  { step: "1", title: "Create a Tender", desc: "Define requirements, evaluation criteria, required documents, and set submission deadlines." },
                  { step: "2", title: "Publish & Receive Bids", desc: "Publish the tender for bidders to discover. Handle clarification questions and issue addenda as needed." },
                  { step: "3", title: "Assign Evaluators", desc: "Form an evaluation committee and assign qualified evaluators to review submitted bids." },
                  { step: "4", title: "Review & Award", desc: "Review evaluation scores, generate comparison reports, select the winning bid, and notify all bidders." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-200">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Bidders */}
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 text-sm font-semibold text-emerald-700 mb-8">
                <Users className="h-3.5 w-3.5" />
                For Bidders
              </div>
              <div className="space-y-8">
                {[
                  { step: "1", title: "Register & Get Verified", desc: "Create an account with your organization details, TIN number, and trade license. Wait for admin approval." },
                  { step: "2", title: "Browse Open Tenders", desc: "Search published tenders by category (Goods, Works, Consulting) and review eligibility requirements." },
                  { step: "3", title: "Submit Your Bid", desc: "Upload technical and financial documents, bid security, and submit your proposal before the deadline." },
                  { step: "4", title: "Track & Get Results", desc: "Monitor your bid status in real-time. Receive notifications on evaluation outcomes and request debriefing if needed." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-200">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TENDER CATEGORIES ──────────────────────────────────── */}
      <section id="categories" className="py-20 sm:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Categories</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Tender Categories We Support
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              Our platform supports multiple procurement categories to serve diverse organizational needs.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: "Goods",
                desc: "Procurement of physical products including equipment, materials, supplies, and commodities for organizational use.",
                icon: "📦",
                examples: ["Office Equipment", "Medical Supplies", "IT Hardware", "Laboratory Equipment"],
              },
              {
                title: "Works",
                desc: "Construction, renovation, and infrastructure projects including building, roads, and facility maintenance.",
                icon: "🏗️",
                examples: ["Building Construction", "Road Infrastructure", "Renovation Projects", "Facility Maintenance"],
              },
              {
                title: "Consulting",
                desc: "Professional services including advisory, research, auditing, and specialized expertise for various projects.",
                icon: "💼",
                examples: ["Feasibility Studies", "Financial Auditing", "IT Consulting", "Research Projects"],
              },
            ].map((cat) => (
              <div key={cat.title} className="bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-lg transition-all duration-300 text-center">
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">{cat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{cat.desc}</p>
                <div className="space-y-2">
                  {cat.examples.map((ex) => (
                    <div key={ex} className="flex items-center gap-2 text-sm text-gray-600 justify-center">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      {ex}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── USER ROLES ─────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Who It&apos;s For</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Built for Every Stakeholder
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              Dedicated dashboards and workflows tailored to each role in the procurement lifecycle.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                role: "System Admin",
                desc: "Manage users, approvals, monitor system health, and view comprehensive audit logs.",
                icon: Shield,
                gradient: "from-slate-600 to-slate-700",
                shadow: "shadow-slate-200",
              },
              {
                role: "Procurement Officer",
                desc: "Create tenders, manage bids, assign evaluators, generate reports, and award contracts.",
                icon: Landmark,
                gradient: "from-blue-600 to-blue-700",
                shadow: "shadow-blue-200",
              },
              {
                role: "Evaluator",
                desc: "Review assigned bids, score technical and financial proposals, and submit evaluations.",
                icon: Eye,
                gradient: "from-violet-600 to-violet-700",
                shadow: "shadow-violet-200",
              },
              {
                role: "Bidder",
                desc: "Browse tenders, submit proposals with documents, track bid status, and request debriefings.",
                icon: Users,
                gradient: "from-emerald-600 to-emerald-700",
                shadow: "shadow-emerald-200",
              },
            ].map((item) => (
              <div key={item.role} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-5 shadow-md ${item.shadow}`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.role}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT / WHY US ─────────────────────────────────────── */}
      <section id="about" className="py-20 sm:py-28 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-blue-200 uppercase tracking-wider mb-3">About TenderETH</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                Modernizing Public Procurement in Ethiopia
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-6">
                TenderETH is designed to bring transparency, efficiency, and fairness to the tender
                management process. Our platform eliminates paperwork, reduces manual errors, and
                ensures every procurement decision is auditable and compliant.
              </p>
              <p className="text-blue-100 leading-relaxed mb-8">
                Whether you&apos;re a government agency looking to publish tenders or a business
                seeking new contract opportunities, TenderETH provides the tools you need to
                participate in a modern, digital procurement ecosystem.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-xl">
                  Join TenderETH Today <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Globe, title: "Open Access", desc: "Available 24/7 from anywhere" },
                { icon: Shield, title: "Fully Secure", desc: "JWT auth & encrypted data" },
                { icon: Eye, title: "Transparent", desc: "Full audit trail for every action" },
                { icon: Zap, title: "Fast & Modern", desc: "Built with latest technologies" },
              ].map((item) => (
                <div key={item.title} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                  <item.icon className="h-8 w-8 text-blue-200 mb-3" />
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-blue-200 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
            Join TenderETH today to access open tenders, submit bids, and manage your
            procurement activities — all from one secure platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-200 text-base px-8 h-12">
                Register as a Bidder <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-base px-8 h-12">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <Landmark className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">TenderETH</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Ethiopia&apos;s digital procurement platform for transparent and efficient tender management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a></li>
                <li><a href="#categories" className="hover:text-gray-900 transition-colors">Categories</a></li>
                <li><a href="#about" className="hover:text-gray-900 transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Get Started</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/register" className="hover:text-gray-900 transition-colors">Register as Bidder</Link></li>
                <li><Link href="/login" className="hover:text-gray-900 transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><span className="cursor-default">Terms of Service</span></li>
                <li><span className="cursor-default">Privacy Policy</span></li>
                <li><span className="cursor-default">Procurement Guidelines</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-10 pt-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} TenderETH. All rights reserved. Built for transparent procurement.
          </div>
        </div>
      </footer>
    </div>
  );
}
