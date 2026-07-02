"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, CalendarCheck2, TrendingUp, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heatmap } from "@/components/Heatmap";
import { buildHeatmapWeeks, getTodayKey } from "@/lib/heatmap";
import { cn } from "@/lib/utils";

const PREVIEW_WEEKS = 20;

const FEATURES = [
  {
    icon: CalendarCheck2,
    title: "One-tap check-ins",
    description: "Mark a habit done for any day with a single click, right on the calendar.",
  },
  {
    icon: TrendingUp,
    title: "Visual streaks",
    description: "A full year of history at a glance, in a GitHub-style heatmap of your consistency.",
  },
  {
    icon: Lock,
    title: "Yours, and only yours",
    description: "Your habits are private to your account. No feeds, no followers, no noise.",
  },
];

function usePreviewHeatmap() {
  const { weeks, monthLabels } = useMemo(() => buildHeatmapWeeks(PREVIEW_WEEKS), []);
  const todayKey = useMemo(() => getTodayKey(), []);
  const checkedKeys = useMemo(() => {
    const keys = new Set<string>();
    const pastCells = weeks.flat().filter((cell) => cell.key <= todayKey);
    pastCells.forEach((cell, idx) => {
      // simulate an active current streak for the most recent stretch
      if (idx >= pastCells.length - 6 || Math.random() < 0.45) {
        keys.add(cell.key);
      }
    });
    return keys;
  }, [weeks, todayKey]);

  return { weeks, monthLabels, todayKey, checkedKeys };
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const preview = usePreviewHeatmap();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-base font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Flame className="size-4" />
            </span>
            hTracker
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
              Log in
            </Link>
            <Link href="/signup" className={cn(buttonVariants({ variant: "default" }))}>
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-16 lg:flex-row lg:items-center lg:gap-16 lg:py-24">
          <div className="flex flex-1 flex-col gap-6">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
              Build habits that actually stick.
            </h1>
            <p className="max-w-md text-base text-muted-foreground">
              hTracker turns daily check-ins into a year-long streak map, so you can see your
              consistency instead of guessing at it.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className={cn(buttonVariants({ variant: "default", size: "lg" }), "px-5")}
              >
                Get started free
                <ArrowRight />
              </Link>
              <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                Log in
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">Free forever. No credit card needed.</p>
          </div>

          <div className="flex-1">
            <Card>
              <CardContent>
                <p className="mb-3 text-sm font-medium text-foreground">Morning Run</p>
                <Heatmap
                  weeks={preview.weeks}
                  monthLabels={preview.monthLabels}
                  checkedKeys={preview.checkedKeys}
                  todayKey={preview.todayKey}
                  onToggle={() => {}}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-t bg-card">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <p className="font-medium text-foreground">{feature.title}</p>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold text-foreground">Ready to build your streak?</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Create your first habit in under a minute.
          </p>
          <Link
            href="/signup"
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "mt-6 px-5")}
          >
            Get started free
            <ArrowRight />
          </Link>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-muted-foreground">
          hTracker: track your habits, one day at a time.
        </div>
      </footer>
    </div>
  );
}
