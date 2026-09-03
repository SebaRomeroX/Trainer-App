"use client"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ClientFormProps {
  onSubmit: (data: CreateClientInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ClientForm({ onSubmit, onCancel, isLoading }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
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

  const handleGoalsInput = (value: string) => {
    const items = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    setValue("goals", items, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Client's full name"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="client@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Initial Password</Label>
        <Input value="Set to client's name" disabled className="text-zinc-500" />
        <p className="text-xs text-zinc-500">Password will be set to the client&apos;s name. They can change it after logging in.</p>
      </div>

      <div className="space-y-2">
        <Label>Fitness Level</Label>
        <Select
          value={fitnessLevel}
          onValueChange={(val) =>
            setValue("fitnessLevel", val as CreateClientInput["fitnessLevel"], {
              shouldValidate: true,
            })
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
          <p className="text-sm text-red-500">{errors.fitnessLevel.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="goals">Goals</Label>
        <Input
          id="goals"
          placeholder="e.g. Weight loss, Muscle gain"
          defaultValue=""
          onBlur={(e) => handleGoalsInput(e.target.value)}
        />
        <p className="text-xs text-zinc-500">Comma-separated</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Optional notes about the client..."
          rows={3}
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-sm text-red-500">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Client"}
        </Button>
      </div>
    </form>
  )
}
