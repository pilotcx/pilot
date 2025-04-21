"use client";

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {toast} from "sonner";
import useApi from "@/hooks/use-api";
import api from "@/lib/services/api";
import {GlobeIcon, Loader2, Plus, Trash2} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {useTeam} from "@/components/providers/team-provider";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

// Domain form schema
const domainFormSchema = z.object({
  name: z.string()
    .min(1, "Domain name is required")
    .regex(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i, "Invalid domain format"),
});

type DomainFormValues = z.infer<typeof domainFormSchema>;

// Domain interface
interface Domain {
  _id: string;
  name: string;
  team: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DomainsSettings() {
  const {team} = useTeam();
  const [addDomainOpen, setAddDomainOpen] = useState(false);

  // API hooks
  const [getDomains, {data: domains = [], loading: loadingDomains}] = useApi(api.getTeamDomains, []);
  const [createDomain, {loading: creatingDomain}] = useApi(api.createDomain);
  const [deleteDomain, {loading: deletingDomain}] = useApi(api.deleteDomain);

  // Form for adding a new domain
  const form = useForm<DomainFormValues>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: {
      name: "",
    },
  });

  // Fetch domains when team changes
  useEffect(() => {
    getDomains(team._id as string).then(() => {

    });
  }, []);

  // Handle form submission for adding a new domain
  const onSubmit = async (values: DomainFormValues) => {
    if (!team?._id) return;

    try {
      await createDomain(team._id as string, {
        name: values.name,
        type: "manual",
      });

      toast.success("Domain added successfully");
      setAddDomainOpen(false);
      form.reset();
      getDomains(team._id as string);
    } catch (error: any) {
      toast.error(error.message || "Failed to add domain");
    }
  };

  // Handle domain deletion
  const handleDeleteDomain = async (domainId: string) => {
    if (!team?._id) return;

    try {
      await deleteDomain(team._id as string, domainId);
      toast.success("Domain deleted successfully");

      // Refresh domains
      getDomains(team._id.toString());
    } catch (error: any) {
      toast.error(error.message || "Failed to delete domain");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Domain Management</h3>
        <p className="text-sm text-muted-foreground">
          Manage domains for your team
        </p>
      </div>

      <Separator/>

      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-medium">Team Domains</h4>
          <p className="text-sm text-muted-foreground">
            Add and manage domains for your team
          </p>
        </div>
        <Dialog open={addDomainOpen} onOpenChange={setAddDomainOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4"/>
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Domain</DialogTitle>
              <DialogDescription>
                Add a new domain for your team
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Domain Name</FormLabel>
                      <FormControl>
                        <Input placeholder="example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter your domain name without http:// or www
                      </FormDescription>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={creatingDomain}>
                    {creatingDomain ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        Adding...
                      </>
                    ) : (
                      "Add Domain"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loadingDomains ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
        </div>
      ) : domains.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <GlobeIcon className="mx-auto h-10 w-10 text-muted-foreground/60"/>
          <h3 className="mt-4 text-lg font-medium">No domains</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You haven't added any domains yet. Add a domain to get started.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setAddDomainOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4"/>
            Add Domain
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain._id as string}>
                  <TableCell className="font-medium flex items-center">
                    <GlobeIcon className="mr-2 h-4 w-4 text-muted-foreground"/>
                    {domain.name}
                  </TableCell>
                  <TableCell className="capitalize">{domain.type}</TableCell>
                  <TableCell>{new Date(domain.createdAt as string).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive -my-2">
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Domain</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this domain? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteDomain(domain._id as string)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingDomain ? (
                              <Loader2 className="h-4 w-4 animate-spin"/>
                            ) : (
                              "Delete"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
