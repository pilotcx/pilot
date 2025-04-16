"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, UserRole } from "@/lib/types/models/user";
import { MoreHorizontal, UserPlus, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface PaginationInfo {
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface UserManagementTableProps {
  initialUsers: User[];
  initialPagination: PaginationInfo;
}

export function UserManagementTable({ initialUsers, initialPagination }: UserManagementTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [pagination, setPagination] = useState<PaginationInfo>(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: UserRole.User,
  });

  // Function to fetch users with filters and pagination
  const fetchUsers = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchQuery) {
        queryParams.append("search", searchQuery);
      }

      if (roleFilter !== "all") {
        queryParams.append("role", roleFilter);
      }

      const response = await fetch(`/api/admin/users?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data.docs);
      setPagination({
        totalDocs: data.data.totalDocs,
        limit: data.data.limit,
        totalPages: data.data.totalPages,
        page: data.data.page,
        hasPrevPage: data.data.hasPrevPage,
        hasNextPage: data.data.hasNextPage,
        prevPage: data.data.prevPage,
        nextPage: data.data.nextPage
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    fetchUsers(1);
  };

  // Handle role filter change
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    fetchUsers(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  // Handle user creation
  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      toast.success("User created successfully");
      setIsCreateDialogOpen(false);
      setNewUser({
        fullName: "",
        email: "",
        password: "",
        role: UserRole.User,
      });
      fetchUsers(pagination.page);
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    }
  };

  // Handle user role update
  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }

      toast.success("User role updated successfully");

      // Update the user in the local state
      setUsers(users.map(user =>
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error: any) {
      toast.error(error.message || "Failed to update user role");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.values(UserRole).map((role) => (
                <SelectItem key={role} value={role}>
                  {role === UserRole.Admin ? "Administrator" : "User"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(UserRole).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role === UserRole.Admin ? "Administrator" : "User"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser}>
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || ""} alt={user.fullName} />
                        <AvatarFallback>
                          {user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === UserRole.Admin ? "default" : "outline"}>
                      {user.role === UserRole.Admin ? "Administrator" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.emailVerified ? "success" : "secondary"}>
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            // View user details
                            toast.info("View user details - Not implemented");
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            // Send password reset
                            toast.info("Send password reset - Not implemented");
                          }}
                        >
                          Send Password Reset
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.role === UserRole.Admin ? (
                          <DropdownMenuItem
                            onClick={() => handleUpdateUserRole(user._id, UserRole.User)}
                          >
                            Change to User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleUpdateUserRole(user._id, UserRole.Admin)}
                          >
                            Promote to Admin
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {users.length} of {pagination.totalDocs} users
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.prevPage || 1)}
            disabled={!pagination.hasPrevPage || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <div className="text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.nextPage || pagination.totalPages)}
            disabled={!pagination.hasNextPage || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
