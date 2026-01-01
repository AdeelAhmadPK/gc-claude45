"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Target, TrendingUp, CheckCircle2, Circle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

interface Goal {
  id: string;
  name: string;
  description: string | null;
  targetValue: number;
  currentValue: number;
  unit: string;
  dueDate: string | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "AT_RISK";
}

export default function GoalsPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId as string;
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      name: "Complete Q1 Projects",
      description: "Finish all projects scheduled for Q1 2026",
      targetValue: 10,
      currentValue: 7,
      unit: "projects",
      dueDate: "2026-03-31",
      status: "IN_PROGRESS",
    },
    {
      id: "2",
      name: "Customer Satisfaction",
      description: "Achieve 90% customer satisfaction rating",
      targetValue: 90,
      currentValue: 85,
      unit: "%",
      dueDate: "2026-06-30",
      status: "IN_PROGRESS",
    },
    {
      id: "3",
      name: "Team Onboarding",
      description: "Onboard 5 new team members",
      targetValue: 5,
      currentValue: 3,
      unit: "members",
      dueDate: "2026-02-28",
      status: "IN_PROGRESS",
    },
  ]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");

  const calculateProgress = (goal: Goal) => {
    return Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
  };

  const getStatusColor = (status: Goal["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600";
      case "IN_PROGRESS":
        return "text-blue-600";
      case "AT_RISK":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: Goal["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "IN_PROGRESS":
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case "AT_RISK":
        return <Circle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-600" />;
    }
  };

  const createGoal = async () => {
    if (!name.trim() || !targetValue) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      name,
      description,
      targetValue: parseFloat(targetValue),
      currentValue: 0,
      unit,
      dueDate: null,
      status: "NOT_STARTED",
    };

    setGoals([...goals, newGoal]);
    setOpen(false);
    setName("");
    setDescription("");
    setTargetValue("");
    setUnit("");
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground mt-2">
            Track and achieve your workspace objectives
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Goal</DialogTitle>
              <DialogDescription>
                Define a new goal to track progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Complete Q1 Projects"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target">Target Value</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="100"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    placeholder="e.g., projects, %"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={createGoal} className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground">
              Tracking this quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter((g) => g.status === "IN_PROGRESS").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Actively working on
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter((g) => g.status === "COMPLETED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully achieved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          return (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(goal.status)}
                      <CardTitle>{goal.name}</CardTitle>
                    </div>
                    {goal.description && (
                      <CardDescription className="mt-2">
                        {goal.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{progress}%</div>
                    <p className="text-xs text-muted-foreground">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className={getStatusColor(goal.status)}>
                      {goal.status.replace("_", " ")}
                    </span>
                    {goal.dueDate && (
                      <span>
                        Due {new Date(goal.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <Card className="text-center py-12">
          <CardContent className="space-y-4 pt-6">
            <Target className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-lg">No goals yet</h3>
              <p className="text-muted-foreground mt-2">
                Create your first goal to start tracking progress
              </p>
            </div>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
