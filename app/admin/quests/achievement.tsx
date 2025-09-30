/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreVertical, Edit, Trash2 } from "lucide-react"
import * as LucideIcons from "lucide-react"
import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Achievement } from "./questTypes"
import { Textarea } from "@/components/ui/textarea"
import toast from "react-hot-toast"

interface Quest{
  id: number,
  quest_title: string
}

interface AchievementsTabProps {
  achievements: Achievement[];
  onRefresh: () => void;
  setAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>;
}

export function AchievementForm({onSave, initialData, isEditing = false,}: {
  onSave: (a: Achievement) => void
  initialData?: Achievement
  isEditing?: boolean
}) {

  const [questsSelection, setQuestsSelection] = useState<Quest[]>([]);


  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const res = await fetch("/api/admin/achievement/fetch-quest"); 
        if (!res.ok) throw new Error("Failed to fetch quests");

        const data = await res.json();
        console.log("Fetched quests:", data.quests); // Debug log
        setQuestsSelection(data.quests || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuests();
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || initialData.name || "",
        description: initialData.description || "",
        achievementQuest: initialData.achievementQuest?.toString() || "",
        image: initialData.image || "",
      });
      setImagePreview(initialData.image || "");
    }
  }, [initialData]);

  const [form, setForm] = useState({
    title: initialData?.title || initialData?.name || "",
    description: initialData?.description || "",
    achievementQuest: initialData?.achievementQuest?.toString() || "",
    image: initialData?.image || "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image || "")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setForm({ ...form, image: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const isFormValid = () => {
    return (
      form.title.trim() !== "" &&
      form.description.trim() !== "" &&
      form.achievementQuest !== "" &&
      (imagePreview !== "" || form.image !== "")
    )
  }

  const handleSubmit = async () => {
    if (!form.achievementQuest || form.achievementQuest === "") {
      toast.error("Please select a quest");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);

    const questId = parseInt(form.achievementQuest);
    if (!isNaN(questId)) formData.append("achievementQuest", questId.toString());

    if (imageFile) formData.append("image", imageFile);

    if (isEditing && initialData?.id) formData.append("id", initialData.id.toString());

    const url = isEditing
      ? `/api/admin/achievement/update/${initialData?.id}`
      : `/api/admin/achievement/create`;

    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        onSave(data.achievement);

        if (!isEditing) {
          setForm({ title: "", description: "", achievementQuest: "", image: "" });
          setImageFile(null);
          setImagePreview("");
        }

        toast.success(isEditing ? "Achievement updated successfully" : "Achievement created successfully");
      } else {
        toast.error(data.error || "Failed to save achievement");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save achievement");
    }
  };



  return (
    <div className="space-y-3 mt-5">
      <Label htmlFor="achievementTitle" className="mb-3">
        Achievement Title
      </Label>
      <Input
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="rounded-sm border-gray-300"
      />

      <Label htmlFor="achievementDescription" className="mb-3">
        Achievement Description
      </Label>
      <Textarea
        id="description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Describe the achievement"
        rows={3}
        className="rounded-sm border-gray-300 border-2"
      />

      <Label htmlFor="achievementQuest" className="mb-3 mt-4">
        Achievement Quest
      </Label>
      <select
        id="achievementQuest"
        value={form.achievementQuest}
        onChange={(e) =>
          setForm({ ...form, achievementQuest: e.target.value })
        }
        className="w-full rounded-sm border-gray-300 border-2 p-2"
      >
        <option value="">Select Quest</option>
        {questsSelection.map((quest, index) => (
          <option 
            key={quest.id || `quest-${index}`} 
            value={quest.id}
          >
            {quest.quest_title}
          </option>
        ))}
      </select>

      <Label htmlFor="achievementImage" className="mb-3">
        Achievement Image
      </Label>
      <Input
        id="achievementImage"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="rounded-sm border-gray-300"
      />

      {imagePreview && (
        <div className="mt-3">
          <Label className="mb-2 block">Image Preview</Label>
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300">
            <img
              src={imagePreview || ""}
              alt="Achievement preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!isFormValid()}
        className="bg-[#F5BE66] hover:bg-[#E5AE56] mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isEditing ? "Update Achievement" : "Save Achievement"}
      </Button>
    </div>
  )
}

export function AchievementsTab({ achievements, onRefresh, setAchievements }: AchievementsTabProps) {
  const [showAchievementDialog, setShowAchievementDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const [searchQuery, setSearchQuery] = useState("")
  

  const handleAddAchievement = (achievement: Achievement) => {
    console.log("Adding achievement:", achievement)
    setShowAchievementDialog(false)
    onRefresh(); 
  }

  const handleEditAchievement = (achievement: Achievement) => {
    setShowEditDialog(false);
    setSelectedAchievement(null);
    setAchievements((prev) =>
      prev.map((a) => (a.id === achievement.id ? achievement : a))
    );
    onRefresh();
  };

  const handleDeleteAchievement = async () => {
    if (!selectedAchievement) return;

    try {
      const res = await fetch(`/api/admin/achievement/delete/${selectedAchievement.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Achievement deleted successfully");

        setAchievements((prev) =>
          prev.filter((a) => a.id !== selectedAchievement.id)
        );

        setShowDeleteAlert(false);
        setSelectedAchievement(null);
        setSelectedIndex(-1);
      } else {
        toast.error(data.error || "Failed to delete achievement");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete achievement");
    }
  };



  const openEditDialog = (achievement: Achievement, index: number) => {
    setSelectedAchievement(achievement)
    setSelectedIndex(index)
    setShowEditDialog(true)
  }

  const openDeleteAlert = (achievement: Achievement, index: number) => {
    setSelectedAchievement(achievement)
    setSelectedIndex(index)
    setShowDeleteAlert(true)
  }

  const filteredAchievements = achievements.filter((a) =>
    (a.name || a.title || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
    <div className="flex flex-col w-full gap-4">
      <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
        <DialogTrigger asChild>
          <Button className="bg-[#F5BE66] hover:bg-[#E5AE56] w-50">
            <Plus className="w-4 h-4 mr-2" /> Add Achievement
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Achievement</DialogTitle>
          </DialogHeader>
          <AchievementForm onSave={handleAddAchievement} />
        </DialogContent>
      </Dialog>

      <div className="relative mt-3">
        <LucideIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search quests by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-sm border-gray-300"
        />
      </div>
    </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Achievement</DialogTitle>
          </DialogHeader>
          {selectedAchievement && (
            <AchievementForm onSave={handleEditAchievement} initialData={selectedAchievement} isEditing={true} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Achievement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedAchievement?.title || selectedAchievement?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setShowDeleteAlert(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteAchievement} className="w-full md:w-25">
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Achievements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredAchievements.map((achievement, index) => (
          <Card key={index} className="relative">
            <CardContent className="p-6 text-center">
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(achievement, index)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openDeleteAlert(achievement, index)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="w-16 h-16 bg-[#F5BE66] rounded-full overflow-hidden flex items-center justify-center mx-auto mb-4">
                <img
                  src={achievement.image}
                  alt={achievement.name || "Achievement"}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-dela text-lg text-gray-900 mb-2">{achievement.name || achievement.title}</h3>
              <p className="text-gray-600 font-montserrat text-sm mb-3">{achievement.description}</p>
              <Badge variant="secondary">{achievement.count} earned</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
