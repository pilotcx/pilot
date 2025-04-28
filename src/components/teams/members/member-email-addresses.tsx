"use client";

import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
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
import {Badge} from "@/components/ui/badge";
import {Loader2, Mail, Plus, Star, Trash2} from "lucide-react";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import {TeamRole} from "@/lib/types/models/team";
import {Domain} from "@/lib/types/models/domain";
import {EmailAddress, EmailAddressStatus} from "@/lib/types/models/email-address";

// Define the form schema
const emailAddressFormSchema = z.object({
  localPart: z
    .string()
    .min(1, "Local part is required")
    .regex(/^[a-zA-Z0-9.\\-_]+$/, "Only letters, numbers, dots, hyphens, and underscores are allowed"),
  domainId: z.string().min(1, "Domain is required"),
  displayName: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type EmailAddressFormValues = z.infer<typeof emailAddressFormSchema>;

interface MemberEmailAddressesProps {
  teamId: string;
  memberId: string;
  currentUserRole: TeamRole;
  teamSlug: string;
}

export function MemberEmailAddresses({
                                       teamId,
                                       memberId,
                                       currentUserRole,
                                       teamSlug
                                     }: MemberEmailAddressesProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // API hooks
  const [getEmailAddresses, {
    data: emailAddresses = [],
    loading: loadingEmailAddresses
  }] = useApi(api.getMemberEmailAddresses, []);
  const [getTeamDomains, {data: availableDomains = [], loading: loadingDomains}] = useApi(api.getTeamDomains, []);
  const [createEmailAddress, {loading: creatingEmailAddress}] = useApi(api.createMemberEmailAddress);
  const [updateEmailAddress, {loading: updatingEmailAddress}] = useApi(api.updateMemberEmailAddress);
  const [deleteEmailAddress, {loading: deletingEmailAddress}] = useApi(api.deleteMemberEmailAddress);

  // Initialize the form
  const form = useForm<EmailAddressFormValues>({
    resolver: zodResolver(emailAddressFormSchema),
    defaultValues: {
      localPart: "",
      domainId: "",
      displayName: "",
      isDefault: false,
    },
  });

  // Fetch email addresses and available domains
  useEffect(() => {
    if (teamId && memberId) {
      getEmailAddresses(teamId, memberId);
      getTeamDomains(teamId);
    }
  }, [teamId, memberId, getEmailAddresses, getTeamDomains]);

  // Handle form submission
  async function onSubmit(values: EmailAddressFormValues) {
    try {
      await createEmailAddress(teamId, memberId, values);

      toast.success("Email address created successfully");
      setAddDialogOpen(false);
      form.reset();

      // Refresh email addresses
      getEmailAddresses(teamId, memberId);
    } catch (error: any) {
      toast.error(error.message || "Failed to create email address");
    }
  }

  // Handle setting an email address as default
  async function handleSetDefault(emailAddressId: string) {
    try {
      await updateEmailAddress(teamId, memberId, emailAddressId, {isDefault: true});
      toast.success("Email address set as default successfully");

      // Refresh email addresses
      await getEmailAddresses(teamId, memberId);
    } catch (error: any) {
      toast.error(error.message || "Failed to set email address as default");
    }
  }

  // Handle deleting an email address
  async function handleDeleteEmailAddress(emailAddressId: string) {
    try {
      await deleteEmailAddress(teamId, memberId, emailAddressId);
      toast.success("Email address deleted successfully");

      // Refresh email addresses
      await getEmailAddresses(teamId, memberId);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete email address");
    }
  }

  // Check if user has permission to manage email addresses
  const canManageEmailAddresses = [TeamRole.Owner, TeamRole.Manager].includes(currentUserRole);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Email Addresses</h3>
          <p className="text-sm text-muted-foreground">
            Manage email addresses for this team member
          </p>
        </div>
        {canManageEmailAddresses && (
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4"/>
                Add Email Address
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Email Address</DialogTitle>
                <DialogDescription>
                  Create a new email address for this team member
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-[2fr_1fr] gap-2">
                    <FormField
                      control={form.control}
                      name="localPart"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="domainId"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Domain</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select domain"/>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loadingDomains ? (
                                <div className="flex items-center justify-center p-2">
                                  <Loader2 className="h-4 w-4 animate-spin"/>
                                </div>
                              ) : availableDomains.length === 0 ? (
                                <div className="p-2 text-sm text-muted-foreground">
                                  No domains available
                                </div>
                              ) : (
                                availableDomains.map((domain: Domain) => (
                                  <SelectItem key={domain._id as string} value={domain._id as string}>
                                    @{domain.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Display Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name that will be displayed when sending emails
                        </FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({field}) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Set as Default</FormLabel>
                          <FormDescription>
                            This email address will be used as the default for sending emails
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit" disabled={creatingEmailAddress}>
                      {creatingEmailAddress ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                          Creating...
                        </>
                      ) : (
                        "Create Email Address"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loadingEmailAddresses ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
        </div>
      ) : emailAddresses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Email Addresses</CardTitle>
            <CardDescription>
              This team member doesn't have any email addresses yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {canManageEmailAddresses
                ? "Add an email address to allow this team member to send and receive emails"
                : "No email addresses have been assigned to this team member yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email Address</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Status</TableHead>
              {canManageEmailAddresses && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {emailAddresses.map((emailAddress: EmailAddress) => (
              <TableRow key={emailAddress._id as string}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground"/>
                    <span>
                          {emailAddress.localPart}@{(emailAddress.domain as Domain)?.name}
                        </span>
                    {emailAddress.isDefault && (
                      <Badge variant="secondary" className="ml-2">
                        <Star className="mr-1 h-3 w-3"/>
                        Default
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{emailAddress.displayName || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      emailAddress.status === EmailAddressStatus.Active
                        ? "success"
                        : emailAddress.status === EmailAddressStatus.Pending
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {emailAddress.status}
                  </Badge>
                </TableCell>
                {canManageEmailAddresses && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {!emailAddress.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(emailAddress._id as string)}
                          disabled={updatingEmailAddress}
                        >
                          {updatingEmailAddress ? (
                            <Loader2 className="h-4 w-4 animate-spin"/>
                          ) : (
                            <Star className="h-4 w-4"/>
                          )}
                          <span className="sr-only">Set as Default</span>
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={emailAddress.isDefault || deletingEmailAddress}
                          >
                            {deletingEmailAddress ? (
                              <Loader2 className="h-4 w-4 animate-spin"/>
                            ) : (
                              <Trash2 className="h-4 w-4"/>
                            )}
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Email Address</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this email address? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteEmailAddress(emailAddress._id as string)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
