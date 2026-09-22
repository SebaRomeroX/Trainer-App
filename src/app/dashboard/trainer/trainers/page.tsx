"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TrainerTable } from "@/components/trainer/trainer-table"
import { CreateTrainerDialog } from "@/components/trainer/create-trainer-dialog"

export default function TrainersPage() {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-100">
            Trainers
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage trainer accounts for your organization.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Trainer
        </Button>
      </div>

      <TrainerTable onCreateClick={() => setShowCreate(true)} />

      <CreateTrainerDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  )
}
