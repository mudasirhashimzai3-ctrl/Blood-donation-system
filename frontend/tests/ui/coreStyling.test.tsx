import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button, Input, Card, CardContent } from "@/components/ui";

describe("Core styling bridge", () => {
  it("applies canonical class contracts for button, input, and card", () => {
    render(
      <div>
        <Button>Save</Button>
        <Input label="Operator Email" />
        <Card data-testid="card">
          <CardContent className="mt-0">Card Content</CardContent>
        </Card>
      </div>
    );

    const button = screen.getByRole("button", { name: "Save" });
    const input = screen.getByLabelText("Operator Email");
    const card = screen.getByTestId("card");

    expect(button.className).toContain("btn");
    expect(button.className).toContain("btn-primary");
    expect(input.className).toContain("form-input");
    expect(card.className).toContain("blood-card");
  });
});
