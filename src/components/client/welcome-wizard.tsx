"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ChevronRight,
  ChevronLeft,
  Dumbbell,
  Calendar,
  Target,
  User,
  CheckCircle2,
} from "lucide-react"

interface ClientData {
  fitnessLevel: string
  goals: string[]
}

interface TrainerData {
  name: string
}

interface RoutineData {
  name: string
  difficulty: string
  duration: number
  description?: string
}

interface AssignmentData {
  routine: RoutineData
  startDate: string
}

interface WelcomeWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: ClientData
  trainer: TrainerData | null
  activeAssignment: AssignmentData | null
  onComplete: () => void
}

const STEPS = ["Welcome", "Goals", "Routine", "Get Started"]

const difficultyColors: Record<string, string> = {
  beginner:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function WelcomeWizard({
  open,
  onOpenChange,
  client,
  trainer,
  activeAssignment,
  onComplete,
}: WelcomeWizardProps) {
  const [step, setStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  const handleFinish = async () => {
    setIsCompleting(true)
    try {
      const res = await fetch("/api/clients/me/onboarding", {
        method: "PUT",
      })
      if (res.ok) {
        onComplete()
        onOpenChange(false)
      }
    } finally {
      setIsCompleting(false)
    }
  }

  const handleSkip = async () => {
    const res = await fetch("/api/clients/me/onboarding", {
      method: "PUT",
    })
    if (res.ok) {
      onComplete()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Welcome to Body Trainer</DialogTitle>
          <div className="flex items-center gap-2 pt-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-medium ${
                    i < step
                      ? "bg-green-600 text-white"
                      : i === step
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {i < step ? <CheckCircle2 className="size-3.5" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px w-6 ${i < step ? "bg-green-600" : "bg-zinc-200 dark:bg-zinc-800"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Step 1: Welcome */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-6">
              <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Dumbbell className="size-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Welcome!
              </h3>
              <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
                Your trainer has set up your fitness journey. Let&apos;s take a
                quick look at what&apos;s waiting for you.
              </p>
            </div>

            {trainer && (
              <div className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <User className="size-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Your Trainer
                  </p>
                  <p className="text-xs text-zinc-500">{trainer.name}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleSkip}>
                Skip Tour
              </Button>
              <Button onClick={() => setStep(1)}>
                Next
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Goals */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Target className="size-6 text-blue-600" />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Your Goals
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Here&apos;s what you&apos;re working towards
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={difficultyColors[client.fitnessLevel]}>
                  {client.fitnessLevel}
                </Badge>
                <span className="text-xs text-zinc-500">Fitness Level</span>
              </div>

              {client.goals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {client.goals.map((goal) => (
                    <Badge key={goal} variant="secondary">
                      {goal}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  No goals set yet. Your trainer can add these later.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ChevronLeft className="mr-1 size-4" />
                Back
              </Button>
              <Button onClick={() => setStep(2)}>
                Next
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Routine */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Calendar className="size-6 text-orange-600" />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Your Routine
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                {activeAssignment
                  ? "You have a routine ready to go"
                  : "No routine assigned yet"}
              </p>
            </div>

            {activeAssignment ? (
              <div className="rounded-lg border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {activeAssignment.routine.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                      <Badge
                        variant="outline"
                        className={
                          difficultyColors[activeAssignment.routine.difficulty]
                        }
                      >
                        {activeAssignment.routine.difficulty}
                      </Badge>
                      <span className="inline-flex items-center gap-1">
                        <Dumbbell className="size-3" />
                        {activeAssignment.routine.duration} min
                      </span>
                    </div>
                    {activeAssignment.routine.description && (
                      <p className="mt-2 text-xs text-zinc-500">
                        {activeAssignment.routine.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center">
                <Dumbbell className="mx-auto size-8 text-zinc-400" />
                <p className="mt-2 text-sm text-zinc-500">
                  Your trainer will assign a routine soon.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-1 size-4" />
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Get Started */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-6">
              <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="size-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                You&apos;re All Set!
              </h3>
              <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
                You&apos;re ready to start your fitness journey. Head to your
                dashboard to view your routines and track your progress.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={handleFinish} disabled={isCompleting}>
                {isCompleting ? "Saving..." : "Get Started"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
