import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Zap, CheckCircle2, GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <GraduationCap className="size-4 text-white" />
          </div>
          <span className="text-sm font-semibold">Course Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-white"
            asChild
          >
            <Link href="/sign-up">Get started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <Badge
          variant="secondary"
          className="mb-6 gap-1.5 text-xs px-3 py-1.5"
        >
          <Zap className="size-3 text-violet-500" />
          AI-Powered Adaptive Learning
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
          Learn anything with a{" "}
          <span className="text-violet-500">course built for you</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Describe any topic. Get a personalized course with AI-generated
          chapters, exercises, and instant feedback. Learn at your own pace.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            size="lg"
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2 px-6"
            asChild
          >
            <Link href="/sign-up">
              Start learning free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: BookOpen,
              title: "AI-Generated Courses",
              desc: "Just describe a topic. Get a full structured course outline with chapters and exercises in seconds.",
            },
            {
              icon: Zap,
              title: "Adaptive & Progressive",
              desc: "Chapters unlock as you complete exercises. Each chapter builds on what you've learned.",
            },
            {
              icon: CheckCircle2,
              title: "Instant AI Grading",
              desc: "Open-ended exercises graded by AI with detailed feedback. Retry as many times as you need.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="size-9 rounded-lg bg-violet-600/10 flex items-center justify-center mb-4">
                <Icon className="size-5 text-violet-500" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
