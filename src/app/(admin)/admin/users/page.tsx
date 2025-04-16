import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dbService } from "@/lib/db/service";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { User } from "@/lib/types/models/user";

export default async function UsersManagementPage() {
  await dbService.connect();
  
  // Fetch users with pagination
  const usersResult = await dbService.user.paginate({}, {
    page: 1,
    limit: 10,
    sort: { createdAt: -1 },
    lean: true
  });
  
  // Convert to plain objects for serialization
  const users = JSON.parse(JSON.stringify(usersResult.docs)) as User[];
  const pagination = {
    totalDocs: usersResult.totalDocs,
    limit: usersResult.limit,
    totalPages: usersResult.totalPages,
    page: usersResult.page,
    hasPrevPage: usersResult.hasPrevPage,
    hasNextPage: usersResult.hasNextPage,
    prevPage: usersResult.prevPage,
    nextPage: usersResult.nextPage
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagementTable initialUsers={users} initialPagination={pagination} />
        </CardContent>
      </Card>
    </div>
  );
}
