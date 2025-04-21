"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamMember, TeamRole } from "@/lib/types/models/team";
import { User } from "@/lib/types/models/user";
import { AlertCircle, Loader2, Mail, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define the form schema
const memberDetailFormSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  role: z.nativeEnum(TeamRole),
});

type MemberDetailFormValues = z.infer<typeof memberDetailFormSchema>;

interface MemberDetailFormProps {
  teamId: string;
  member: TeamMember & { user: User };
  currentUserRole: TeamRole;
  teamSlug: string;
}

export function MemberDetailForm({ 
  teamId, 
  member, 
  currentUserRole,
  teamSlug
}: MemberDetailFormProps) {
  const router = useRouter();
  const [updateMember, { loading: isUpdating }] = useApi(api.updateTeamMember);
  const [removeMember, { loading: isRemoving }] = useApi(api.removeTeamMember);
  
  // Determine if the current user can edit this member
  const canEditRole = currentUserRole === TeamRole.Owner || 
    (currentUserRole === TeamRole.Manager && member.role === TeamRole.Member);
  
  const canRemoveMember = currentUserRole === TeamRole.Owner || 
    (currentUserRole === TeamRole.Manager && member.role === TeamRole.Member);
  
  // Initialize the form with member data
  const form = useForm<MemberDetailFormValues>({
    resolver: zodResolver(memberDetailFormSchema),
    defaultValues: {
      displayName: member.displayName,
      role: member.role as TeamRole,
    },
  });

  // Handle form submission
  async function onSubmit(values: MemberDetailFormValues) {
    try {
      // Don't allow changing role if not permitted
      if (!canEditRole && values.role !== member.role) {
        toast.error("You don't have permission to change this member's role");
        return;
      }
      
      const { error } = await updateMember(teamId, member._id, values);
      
      if (error) {
        toast.error(error.message || "Failed to update member");
        return;
      }
      
      toast.success("Member updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update member");
    }
  }
  
  // Handle member removal
  async function handleRemoveMember() {
    try {
      if (!canRemoveMember) {
        toast.error("You don't have permission to remove this member");
        return;
      }
      
      const { error } = await removeMember(teamId, member._id);
      
      if (error) {
        toast.error(error.message || "Failed to remove member");
        return;
      }
      
      toast.success("Member removed successfully");
      router.push(`/t/${teamSlug}/settings/members`);
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Member Profile</CardTitle>
          <CardDescription>
            View member information and profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={member.user.avatar || ""} alt={member.displayName} />
              <AvatarFallback className="text-xl">
                {member.displayName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="text-xl font-medium">{member.user.fullName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{member.user.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={member.role === TeamRole.Owner ? "default" : 
                  member.role === TeamRole.Manager ? "secondary" : "outline"}>
                  {member.role === TeamRole.Owner ? "Owner" : 
                   member.role === TeamRole.Manager ? "Manager" : "Member"}
                </Badge>
                {member.user.emailVerified && (
                  <Badge variant="success">Verified</Badge>
                )}
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="text-sm font-medium mb-2">User Information</h4>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-muted/50 p-3 rounded-md">
                <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                <dd className="mt-1 text-sm">{member.user.fullName}</dd>
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="mt-1 text-sm">{member.user.email}</dd>
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <dt className="text-sm font-medium text-muted-foreground">Joined Team</dt>
                <dd className="mt-1 text-sm">{new Date(member.createdAt).toLocaleDateString()}</dd>
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <dt className="text-sm font-medium text-muted-foreground">User ID</dt>
                <dd className="mt-1 text-sm truncate">{member.user._id}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Settings</CardTitle>
          <CardDescription>
            Manage this member's role and display name in the team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      This is how the member will be displayed in the team
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      disabled={!canEditRole}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TeamRole.Owner}>Owner</SelectItem>
                        <SelectItem value={TeamRole.Manager}>Manager</SelectItem>
                        <SelectItem value={TeamRole.Member}>Member</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {!canEditRole ? 
                        "You don't have permission to change this member's role" : 
                        "The member's role determines their permissions in the team"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {member.role === TeamRole.Owner && currentUserRole !== TeamRole.Owner && (
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Permission Required</AlertTitle>
                  <AlertDescription>
                    Only team owners can modify other owners' settings
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-between">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      type="button" 
                      variant="destructive"
                      disabled={!canRemoveMember || isRemoving}
                    >
                      {isRemoving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        "Remove from Team"
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Member</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove this member from the team? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleRemoveMember}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
