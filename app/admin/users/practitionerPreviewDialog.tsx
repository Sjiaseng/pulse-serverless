"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Calendar, FileText, Clock, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react"

interface Application {
  id: number
  userId: string
  username: string
  gender: string
  email: string
  joined_date: string
  submission_date: string
  license_url: string
  status: string
  updated_at: string
  profile_url: string
}

interface PractitionerReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: Application | null
  onApprove: (applicationId: number) => void
  onReject: (applicationId: number) => void
}

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return "-"
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "verified":
      return (
        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      )
    case "pending":
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function PractitionerReviewDialog({
  open,
  onOpenChange,
  application,
  onApprove,
  onReject,
}: PractitionerReviewDialogProps) {
  if (!application) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[100vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold">Review Practitioner Application</AlertDialogTitle>
          <AlertDialogDescription>
            Review the application details and supporting documents before making a decision.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* applicant info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16 ring-2 ring-primary/10">
                  <AvatarImage src={application.profile_url} alt={application.username} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {application.username
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{application.username}</h3>
                    {getStatusBadge(application.status)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{application.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{application.gender}male</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* application details */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Application Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-muted-foreground">Application ID</label>
                  <p className="font-medium">#{application.id}</p>
                </div>
                <div>
                  <label className="text-muted-foreground">User ID</label>
                  <p className="font-medium">#{application.userId}</p>
                </div>
                <div>
                  <label className="text-muted-foreground">Joined Date</label>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDateTime(application.joined_date)}
                  </p>
                </div>
                <div>
                  <label className="text-muted-foreground">Submission Date</label>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDateTime(application.submission_date)}
                  </p>
                </div>
                <div>
                  <label className="text-muted-foreground">Last Updated</label>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(application.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* license */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  License Document
                </h4>
                <Button variant="outline" size="sm" asChild className="flex items-center gap-2 bg-transparent">
                  <a href={application.license_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    View
                  </a>
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden bg-muted/20">
                <div className="aspect-[4/3] w-full">
                  <iframe
                    src={application.license_url}
                    className="w-full h-full object-cover"
                    title="License Document Preview"
                  />
                </div>
                <div className="p-3 border-t bg-background/50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Professional License Document</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="rounded-xl bg-transparent">
              Cancel
            </Button>
          </AlertDialogCancel>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <AlertDialogAction asChild>
                <Button
                  variant="destructive"
                  className="rounded-xl w-full sm:w-45"
                  onClick={() => onReject(application.id)}
                >
                  Reject Application
                </Button>
              </AlertDialogAction>
              <AlertDialogAction asChild>
                <Button
                  className="rounded-xl w-full sm:w-45"
                  onClick={() => onApprove(application.id)}
                >
                  Approve Application
                </Button>
              </AlertDialogAction>
            </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
