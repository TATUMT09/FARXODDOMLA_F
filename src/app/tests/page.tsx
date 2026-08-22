"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Award,
  BookOpenText,
  Calculator,
  ClipboardListIcon,
  ClockIcon,
  GraduationCap,
  HelpCircleIcon,
  Languages,
  Shuffle,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { TestsNav } from "@/components/tests/tests-nav";
import { TEST_LEVELS, TEST_SUBJECTS } from "@/lib/test-taxonomy";
import { useTestTakerAuth } from "@/providers/test-taker-auth-provider";
import { publicTestsService } from "@/services/public-tests.service";

const SUBJECT_FILTER_ITEMS = [
  { value: "ALL", label: "Barcha fanlar" },
  ...TEST_SUBJECTS.map((s) => ({ value: s, label: s })),
];
const LEVEL_FILTER_ITEMS = [
  { value: "ALL", label: "Barcha darajalar" },
  ...TEST_LEVELS.map((l) => ({ value: l, label: l })),
];

function subjectIcon(subject: string | null) {
  if (subject === "Ona tili") return BookOpenText;
  if (subject === "Matematika") return Calculator;
  if (subject === "Ingliz tili") return Languages;
  return GraduationCap;
}

const ADVANTAGES = [
  {
    icon: BookOpenText,
    title: "Bepul ochiq testlar",
    description:
      "Ro'yxatdan o'ting va istalgan mavzudagi testni bepul yeching — hech qanday to'lov talab qilinmaydi.",
  },
  {
    icon: Shuffle,
    title: "Har safar boshqacha",
    description:
      "Savollar va javob variantlari har bir urinishda aralashtiriladi — bir xil testni qayta yechsangiz ham yodlab olib bo'lmaydi.",
  },
  {
    icon: Sparkles,
    title: "Aniq statistika",
    description:
      "Har bir urinishdan so'ng natijangizni ko'rasiz — nechta to'g'ri, nechta xato, va vaqt o'tishi bilan qanday rivojlanayotganingizni kuzatib borasiz.",
  },
];

export default function PublicTestsPage() {
  const router = useRouter();
  const { status } = useTestTakerAuth();
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [levelFilter, setLevelFilter] = useState("ALL");

  const testsQuery = useQuery({
    queryKey: ["public-tests", subjectFilter, levelFilter],
    queryFn: () =>
      publicTestsService.list({
        subject: subjectFilter === "ALL" ? undefined : subjectFilter,
        level: levelFilter === "ALL" ? undefined : levelFilter,
      }),
  });

  const statsQuery = useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => publicTestsService.platformStats(),
  });

  const handleStart = (testId: string) => {
    if (status !== "authenticated") {
      router.push("/tests/login");
      return;
    }
    router.push(`/tests/${testId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <TestsNav />

      {/* Hero */}
      <section className="bg-orange-50/60 px-4 py-16 text-center md:px-6 md:py-24">
        <Badge className="mb-4 border-orange-200 bg-orange-100 text-orange-600 hover:bg-orange-100">
          IML Testlar
        </Badge>
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          <span className="text-orange-500">IML</span> bilan bilimingizni
          sinab ko&apos;ring
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Ona tili, matematika va ingliz tilidan bepul, ochiq testlar orqali
          o&apos;z darajangizni aniqlang va natijalaringizni kuzating.
        </p>
        <Button
          size="lg"
          className="mt-6 rounded-full bg-orange-500 px-8 text-white hover:bg-orange-600"
          onClick={() =>
            document
              .getElementById("testlar")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Testni boshlash
        </Button>
      </section>

      {/* Advantages */}
      <section className="px-4 py-16 text-center md:px-6">
        <Badge className="mb-4 border-orange-200 bg-orange-100 text-orange-600 hover:bg-orange-100">
          Afzalliklarimiz
        </Badge>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
          O&apos;rganishning yangi yo&apos;lini kashf eting
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Interaktiv testlar, adolatli aralashtirilgan savollar va aniq
          natijalar bilan bilimingizni sinang.
        </p>
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          {ADVANTAGES.map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-3">
              <div className="flex size-16 items-center justify-center rounded-full bg-orange-500 text-white">
                <item.icon className="size-7" />
              </div>
              <h3 className="text-lg font-bold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tests / courses */}
      <section id="testlar" className="bg-orange-50/60 px-4 py-16 md:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Testlarimiz bilan tanishing
          </h2>
          <p className="mt-2 text-muted-foreground">Testlar</p>
        </div>

        <div className="mx-auto mt-8 flex max-w-5xl flex-col gap-3 sm:flex-row sm:justify-center">
          <Select
            value={subjectFilter}
            onValueChange={(value) => setSubjectFilter(value ?? "ALL")}
            items={SUBJECT_FILTER_ITEMS}
          >
            <SelectTrigger className="bg-white sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_FILTER_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={levelFilter}
            onValueChange={(value) => setLevelFilter(value ?? "ALL")}
            items={LEVEL_FILTER_ITEMS}
          >
            <SelectTrigger className="bg-white sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_FILTER_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {testsQuery.isLoading && (
          <p className="mt-8 text-center text-muted-foreground">Yuklanmoqda...</p>
        )}

        {!testsQuery.isLoading && (testsQuery.data?.length ?? 0) === 0 && (
          <Card className="mx-auto mt-8 max-w-md">
            <CardContent>
              <EmptyState
                icon={ClipboardListIcon}
                title="Hozircha testlar yo'q"
                subtitle="Tez orada yangi testlar qo'shiladi"
              />
            </CardContent>
          </Card>
        )}

        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testsQuery.data?.map((test) => {
            const Icon = subjectIcon(test.subject);
            return (
              <Card key={test.id} className="text-center">
                <CardHeader className="items-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <Icon className="size-6" />
                  </div>
                  {test.subject && (
                    <p className="mt-2 text-sm font-semibold text-orange-500">
                      {test.subject}
                    </p>
                  )}
                  <CardTitle>{test.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {test.level && <Badge variant="secondary">{test.level}</Badge>}
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <ClockIcon className="size-4" />
                      {test.durationMinutes} daqiqa
                    </span>
                    <span className="flex items-center gap-1.5">
                      <HelpCircleIcon className="size-4" />
                      {test.questionCount} savol
                    </span>
                  </div>
                  <Button
                    className="w-full rounded-full bg-orange-500 hover:bg-orange-600"
                    onClick={() => handleStart(test.id)}
                  >
                    Boshlash
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-16 text-center md:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
          Natijalar bilan tanishing
        </h2>
        <p className="mt-2 text-muted-foreground">
          Siz ham faol o&apos;rganuvchilar qatoriga qo&apos;shiling.
        </p>
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Users,
              label: "Umumiy foydalanuvchilar",
              value: statsQuery.data?.totalTestTakers ?? 0,
            },
            {
              icon: BookOpenText,
              label: "Mavjud testlar soni",
              value: statsQuery.data?.totalTests ?? 0,
            },
            {
              icon: Award,
              label: "Yakunlangan urinishlar",
              value: statsQuery.data?.totalCertificates ?? 0,
            },
          ].map((item) => (
            <Card key={item.label} className="bg-orange-50/60">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-orange-500 text-white">
                  <item.icon className="size-6" />
                </div>
                <p className="text-3xl font-extrabold">
                  {item.value.toLocaleString("uz-UZ")}
                </p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
