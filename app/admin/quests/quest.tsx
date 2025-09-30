"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Quest, EditQuest, NewQuest, Achievement } from "./questTypes";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


interface QuestsTabProps {
  quests: Quest[];
  achievements: Achievement[];
  onRefresh: () => void;
}

function toDateTimeLocal(date?: string | Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function QuestsTab({ quests, onRefresh }: QuestsTabProps) {
  const [open, setOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [questsList, setQuestsList] = useState(quests);
  const [newQuest, setNewQuest] = useState<NewQuest>({
    title: "",
    description: "",
    points: "",
    difficulty: "easy",
    availableDate: "",
    expirationDate: "",
  });

  const [editingQuest, setEditingQuest] = useState<EditQuest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteQuestId, setDeleteQuestId] = useState<number | null>(null);
  const questsPerPage = 3;

  const filteredQuests = quests.filter((quest) => {
    const title = quest.title ?? "";
    const description = quest.description ?? "";
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  function QuestStatusBadge({
    status,
  }: {
    status: "active" | "upcoming" | "expired";
  }) {
    switch (status) {
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800 border border-red-200 font-semibold">
            Expired
          </Badge>
        );
      case "upcoming":
        return (
          <Badge className="bg-orange-100 text-orange-800 border border-orange-200 font-semibold">
            Upcoming
          </Badge>
        );
      case "active":
      default:
        return (
          <Badge className="bg-green-100 text-green-800 border border-green-200 font-semibold">
            Active
          </Badge>
        );
    }
  }

  const paginatedQuests = filteredQuests.slice(
    (currentPage - 1) * questsPerPage,
    currentPage * questsPerPage
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleAddQuest = async () => {
    try {
      const res = await fetch("/api/admin/quest/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuest),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Quest created Successfully");
        onRefresh();
        setNewQuest({
          title: "",
          description: "",
          points: "",
          availableDate: "",
          expirationDate: "",
          difficulty: "easy",
        });
      } else {
        console.error("Error creating quest:", data.error);
      }
    } catch (err) {
      console.error("Failed to create quest:", err);
    }
  };

  const handleSaveEditQuest = async () => {
    if (!editingQuest) return;

    try {
      const response = await fetch(`/api/admin/quest/edit/${editingQuest.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingQuest),
      });

      if (!response.ok) {
        throw new Error("Failed to update quest");
      }

      toast.success("Quest updated successfully");
      setEditingQuest(null);

      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuest = async () => {
    try {
      const res = await fetch(`/api/admin/quest/delete/${deleteQuestId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete quest");

      toast.success("Quest deleted successfully");
      setOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete quest");
    }
  };

  const isFormValid = () => {
    return (
      newQuest.title.trim() !== "" &&
      newQuest.description.trim() !== "" &&
      newQuest.points !== "" &&
      newQuest.availableDate !== "" &&
      newQuest.expirationDate !== "" &&
      newQuest.difficulty !== ""
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form to Add New Quest */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-dela">
              <Plus className="w-5 h-5" />
              Add New Quest
            </CardTitle>
            <CardDescription>
              Create engaging challenges for users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="mb-3">
                Quest Title
              </Label>
              <Input
                id="title"
                value={newQuest.title}
                onChange={(e) =>
                  setNewQuest({ ...newQuest, title: e.target.value })
                }
                placeholder="Enter quest title"
                className="rounded-sm border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="description" className="mb-3">
                Description
              </Label>
              <Textarea
                id="description"
                value={newQuest.description}
                onChange={(e) =>
                  setNewQuest({ ...newQuest, description: e.target.value })
                }
                placeholder="Describe the quest"
                rows={3}
                className="rounded-sm border-gray-300 border-2"
              />
            </div>
            <div>
              <Label htmlFor="points" className="mb-3">
                Points Reward
              </Label>
              <Input
                id="points"
                type="number"
                value={newQuest.points}
                onChange={(e) =>
                  setNewQuest({ ...newQuest, points: e.target.value })
                }
                placeholder="100"
                className="rounded-sm border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="availableDate" className="mb-3">
                Available Date
              </Label>
              <Input
                id="availableDate"
                type="datetime-local"
                value={newQuest.availableDate}
                onChange={(e) =>
                  setNewQuest({
                    ...newQuest,
                    availableDate: e.target.value,
                  })
                }
                className="rounded-sm border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="expirationDate" className="mb-3">
                Expiration Date
              </Label>
              <Input
                id="expirationDate"
                type="datetime-local"
                value={newQuest.expirationDate}
                onChange={(e) =>
                  setNewQuest({
                    ...newQuest,
                    expirationDate: e.target.value,
                  })
                }
                className="rounded-sm border-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="difficulty" className="mb-3">
                Difficulty
              </Label>
              <select
                id="difficulty"
                value={newQuest.difficulty}
                onChange={(e) =>
                  setNewQuest({ ...newQuest, difficulty: e.target.value })
                }
                className="w-full p-2 pt-3 pb-3 border border-gray-300 rounded-sm"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <Button
              disabled={!isFormValid()}
              onClick={handleAddQuest}
              className="w-full bg-[#F5BE66] hover:bg-[#E5AE56] mt-7 mb-7"
            >
              Create Quest
            </Button>
          </CardContent>
        </Card>

        {/* Active Quests -- done */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-montserrat font-bold text-xl text-gray-900">
            Active Quests
          </h3>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search quests by title or description..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 rounded-sm border-gray-300"
            />
          </div>

          {filteredQuests.length === 0 && searchQuery && (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No quests found matching &quot;{searchQuery}&quot;
              </CardContent>
            </Card>
          )}

          {paginatedQuests.map((quest) => (
            <Card key={quest.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  {/* Quest Info */}
                  <div>
                    <h4 className="font-dela text-lg text-gray-900 mb-2">
                      {quest.title}
                    </h4>
                    <p className="text-gray-600 font-montserrat mb-3">
                      {quest.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">{quest.points} points</Badge>
                      <Badge
                        className={
                          quest.difficulty === "easy"
                            ? "bg-green-100 text-green-800 border border-green-200 font-semibold"
                            : quest.difficulty === "medium"
                            ? "bg-orange-100 text-orange-800 border border-orange-200 font-semibold"
                            : "bg-red-100 text-red-800 border border-red-200 font-semibold"
                        }
                      >
                        {quest.difficulty.charAt(0).toUpperCase() +
                          quest.difficulty.slice(1)}
                      </Badge>

                      <QuestStatusBadge
                        status={
                          quest.status as "active" | "upcoming" | "expired"
                        }
                      />

                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {quest.completions} completed
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col lg:flex-row gap-2 mt-4 lg:mt-0 lg:ml-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="h-9"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditingQuest({
                              ...quest,
                              achievement: {
                                achievementId: 0,
                                achievementName: "",
                              },
                            })
                          }
                        >
                          Edit
                        </Button>
                      </DialogTrigger>

                      {editingQuest?.id === quest.id && (
                        <DialogContent className="max-h-[90vh] flex flex-col">
                          <DialogHeader>
                            <DialogTitle>Edit Quest</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-5 overflow-y-auto">
                            <Label htmlFor="questTitle" className="mb-3">
                              Quest Title
                            </Label>
                            <Input
                              className="rounded-sm border-gray-300"
                              value={editingQuest.title}
                              onChange={(e) =>
                                setEditingQuest({
                                  ...editingQuest,
                                  title: e.target.value,
                                })
                              }
                            />
                            <Label htmlFor="questDescription" className="mb-3">
                              Quest Description
                            </Label>
                            <Textarea
                              className="rounded-sm border-gray-300 border-2"
                              value={editingQuest.description}
                              onChange={(e) =>
                                setEditingQuest({
                                  ...editingQuest,
                                  description: e.target.value,
                                })
                              }
                            />
                            <Label htmlFor="pointsReward" className="mb-3">
                              Points Reward
                            </Label>
                            <Input
                              className="rounded-sm border-gray-300"
                              type="number"
                              value={editingQuest.points}
                              onChange={(e) =>
                                setEditingQuest({
                                  ...editingQuest,
                                  points: Number(e.target.value),
                                })
                              }
                            />
                            <Label
                              htmlFor="questAvailableDate"
                              className="mb-3"
                            >
                              Quest Available Date
                            </Label>
                            <Input
                              type="datetime-local"
                              id="questAvailableDate"
                              className="rounded-sm border-gray-300 border-2"
                              value={toDateTimeLocal(
                                editingQuest.availableDate
                              )}
                              onChange={(e) =>
                                setEditingQuest({
                                  ...editingQuest,
                                  availableDate: e.target.value,
                                })
                              }
                            />

                            <Label
                              htmlFor="questExpirationDate"
                              className="mb-3"
                            >
                              Quest Expiration Date
                            </Label>
                            <Input
                              type="datetime-local"
                              id="questExpirationDate"
                              className="rounded-sm border-gray-300 border-2"
                              value={toDateTimeLocal(
                                editingQuest.expirationDate
                              )}
                              onChange={(e) =>
                                setEditingQuest({
                                  ...editingQuest,
                                  expirationDate: e.target.value,
                                })
                              }
                            />
                            <Label htmlFor="questDifficulty" className="mb-3">
                              Quest Difficulty
                            </Label>
                            <select
                              className="w-full pt-3 pb-3 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#F5BE66] focus:ring focus:ring-[#F5BE66]/50"
                              value={editingQuest.difficulty}
                              onChange={(e) =>
                                setEditingQuest({
                                  ...editingQuest,
                                  difficulty: e.target.value,
                                })
                              }
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>

                            <Button
                              onClick={handleSaveEditQuest}
                              disabled={!isFormValid}
                              className="mt-5 mb-5"
                            >
                              Save
                            </Button>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>

                    <Button
                      variant="outline"
                      className="bg-red-500 text-white hover:bg-red-600 rounded-md"
                      onClick={() => {
                        setDeleteQuestId(quest.id);
                        setOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredQuests.length > questsPerPage && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </Button>
              <span className="flex items-center px-3 text-sm text-gray-600">
                Page {currentPage} of{" "}
                {Math.ceil(filteredQuests.length / questsPerPage)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage * questsPerPage >= filteredQuests.length}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deleting Quest</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quest? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="rounded-xl">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                className="w-full sm:w-25 rounded-xl"
                onClick={handleDeleteQuest}
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
