"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { studentsService } from "@/services/students.service";
import type { Student } from "@/types/student";

interface StudentPickerProps {
  value: Student | null;
  onChange: (student: Student | null) => void;
}

export function StudentPicker({ value, onChange }: StudentPickerProps) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useQuery({
    queryKey: ["students-picker", debounced],
    queryFn: () => studentsService.list({ search: debounced, limit: 8 }),
    enabled: debounced.length > 0,
  });

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-lg border px-3 py-2">
        <div>
          <div className="text-sm font-medium">{value.fullName}</div>
          <div className="font-mono text-xs text-muted-foreground">
            {value.studentCode}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onChange(null)}
        >
          <XIcon />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Ism yoki Student ID bo'yicha qidiring..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {debounced.length > 0 && (
        <div className="max-h-48 overflow-y-auto rounded-lg border">
          {query.isLoading && (
            <div className="p-3 text-sm text-muted-foreground">
              Qidirilmoqda...
            </div>
          )}
          {!query.isLoading && query.data?.data.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">
              O&apos;quvchi topilmadi
            </div>
          )}
          {query.data?.data.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => {
                onChange(student);
                setSearch("");
              }}
              className="flex w-full flex-col items-start gap-0.5 border-b px-3 py-2 text-left text-sm last:border-0 hover:bg-accent"
            >
              <span className="font-medium">{student.fullName}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {student.studentCode}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
