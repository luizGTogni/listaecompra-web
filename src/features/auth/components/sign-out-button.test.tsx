import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { resetAuthStore, signInAs } from "@/test/auth";
import { renderWithProviders } from "@/test/render";
import { useAuthStore } from "../store";
import { SignOutButton } from "./sign-out-button";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

beforeEach(() => {
  resetAuthStore();
  replace.mockClear();
});

it("ends the session and goes to sign in", async () => {
  const user = userEvent.setup();
  signInAs();
  renderWithProviders(<SignOutButton />);

  await user.click(screen.getByRole("button", { name: "Sair" }));

  expect(useAuthStore.getState().token).toBeNull();
  expect(replace).toHaveBeenCalledWith("/sign-in");
});
