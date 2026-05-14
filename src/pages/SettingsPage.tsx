import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { PendingTransferCard } from "../components/settings/PendingTransferCard";
import { useAuth } from "../context";
import { useRequireAuth } from "../hooks";

import { type UpdateMessPayload } from "../services/messService";

import { useMembers } from "../hooks/queries/useMemberQueries";
import { useMess, useUpdateMess, useDeleteMess, usePendingTransfers, useRequestTransfer } from "../hooks/queries/useMessQueries";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface NotificationSettings {
  meal_updates: boolean;
  expense_updates: boolean;
  deposit_updates: boolean;
  manager_transfer: boolean;
  market_day_reminder: boolean;
}

export function SettingsPage() {
  const { isReady, user } = useRequireAuth();
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const { data: mess, isLoading: isMessLoading } = useMess();
  const { data: members = [], isLoading: isMembersLoading } = useMembers();
  const { data: pendingTransfers = [], refetch: loadPendingTransfers } = usePendingTransfers();
  
  const updateMess = useUpdateMess();
  const deleteMess = useDeleteMess();
  const requestTransfer = useRequestTransfer();

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    meal_updates: false,
    expense_updates: true,
    deposit_updates: true,
    manager_transfer: true,
    market_day_reminder: true,
  });

  // Theme
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  // Form state
  const [formData, setFormData] = useState<UpdateMessPayload>({
    name: "",
    address: "",
    automatic_market_date: "",
    currency: "BDT",
  });

  // Calculate next market day
  const getNextMarketDay = (dayName: string): string => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    const targetDay = days.indexOf(dayName);
    const currentDay = today.getDay();

    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) {
      daysUntil += 7;
    }

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    return nextDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (isReady && mess) {
      setFormData({
        name: mess.name,
        address: mess.address || "",
        automatic_market_date: mess.automatic_market_date || "Friday",
        currency: mess.currency || "BDT",
      });

      // Load profile data from user
      if (authUser) {
        setProfileData({
          full_name: authUser.full_name || "",
          email: authUser.email || "",
          phone: "", // Would come from extended user profile
        });
      }

      // Load saved theme preference
      const savedTheme = localStorage.getItem("theme") as
        | "light"
        | "dark"
        | "system"
        | null;
      if (savedTheme) {
        setTheme(savedTheme);
      }

      // Load saved notification settings
      const savedNotifications = localStorage.getItem("notifications");
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    }
  }, [isReady, mess, authUser]);

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast.error("Mess name is required");
      return;
    }

    try {
      const updated = await updateMess.mutateAsync(formData);
      
      // Also update the global currency formatting
      if (updated.currency) {
        import("../utils/format.utils").then(({ setGlobalCurrency }) => {
          setGlobalCurrency(updated.currency as string);
        });
      }
    } catch (error) {
      // Error is handled by hook
    }
  };

  const handleSaveProfile = async () => {
    // In a real app, this would call an API to update profile
    toast.success("Profile updated successfully");
    setIsEditingProfile(false);
  };

  const handleSaveNotifications = () => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
    toast.success("Notification preferences saved");
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    // Apply theme immediately
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }

    toast.success(`Theme set to ${newTheme}`);
  };

  const handleTransferManager = async () => {
    if (!selectedMemberId) {
      toast.error("Please select a member");
      return;
    }

    try {
      await requestTransfer.mutateAsync({
        target_member_id: selectedMemberId,
      });
      setShowTransferModal(false);
      setSelectedMemberId("");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDeleteMess = async () => {
    try {
      await deleteMess.mutateAsync();
      logout();
      navigate("/");
    } catch (error) {
      // Error handled by hook
    }
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

  const isManager = user?.role === "manager";
  const otherMembers = members.filter((m) => m.user_id !== user?.id);

  const isLoading = isMessLoading || isMembersLoading;

  if (!isReady || isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner fullScreen message="Loading settings..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your mess settings and preferences
          </p>
        </div>

        {/* Pending Transfer Requests - Show if user has pending transfers */}
        {pendingTransfers.length > 0 && (
          <PendingTransferCard
            transfers={pendingTransfers}
            onUpdate={loadPendingTransfers}
          />
        )}

        {/* Profile Section */}
        <Card className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-4">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Profile</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Manage your personal information
              </p>
            </div>
            <Badge variant="default">{authUser?.role}</Badge>
          </div>

          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div
                className={`w-20 h-20 rounded-full ${getAvatarColor(
                  authUser?.full_name || "User",
                )} flex items-center justify-center text-white text-2xl font-bold`}
              >
                {getInitials(authUser?.full_name || "User")}
              </div>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info("Avatar upload coming soon")}
                >
                  Change Avatar
                </Button>
                <p className="text-xs text-neutral-500 mt-1">
                  Supported: JPG, PNG (max 2MB)
                </p>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                  disabled={!isEditingProfile}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">Email</label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  disabled={!isEditingProfile}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  Phone (Optional)
                </label>
                <Input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  disabled={!isEditingProfile}
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>

            <div className="pt-2">
              {isEditingProfile ? (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingProfile(false);
                      // Reset to original values
                      if (authUser) {
                        setProfileData({
                          full_name: authUser.full_name || "",
                          email: authUser.email || "",
                          phone: "",
                        });
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile}>Save Profile</Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Theme Preferences */}
        <Card className="space-y-6">
          <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Appearance</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Customize your app theme
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "light", label: "Light", icon: "☀️" },
                { value: "dark", label: "Dark", icon: "🌙" },
                { value: "system", label: "System", icon: "⚙️" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    handleThemeChange(
                      option.value as "light" | "dark" | "system",
                    )
                  }
                  className={`p-4 rounded-lg border-2 transition-all ${theme === option.value
                      ? "border-primary bg-primary/5"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                    }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="space-y-6">
          <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Notifications</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Choose what notifications you want to receive
            </p>
          </div>

          <div className="space-y-4">
            {[
              /* {
                key: "meal_updates",
                label: "Meal Updates",
                description: "When meals are added or updated",
              }, */
              {
                key: "expense_updates",
                label: "Expense Updates",
                description: "When new expenses are recorded",
              },
              {
                key: "deposit_updates",
                label: "Deposit Updates",
                description: "When deposits are added",
              },
              {
                key: "manager_transfer",
                label: "Manager Transfer",
                description: "When manager role is transferred",
              },
              {
                key: "market_day_reminder",
                label: "Market Day Reminder",
                description: "Reminder before your weekly market day",
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={
                    notifications[item.key as keyof NotificationSettings]
                  }
                  onChange={(e) => {
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: e.target.checked,
                    }));
                  }}
                  className="w-5 h-5 mt-0.5 rounded border-neutral-300 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-neutral-500">{item.description}</p>
                </div>
              </label>
            ))}

            <div className="pt-2">
              <Button variant="outline" onClick={handleSaveNotifications}>
                Save Notification Preferences
              </Button>
            </div>
          </div>
        </Card>

        {/* Mess Information */}
        <Card className="space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-4">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Mess Information</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Update your mess details
              </p>
            </div>
            <Badge variant={isManager ? "success" : "default"}>
              {isManager ? "Manager" : "Member"}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Mess Name
              </label>
              <Input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={!isManager}
                placeholder="Enter mess name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Address (Optional)
              </label>
              <Input
                type="text"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                disabled={!isManager}
                placeholder="Enter mess address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Weekly Market Day
              </label>
              <select
                value={formData.automatic_market_date || "Friday"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    automatic_market_date: e.target.value,
                  }))
                }
                disabled={!isManager}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                Day when you typically go to the market for groceries
              </p>
              {formData.automatic_market_date && (
                <div className="mt-2 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Next reminder:</span>{" "}
                    {getNextMarketDay(formData.automatic_market_date)}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Currency
              </label>
              <select
                value={formData.currency || "BDT"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currency: e.target.value,
                  }))
                }
                disabled={!isManager}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              >
                <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                Global currency used for all monetary values in the app
              </p>
            </div>

            {isManager && (
              <div className="pt-4">
                <Button
                  onClick={handleSave}
                  isLoading={updateMess.isPending}
                  className="px-6"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Mess ID Display */}
        <Card className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Mess ID</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Share this ID with others to let them join your mess
            </p>
          </div>

          <div className="flex items-center gap-3">
            <code className="flex-1 px-4 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg font-mono text-sm break-all">
              {mess?.id}
            </code>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(mess?.id || "");
                toast.success("Mess ID copied to clipboard");
              }}
            >
              Copy
            </Button>
          </div>
        </Card>

        {/* Manager Transfer - Only for managers */}
        {isManager && (
          <Card className="space-y-4 border-warning/30">
            <div>
              <h2 className="text-xl font-semibold text-warning">
                Transfer Manager Role
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Transfer your manager privileges to another member
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowTransferModal(true)}
              className="border-warning text-warning hover:bg-warning/10"
            >
              Transfer Manager Role
            </Button>
          </Card>
        )}

        {/* Danger Zone - Only for managers */}
        {isManager && (
          <Card className="space-y-4 border-error/30">
            <div>
              <h2 className="text-xl font-semibold text-error">Danger Zone</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Irreversible actions. Proceed with caution.
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">
                Warning: Deleting this mess will permanently remove all associated data, including members, meals, expenses, and deposits. This action cannot be undone!
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(true)}
              className="border-error text-error hover:bg-error/10"
            >
              Delete Mess
            </Button>
          </Card>
        )}
      </div>

      {/* Transfer Manager Modal */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Request Manager Transfer"
      >
        <ModalBody>
          <div className="space-y-4">
            <div className="p-4 bg-info/10 rounded-lg">
              <p className="text-sm text-info">
                <strong>Note:</strong> A transfer request will be sent to the
                selected member. They will need to accept the request before the
                transfer is complete. The request expires in 7 days.
              </p>
            </div>

            {otherMembers.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No other members in the mess to transfer to.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {otherMembers.map((member) => (
                  <label
                    key={member.user_id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedMemberId === member.user_id
                        ? "border-primary bg-primary/5"
                        : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      }`}
                  >
                    <input
                      type="radio"
                      name="transferMember"
                      value={member.user_id}
                      checked={selectedMemberId === member.user_id}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{member.full_name}</p>
                      <p className="text-sm text-neutral-500">{member.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowTransferModal(false);
              setSelectedMemberId("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransferManager}
            isLoading={requestTransfer.isPending}
            disabled={!selectedMemberId || otherMembers.length === 0}
          >
            Send Request
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Mess"
        description="Are you sure you want to delete this mess? This action cannot be undone."
      >
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={deleteMess.isPending}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteMess} isLoading={deleteMess.isPending}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </MainLayout>
  );
}
