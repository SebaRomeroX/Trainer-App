"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CreateClientSchema,
  type CreateClientInput,
} from "@/validators/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Check,
  Copy,
  ChevronRight,
  ChevronLeft,
  Dumbbell,
  Clock,
  User,
  Key,
  ClipboardList,
  CheckCircle2,
  SkipForward,
} from "lucide-react"

interface RoutineData {
  _id: string
  name: string
  description?: string
  difficulty: string
  duration: number
}

interface CreatedClient {
  _id: string
  userId: { _id: string; name: string; email: string }
  fitnessLevel: string
  goals: string[]
  notes?: string
  startDate?: string
}

interface ClientOnboardingWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

const STEPS = ["Client Info", "Credentials", "Initial Routine", "Summary"]

const difficultyColors: Record<string, string> = {
  beginner:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function ClientOnboardingWizard({
  open,
  onOpenChange,
  onComplete,
}: ClientOnboardingWizardProps) {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdClient, setCreatedClient] = useState<CreatedClient | null>(null)
  const [tempPassword, setTempPassword] = useState("")
  const [copied, setCopied] = useState(false)
  const [routines, setRoutines] = useState<RoutineData[]>([])
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: zodResolver(CreateClientSchema),
    defaultValues: {
      name: "",
      email: "",
      fitnessLevel: "beginner" as "beginner" | "intermediate" | "advanced",
      goals: [],
      notes: "",
    },
  })

  const fitnessLevel = watch("fitnessLevel")

  useEffect(() => {
    if (!open) {
      setStep(0)
      setCreatedClient(null)
      setTempPassword("")
      setCopied(false)
      setSelectedRoutineId(null)
    }
  }, [open])

  const handleGoalsInput = (value: string) => {
    const items = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    setValue("goals", items, { shouldValidate: true })
  }

  const onSubmitStep1 = async (data: CreateClientInput) => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const result = await res.json()
        setCreatedClient(result.client)
        setTempPassword(result.tempPassword)
        setStep(1)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (step === 2) {
      fetch("/api/routines")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.routines) setRoutines(data.routines)
        })
        .catch(() => {})
    }
  }, [step])

  const handleAssignRoutine = async () => {
    if (!selectedRoutineId || !createdClient) return
    setIsAssigning(true)
    try {
      const res = await fetch(`/api/routines/${selectedRoutineId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: createdClient._id }),
      })
      if (res.ok) {
        setStep(3)
      }
    } finally {
      setIsAssigning(false)
    }
  }

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFinish = () => {
    onComplete()
    onOpenChange(false)
  }

  const selectedRoutine = routines.find((r) => r._id === selectedRoutineId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
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
                  {i < step ? <Check className="size-3.5" /> : i + 1}
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

        {/* Step 1: Client Info */}
        {step === 0 && (
          <form onSubmit={handleSubmit(onSubmitStep1)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="onb-name">Name</Label>
              <Input
                id="onb-name"
                placeholder="Client's full name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="onb-email">Email</Label>
              <Input
                id="onb-email"
                type="email"
                placeholder="client@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fitness Level</Label>
              <Select
                value={fitnessLevel}
                onValueChange={(val) =>
                  setValue(
                    "fitnessLevel",
                    val as CreateClientInput["fitnessLevel"],
                    { shouldValidate: true }
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              {errors.fitnessLevel && (
                <p className="text-sm text-red-500">
                  {errors.fitnessLevel.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="onb-goals">Goals</Label>
              <Input
                id="onb-goals"
                placeholder="e.g. Weight loss, Muscle gain"
                defaultValue=""
                onBlur={(e) => handleGoalsInput(e.target.value)}
              />
              <p className="text-xs text-zinc-500">Comma-separated</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="onb-notes">Notes</Label>
              <Textarea
                id="onb-notes"
                placeholder="Optional notes about the client..."
                rows={2}
                {...register("notes")}
              />
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Next"}
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Credentials */}
        {step === 1 && createdClient && (
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Key className="size-4 text-zinc-500" />
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Temporary Password
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 font-mono text-sm">
                  {tempPassword}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPassword}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="size-4 text-green-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Share this password with {createdClient.userId.name} so they can
                log in. They should change it after their first login.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                <span className="font-medium">{createdClient.userId.name}</span>{" "}
                ({createdClient.userId.email})
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline">
                  {createdClient.fitnessLevel}
                </Badge>
                {createdClient.goals.length > 0 && (
                  <p className="text-xs text-zinc-500">
                    Goals: {createdClient.goals.join(", ")}
                  </p>
                )}
              </div>
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

        {/* Step 3: Assign Routine */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Optionally assign an initial routine to get{" "}
              {createdClient?.userId.name} started right away.
            </p>

            {routines.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center">
                <Dumbbell className="mx-auto size-8 text-zinc-400" />
                <p className="mt-2 text-sm text-zinc-500">
                  No routines yet. Create one first, then assign it later.
                </p>
              </div>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {routines.map((routine) => (
                  <button
                    key={routine._id}
                    type="button"
                    onClick={() =>
                      setSelectedRoutineId(
                        selectedRoutineId === routine._id
                          ? null
                          : routine._id
                      )
                    }
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedRoutineId === routine._id
                        ? "border-green-600 bg-green-50 dark:border-green-400 dark:bg-green-950/30"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {routine.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                          <Badge
                            variant="outline"
                            className={difficultyColors[routine.difficulty]}
                          >
                            {routine.difficulty}
                          </Badge>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" />
                            {routine.duration} min
                          </span>
                        </div>
                      </div>
                      {selectedRoutineId === routine._id && (
                        <CheckCircle2 className="size-5 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="mr-1 size-4" />
                Back
              </Button>
              {routines.length > 0 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                  >
                    <SkipForward className="mr-1 size-4" />
                    Skip
                  </Button>
                  <Button
                    onClick={handleAssignRoutine}
                    disabled={!selectedRoutineId || isAssigning}
                  >
                    {isAssigning ? "Assigning..." : "Assign & Continue"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setStep(3)}>
                  Continue
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 3 && createdClient && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="size-6 text-green-600" />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Client Created!
              </h3>
              <p className="text-sm text-zinc-500">
                {createdClient.userId.name} has been added successfully.
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-center gap-2">
                <User className="size-4 text-zinc-500" />
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  {createdClient.userId.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClipboardList className="size-4 text-zinc-500" />
                <span className="text-sm text-zinc-500">
                  {selectedRoutine
                    ? `Routine: ${selectedRoutine.name}`
                    : "No routine assigned yet"}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={handleFinish}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
