import { useState } from "react";
import { toast } from "sonner";
import { authService } from "../../services/authService";
import {
  transferService,
  type TransferRequest,
} from "../../services/transferService";
import { Button, Card } from "../common";

interface PendingTransferCardProps {
  transfers: TransferRequest[];
  onUpdate: () => void;
}

export function PendingTransferCard({
  transfers,
  onUpdate,
}: PendingTransferCardProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (transferId: string) => {
    setProcessingId(transferId);
    try {
      await transferService.approveTransfer(transferId);
      toast.success("You are now the manager!");
      // Refresh user data from server to update role in localStorage
      await authService.getCurrentUserInfo();
      onUpdate();
      // Reload page to update role in UI
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to approve transfer",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (transferId: string) => {
    setProcessingId(transferId);
    try {
      await transferService.rejectTransfer(transferId);
      toast.success("Transfer request rejected");
      onUpdate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reject transfer",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Expires soon";
    if (diffDays === 1) return "Expires in 1 day";
    return `Expires in ${diffDays} days`;
  };

  if (transfers.length === 0) {
    return null;
  }

  return (
    <Card className="space-y-4 border-primary/30">
      <div>
        <h2 className="text-xl font-semibold text-primary">
          Pending Manager Transfer
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          You have been selected to receive manager privileges
        </p>
      </div>

      <div className="space-y-3">
        {transfers.map((transfer) => (
          <div
            key={transfer.id}
            className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">
                  Transfer from {transfer.from_manager_name}
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  Requested on{" "}
                  {new Date(transfer.requested_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-warning mt-1">
                  {formatTimeRemaining(transfer.expires_at)}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => handleReject(transfer.id)}
                isLoading={processingId === transfer.id}
                disabled={!!processingId}
                className="flex-1"
              >
                Decline
              </Button>
              <Button
                onClick={() => handleApprove(transfer.id)}
                isLoading={processingId === transfer.id}
                disabled={!!processingId}
                className="flex-1"
              >
                Accept
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
