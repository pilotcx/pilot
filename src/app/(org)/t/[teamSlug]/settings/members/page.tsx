"use client";

import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {addTeamMemberSchema, type AddTeamMemberSchema} from "@/lib/validations/team";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Separator} from "@/components/ui/separator";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {toast} from "sonner";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import {TeamRole} from "@/lib/types/models/team";
import {MoreHorizontal, Plus, UserPlus} from "lucide-react";
import {useTeam} from "@/components/providers/team-provider";
import {User} from "@/lib/types/models/user";

export default function MembersSettings() {
  const {team, membership} = useTeam();
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const [getTeamMembers, {data: membersData, loading}] = useApi(api.getTeamMembers);
  const [addMember, {loading: adding}] = useApi(api.addTeamMember);
  const [updateMember, {loading: updating}] = useApi(api.updateTeamMember);
  const [removeMember, {loading: removing}] = useApi(api.removeTeamMember);

  const members = membersData ?? [];
  const currentUserRole = membership.role;

  const form = useForm<AddTeamMemberSchema>({
    resolver: zodResolver(addTeamMemberSchema),
    defaultValues: {
      userId: "",
      displayName: "",
      role: TeamRole.Member,
    },
    mode: "onChange",
  });

  // Fetch team members data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (team?._id) {
          await getTeamMembers(team._id as string);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load team members");
      }
    };

    fetchData();
  }, [team, getTeamMembers]);

  async function onSubmit(values: AddTeamMemberSchema) {
    try {
      if (!team) return;

      await addMember(team._id as string, values);

      // Refresh the members list
      await getTeamMembers(team._id as string);

      toast.success("Team member added successfully");
      setAddMemberOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to add team member");
    }
  }

  async function handleUpdateRole(memberId: string, role: TeamRole) {
    try {
      if (!team) return;

      await updateMember(team._id as string, memberId, {role});

      // Refresh the members list
      await getTeamMembers(team._id as string);

      toast.success("Member role updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update member role");
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      if (!team) return;

      await removeMember(team._id as string, memberId);

      // Refresh the members list
      await getTeamMembers(team._id as string);

      toast.success("Member removed successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    }
  }

  // Helper function to get role badge color
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case TeamRole.Owner:
        return "default";
      case TeamRole.Manager:
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  const isOwner = currentUserRole === TeamRole.Owner;
  const isManager = currentUserRole === TeamRole.Manager || isOwner;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Team Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage members and their roles in your team
          </p>
        </div>

        {isManager && (
          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4"/>
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Invite a new member to join your team
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>User ID or Email</FormLabel>
                        <FormControl>
                          <Input placeholder="user@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the user ID or email of the person you want to add
                        </FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is how the member will be displayed in the team
                        </FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role"/>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isOwner && (
                              <SelectItem value={TeamRole.Owner}>Owner</SelectItem>
                            )}
                            <SelectItem value={TeamRole.Manager}>Manager</SelectItem>
                            <SelectItem value={TeamRole.Member}>Member</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The role determines what permissions the member has
                        </FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddMemberOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={adding}>
                      {adding ? "Adding..." : "Add Member"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Separator/>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <UserPlus className="h-12 w-12 text-muted-foreground"/>
          <h3 className="mt-4 text-lg font-medium">No members yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add members to your team to start collaborating
          </p>
          {isManager && (
            <Button
              className="mt-4"
              onClick={() => setAddMemberOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4"/>
              Add Your First Member
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                {isManager && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member._id as string}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={(member.user as User)?.avatar} alt={member.displayName}/>
                      <AvatarFallback>
                        {member.displayName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.displayName}</div>
                      <div className="text-sm text-muted-foreground">
                        {(member.user as User)?.email || "No email"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  {isManager && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4"/>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/t/${team.slug}/settings/members/${member._id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator/>
                          {isOwner && member.role !== TeamRole.Owner && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member._id as string, TeamRole.Owner)}
                              disabled={updating}
                            >
                              Make Owner
                            </DropdownMenuItem>
                          )}
                          {isOwner && member.role !== TeamRole.Manager && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member._id as string, TeamRole.Manager)}
                              disabled={updating}
                            >
                              Make Manager
                            </DropdownMenuItem>
                          )}
                          {isOwner && member.role !== TeamRole.Member && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member._id as string, TeamRole.Member)}
                              disabled={updating}
                            >
                              Make Member
                            </DropdownMenuItem>
                          )}
                          {(isOwner || (isManager && member.role === TeamRole.Member)) && (
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member._id as string)}
                              disabled={removing}
                              className="text-destructive focus:text-destructive"
                            >
                              Remove
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
