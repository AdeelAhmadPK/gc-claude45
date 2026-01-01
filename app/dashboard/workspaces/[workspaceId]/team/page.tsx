"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Mail, MoreVertical, Trash2, Crown, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Member {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  role: string;
  joinedAt: string;
}

export default function TeamPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId as string;
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");

  useEffect(() => {
    if (workspaceId) {
      fetchMembers();
    }
  }, [workspaceId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (res.ok) {
        setInviteEmail("");
        fetchMembers();
      }
    } catch (error) {
      console.error("Error inviting member:", error);
    }
  };

  const updateRole = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        fetchMembers();
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchMembers();
      }
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team</h1>
        <p className="text-muted-foreground mt-2">
          Manage workspace members and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite Team Members</CardTitle>
          <CardDescription>
            Send invitations to collaborate on this workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Email address"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OWNER">Owner</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="GUEST">Guest</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleInvite}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({members.length})</CardTitle>
          <CardDescription>
            Manage workspace members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user.image || undefined} />
                          <AvatarFallback>
                            {member.user.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.user.name || "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {member.user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={member.role}
                        onValueChange={(value) => updateRole(member.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OWNER">
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4" />
                              Owner
                            </div>
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="MEMBER">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Member
                            </div>
                          </SelectItem>
                          <SelectItem value="GUEST">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Guest
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => removeMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove from workspace
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
