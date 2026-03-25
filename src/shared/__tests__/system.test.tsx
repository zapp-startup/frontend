import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  AppButton,
  AppDialog,
  AppDialogBody,
  AppDialogContent,
  AppDialogHeader,
  AppDialogTitle,
  AppInput,
  EmptyState,
  FormField,
  LoadingState,
  Surface,
} from "@/shared/components/system";

describe("system components", () => {
  it("renders the primary app primitives with standardized classes", () => {
    render(
      <div>
        <AppButton>Save</AppButton>
        <FormField label="Name" htmlFor="name-field">
          <AppInput id="name-field" />
        </FormField>
        <Surface>Card body</Surface>
      </div>
    );

    expect(screen.getByRole("button", { name: "Save" })).toHaveClass("app-button");
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveClass("app-input");
    expect(screen.getByText("Card body")).toHaveClass("app-surface-card");
  });

  it("renders shared empty and loading states", () => {
    render(
      <div>
        <EmptyState title="Nothing here" description="Add something to continue." />
        <LoadingState label="Loading data" />
      </div>
    );

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("Loading data")).toBeInTheDocument();
  });

  it("renders the app dialog wrapper", () => {
    render(
      <AppDialog open onOpenChange={() => undefined}>
        <AppDialogContent>
          <AppDialogHeader>
            <AppDialogTitle>Dialog title</AppDialogTitle>
          </AppDialogHeader>
          <AppDialogBody>Dialog body</AppDialogBody>
        </AppDialogContent>
      </AppDialog>
    );

    expect(screen.getByText("Dialog title")).toBeInTheDocument();
    expect(screen.getByText("Dialog body")).toBeInTheDocument();
  });
});
