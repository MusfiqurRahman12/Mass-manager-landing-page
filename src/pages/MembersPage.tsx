import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  Input,
  LoadingSpinner,
  Modal,
  ModalBody,
  ModalFooter,
} from "../components/common";
import { MainLayout } from "../components/layout";
import { useAuth } from "../context";
import { useRequireAuth } from "../hooks";
import { type Member, memberService } from "../services/memberService";
import { isValidEmail } from "../utils";

interface InviteCode {
  code: string;
  expiresAt: string;
}

export function MembersPage() {
  const { isReady, user } = useRequireAuth();
  const { user: authUser } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);

  // Add member modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Invite code state
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Member details modal
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Remove confirmation
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Transfer manager
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      setIsManager(user.role === "manager");
      loadMembers();
    }
  }, [isReady, user]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await memberService.getMembers();
      setMembers(data);
    } catch (error) {
      toast.error("Failed to load members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!isValidEmail(newMemberEmail)) {
      setEmailError("Please enter a valid email");
      return;
    }

    setIsAdding(true);
    setEmailError("");
    try {
      await memberService.addMember({ email: newMemberEmail });
      toast.success("Member added successfully");
      setNewMemberEmail("");
      setShowAddModal(false);
      loadMembers();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add member",
      );
    } finally {
      setIsAdding(false);
    }
  };

  const generateInviteCode = async () => {
    setIsGeneratingCode(true);
    try {
      // Simulate API call - replace with actual endpoint when available
      const mockCode = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      setInviteCode({
        code: mockCode,
        expiresAt: expiresAt.toISOString(),
      });
      toast.success("Invite code generated");
    } catch (error) {
      toast.error("Failed to generate invite code");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode.code);
      toast.success("Invite code copied");
    }
  };

  const confirmRemoveMember = (member: Member) => {
    setMemberToRemove(member);
    setShowRemoveConfirm(true);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setIsRemoving(true);
    try {
      await memberService.removeMember(memberToRemove.user_id);
      toast.success("Member removed successfully");
      setShowRemoveConfirm(false);
      setMemberToRemove(null);
      loadMembers();
    } catch (error) {
      toast.error("Failed to remove member");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleTransferManager = async () => {
    if (!selectedMember) return;

    setIsTransferring(true);
    try {
      await memberService.transferManager({
        user_id: selectedMember.user_id,
      });
      toast.success("Manager role transferred successfully");
      setShowTransferModal(false);
      setShowDetailsModal(false);
      setSelectedMember(null);
      loadMembers();
      // Refresh user data to update role
      window.location.reload();
    } catch (error) {
      toast.error("Failed to transfer manager role");
    } finally {
      setIsTransferring(false);
    }
  };

  const openMemberDetails = (member: Member) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-green-500",
      "bg-emerald-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-sky-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-violet-500",
      "bg-purple-500",
      "bg-fuchsia-500",
      "bg-pink-500",
      "bg-rose-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (!isReady || isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner fullScreen message="Loading members..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              Members
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage your mess members ({members.length} total)
            </p>
          </div>
          {isManager && (
            <Button onClick={() => setShowAddModal(true)}>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Member
            </Button>
          )}
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <Card
              key={member.user_id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openMemberDetails(member)}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full ${getAvatarColor(
                    member.full_name,
                  )} flex items-center justify-center text-white font-semibold`}
                >
                  {getInitials(member.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">
                      {member.full_name}
                    </h3>
                    {member.role === "manager" && (
                      <Badge variant="success" size="sm">
                        Manager
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 truncate">
                    {member.email}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Member"
      >
        <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => {
                    setNewMemberEmail(e.target.value);
                    setEmailError("");
                  }}
                  placeholder="member@example.com"
                  error={emailError}
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Enter the email of an existing user to invite them to your
                  mess
                </p>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <label className="block text-sm font-medium mb-2">
                  Or Generate Invite Code
                </label>
                {inviteCode ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg font-mono text-lg text-center">
                        {inviteCode.code}
                      </code>
                      <Button variant="outline" onClick={copyInviteCode}>
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Expires at{" "}
                      {new Date(inviteCode.expiresAt).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={generateInviteCode}
                    isLoading={isGeneratingCode}
                    className="w-full"
                  >
                    Generate Invite Code
                  </Button>
                )}
              </div>
            </div>
          </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddMember} isLoading={isAdding}>
            Add Member
          </Button>
        </ModalFooter>
      </Modal>

      {/* Member Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedMember(null);
        }}
        title="Member Details"
      >
        {selectedMember && (
          <>
            <ModalBody>
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-16 h-16 rounded-full ${getAvatarColor(
                    selectedMember.full_name,
                  )} flex items-center justify-center text-white text-xl font-semibold`}
                >
                  {getInitials(selectedMember.full_name)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedMember.full_name}
                  </h3>
                  <p className="text-neutral-500">{selectedMember.email}</p>
                  <Badge
                    variant={
                      selectedMember.role === "manager" ? "success" : "default"
                    }
                    className="mt-2"
                  >
                    {selectedMember.role === "manager" ? "Manager" : "Member"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">Joined</span>
                  <span>
                    {new Date(selectedMember.joined_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">Status</span>
                  <span>{selectedMember.is_active ? "Active" : "Inactive"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">User ID</span>
                  <span className="font-mono text-xs">
                    {selectedMember.user_id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              {isManager && selectedMember.user_id !== user?.id && (
                <>
                  <Button
                    variant="outline"
                    className="text-warning border-warning hover:bg-warning/10"
                    onClick={() => setShowTransferModal(true)}
                  >
                    Make Manager
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDetailsModal(false);
                      confirmRemoveMember(selectedMember);
                    }}
                  >
                    Remove Member
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedMember(null);
                }}
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Transfer Manager Confirmation */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Transfer Manager Role"
      >
        {selectedMember && (
          <>
            <ModalBody>
              <div className="space-y-4">
                <div className="p-4 bg-warning/10 rounded-lg">
                  <p className="text-sm text-warning">
                    <strong>Warning:</strong> This action cannot be undone. You
                    will lose manager privileges and become a regular member.
                  </p>
                </div>
                <p>
                  Are you sure you want to transfer manager role to{" "}
                  <strong>{selectedMember.full_name}</strong>?
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="outline"
                onClick={() => setShowTransferModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleTransferManager}
                isLoading={isTransferring}
              >
                Transfer Role
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Remove Member Confirmation */}
      <Modal
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        title="Remove Member"
      >
        {memberToRemove && (
          <>
            <ModalBody>
              <p>
                Are you sure you want to remove{" "}
                <strong>{memberToRemove.full_name}</strong> from the mess? This
                action cannot be undone.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRemoveConfirm(false);
                  setMemberToRemove(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemoveMember}
                isLoading={isRemoving}
              >
                Remove
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </MainLayout>
  );
}
