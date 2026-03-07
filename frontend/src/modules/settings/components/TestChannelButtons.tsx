import { useState } from "react";

import { Button, Input } from "@/components/ui";
import { useTestEmailSettings, useTestSmsSettings } from "../queries/useNotificationSettings";

export default function TestChannelButtons() {
  const [recipient, setRecipient] = useState("");
  const testEmailMutation = useTestEmailSettings();
  const testSmsMutation = useTestSmsSettings();

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <Input
        label="Test recipient"
        placeholder="email or phone"
        value={recipient}
        onChange={(event) => setRecipient(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          loading={testEmailMutation.isPending}
          onClick={() => testEmailMutation.mutate(recipient || undefined)}
        >
          Test Email
        </Button>
        <Button
          type="button"
          variant="outline"
          loading={testSmsMutation.isPending}
          onClick={() => testSmsMutation.mutate(recipient || undefined)}
        >
          Test SMS
        </Button>
      </div>
    </div>
  );
}
