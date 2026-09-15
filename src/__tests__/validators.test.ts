import { describe, it, expect } from "vitest"
import { CreateExerciseSchema } from "@/validators/exercise"
import { SendMessageSchema } from "@/validators/message"
import { CreateFeedbackSchema } from "@/validators/feedback"
import { CreateRoutineSchema } from "@/validators/routine"

describe("CreateExerciseSchema", () => {
  it("validates a valid exercise", () => {
    const result = CreateExerciseSchema.safeParse({
      name: "Bench Press",
      category: "strength",
      difficulty: "medium",
    })
    expect(result.success).toBe(true)
  })

  it("rejects empty name", () => {
    const result = CreateExerciseSchema.safeParse({
      name: "",
      category: "strength",
    })
    expect(result.success).toBe(false)
  })

  it("sanitizes name from HTML", () => {
    const result = CreateExerciseSchema.safeParse({
      name: "<script>alert(1)</script>Bench Press",
      category: "strength",
    })
    if (result.success) {
      expect(result.data.name).not.toContain("<script>")
    }
  })

  it("rejects invalid category", () => {
    const result = CreateExerciseSchema.safeParse({
      name: "Test",
      category: "invalid",
    })
    expect(result.success).toBe(false)
  })
})

describe("SendMessageSchema", () => {
  it("validates a valid message", () => {
    const result = SendMessageSchema.safeParse({
      receiverId: "507f1f77bcf86cd799439011",
      content: "Hello!",
    })
    expect(result.success).toBe(true)
  })

  it("sanitizes content from HTML", () => {
    const result = SendMessageSchema.safeParse({
      receiverId: "507f1f77bcf86cd799439011",
      content: "<img src=x onerror=alert(1)>Hello",
    })
    if (result.success) {
      expect(result.data.content).not.toContain("<img")
      expect(result.data.content).toContain("Hello")
    }
  })

  it("rejects empty content", () => {
    const result = SendMessageSchema.safeParse({
      receiverId: "507f1f77bcf86cd799439011",
      content: "",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid receiver ID", () => {
    const result = SendMessageSchema.safeParse({
      receiverId: "invalid-id",
      content: "Hello",
    })
    expect(result.success).toBe(false)
  })
})

describe("CreateFeedbackSchema", () => {
  it("validates valid feedback", () => {
    const result = CreateFeedbackSchema.safeParse({
      difficultyRating: 4,
      enjoymentRating: 5,
      message: "Great workout!",
    })
    expect(result.success).toBe(true)
  })

  it("sanitizes message from HTML", () => {
    const result = CreateFeedbackSchema.safeParse({
      difficultyRating: 3,
      enjoymentRating: 3,
      message: "<b>Great</b> workout!",
    })
    if (result.success && result.data.message) {
      expect(result.data.message).not.toContain("<b>")
      expect(result.data.message).toContain("Great")
    }
  })

  it("rejects rating out of range", () => {
    const result = CreateFeedbackSchema.safeParse({
      difficultyRating: 6,
      enjoymentRating: 5,
    })
    expect(result.success).toBe(false)
  })
})

describe("CreateRoutineSchema", () => {
  it("validates a valid routine", () => {
    const result = CreateRoutineSchema.safeParse({
      name: "Upper Body",
      duration: 45,
      exercises: [
        {
          exerciseId: "507f1f77bcf86cd799439011",
          sets: 3,
          reps: 10,
          restTime: 60,
          order: 0,
        },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("sanitizes name from HTML", () => {
    const result = CreateRoutineSchema.safeParse({
      name: "<script>steal()</script>Upper Body",
      duration: 45,
      exercises: [
        {
          exerciseId: "507f1f77bcf86cd799439011",
          sets: 3,
          reps: 10,
          restTime: 60,
          order: 0,
        },
      ],
    })
    if (result.success) {
      expect(result.data.name).not.toContain("<script>")
    }
  })

  it("rejects empty exercises array", () => {
    const result = CreateRoutineSchema.safeParse({
      name: "Routine",
      duration: 30,
      exercises: [],
    })
    expect(result.success).toBe(false)
  })
})
