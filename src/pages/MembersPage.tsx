import { useState } from "react";
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
import { useRequireAuth } from "../hooks";
import {
  useMembers,
  useAddMember,
  useCreateAndAddMember,
  useRemoveMember,
  useUpdateMemberStatus,
} from "../hooks/queries/useMemberQueries";
import type { Member } from "../services/memberService";
import { transferService } from "../services/transferService";
import { isValidEmail } from "../utils";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export function MembersPage() {
  const { isReady, user } = useRequireAuth();
  const isManager = user?.role === "manager";

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"existing" | "manual">("existing");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualPassword, setManualPassword] = useState("");

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: members = [] as Member[], isLoading } = useMembers(true); // include inactive

  // ── Mutations ──────────────────────────────────────────────────────────────
  const addMember = useAddMember();
  const createAndAddMember = useCreateAndAddMember();
  const removeMember = useRemoveMember();
  const updateMemberStatus = useUpdateMemberStatus();

  const transferMutation = useMutation({
    mutationFn: (targetId: string) => transferService.requestTransfer({ target_member_id: targetId }),
    onSuccess: (res) => {
      toast.success((res as { message?: string }).message || "Transfer request sent successfully");
      setShowTransferModal(false);
      setShowDetailsModal(false);
      setSelectedMember(null);
    },
    onError: (err: Error) => toast.error(err.message || "Failed to send transfer request"),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddMember = async () => {
    if (activeTab === "existing") {
      if (!isValidEmail(newMemberEmail)) { setEmailError("Please enter a valid email"); return; }
      setEmailError("");
      await addMember.mutateAsync({ email: newMemberEmail });
      setNewMemberEmail("");
      setShowAddModal(false);
    } else {
      if (!manualName || !manualEmail || !manualPassword) { toast.error("Please fill in all fields"); return; }
      if (!isValidEmail(manualEmail)) { toast.error("Please enter a valid email"); return; }
      if (manualPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
      await createAndAddMember.mutateAsync({ full_name: manualName, email: manualEmail, password: manualPassword });
      setManualName(""); setManualEmail(""); setManualPassword("");
      setShowAddModal(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    await removeMember.mutateAsync(memberToRemove.user_id);
    setShowRemoveConfirm(false);
    setMemberToRemove(null);
  };

  const handleToggleStatus = async () => {
    if (!selectedMember) return;
    await updateMemberStatus.mutateAsync({ userId: selectedMember.user_id, is_active: !selectedMember.is_active });
    toast.success(`Member ${selectedMember.is_active ? "deactivated" : "activated"} successfully`);
    setShowDetailsModal(false);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

  const getAvatarColor = (name: string) => {
    const colors = ["bg-red-500","bg-orange-500","bg-amber-500","bg-green-500","bg-emerald-500","bg-teal-500","bg-cyan-500","bg-sky-500","bg-blue-500","bg-indigo-500","bg-violet-500","bg-purple-500","bg-fuchsia-500","bg-pink-500","bg-rose-500"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
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
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Members</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Manage your mess members ({members.length} total)</p>
          </div>
          {isManager && (
            <Button onClick={() => setShowAddModal(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Member
            </Button>
          )}
        </div>

        {/* Members List */}
        <Card className="overflow-hidden border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {members.map((member) => (
              <div
                key={member.user_id}
                className={`p-4 sm:px-6 flex items-center gap-4 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-all duration-200 cursor-pointer group ${!member.is_active ? "opacity-60 grayscale-[0.5]" : ""}`}
                onClick={() => { setSelectedMember(member); setShowDetailsModal(true); }}
              >
                <div className={`w-12 h-12 rounded-full ${getAvatarColor(member.full_name)} flex items-center justify-center text-white text-sm font-semibold shadow-inner shrink-0`}>
                  {getInitials(member.full_name)}
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate text-base">{member.full_name}</h3>
                      {member.role === "manager" && (
                        <Badge variant="success" size="sm" className="px-2 py-0.5 rounded-md font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Manager</Badge>
                      )}
                      {!member.is_active && (
                        <Badge variant="default" size="sm" className="px-2 py-0.5 rounded-md font-medium bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 truncate">
                      <svg className="w-4 h-4 mr-1.5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 sm:text-right shrink-0">
                    <div className="hidden sm:block">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">Joined</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                        {new Date(member.joined_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="p-12 text-center">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">No members found</h3>
                <p className="text-neutral-500 max-w-sm mx-auto">Get started by inviting members or adding them manually to your mess.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Member">
        <ModalBody>
          <div className="flex border-b border-neutral-200 dark:border-neutral-700 mb-4">
            {(["existing", "manual"] as const).map((tab) => (
              <button
                key={tab}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? "border-primary-500 text-primary-600 dark:text-primary-400" : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "existing" ? "Add Existing" : "Create New"}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {activeTab === "existing" ? (
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input type="email" value={newMemberEmail} onChange={(e) => { setNewMemberEmail(e.target.value); setEmailError(""); }} placeholder="member@example.com" error={emailError} />
                <p className="text-xs text-neutral-500 mt-1">Enter the email of an existing user to add them to your mess</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input type="text" value={manualName} onChange={(e) => setManualName(e.target.value)} placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <Input type="email" value={manualEmail} onChange={(e) => setManualEmail(e.target.value)} placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Initial Password</label>
                  <Input type="password" value={manualPassword} onChange={(e) => setManualPassword(e.target.value)} placeholder="Minimum 6 characters" />
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button onClick={handleAddMember} isLoading={addMember.isPending || createAndAddMember.isPending}>
            {activeTab === "existing" ? "Add Member" : "Create & Add Member"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Member Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => { setShowDetailsModal(false); setSelectedMember(null); }} title="Member Details">
        {selectedMember && (
          <>
            <ModalBody>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-full ${getAvatarColor(selectedMember.full_name)} flex items-center justify-center text-white text-xl font-semibold`}>
                  {getInitials(selectedMember.full_name)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">{selectedMember.full_name}</h3>
                  <p className="text-neutral-500">{selectedMember.email}</p>
                  <Badge variant={selectedMember.role === "manager" ? "success" : "default"} className="mt-2">
                    {selectedMember.role === "manager" ? "Manager" : "Member"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">Joined</span>
                  <span>{new Date(selectedMember.joined_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">Status</span>
                  <span>{selectedMember.is_active ? "Active" : "Inactive"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500">User ID</span>
                  <span className="font-mono text-xs">{selectedMember.user_id.substring(0, 8)}...</span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              {isManager && selectedMember.user_id !== user?.id && (
                <>
                  {selectedMember.is_active && (
                    <Button variant="outline" className="text-warning border-warning hover:bg-warning/10" onClick={() => setShowTransferModal(true)}>
                      Make Manager
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleToggleStatus} isLoading={updateMemberStatus.isPending}>
                    {selectedMember.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="danger" onClick={() => { setShowDetailsModal(false); setMemberToRemove(selectedMember); setShowRemoveConfirm(true); }}>
                    Remove
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => { setShowDetailsModal(false); setSelectedMember(null); }}>Close</Button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Transfer Manager Request */}
      <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Request Manager Transfer">
        {selectedMember && (
          <>
            <ModalBody>
              <div className="space-y-4">
                <div className="p-4 bg-info/10 rounded-lg">
                  <p className="text-sm text-info">
                    <strong>Note:</strong> A transfer request will be sent to <strong>{selectedMember.full_name}</strong>. They will need to accept the request before the transfer is complete. The request expires in 7 days.
                  </p>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Are you sure you want to request a transfer of manager role to <strong>{selectedMember.full_name}</strong>?
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setShowTransferModal(false)}>Cancel</Button>
              <Button onClick={() => transferMutation.mutate(selectedMember.user_id)} isLoading={transferMutation.isPending}>Send Request</Button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Remove Member Confirmation */}
      <Modal isOpen={showRemoveConfirm} onClose={() => setShowRemoveConfirm(false)} title="Remove Member">
        {memberToRemove && (
          <>
            <ModalBody>
              <p>Are you sure you want to remove <strong>{memberToRemove.full_name}</strong> from the mess? This action cannot be undone.</p>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => { setShowRemoveConfirm(false); setMemberToRemove(null); }}>Cancel</Button>
              <Button variant="danger" onClick={handleRemoveMember} isLoading={removeMember.isPending}>Remove</Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </MainLayout>
  );
}
