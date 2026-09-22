import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { resetAuthStore, signInAs } from "@/test/auth";
import { mockApi, requestsTo } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { useAuthStore } from "../store";
import { SignOutButton } from "./sign-out-button";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

beforeEach(() => {
  resetAuthStore();
  replace.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

it("clears the cookie session, forgets the e-mail and goes to sign in", async () => {
  const user = userEvent.setup();
  signInAs();
  const fetchMock = mockApi({ "POST /session/logout": { status: 204 } });
  const { queryClient } = renderWithProviders(<SignOutButton />);
  queryClient.setQueryData(["current-user"], { user: { id: "1" } });

  await user.click(screen.getByRole("button", { name: "Sair" }));

  await waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in"));
  expect(requestsTo(fetchMock, "POST /session/logout")).toHaveLength(1);
  expect(useAuthStore.getState().email).toBeNull();
  // No trace of the previous user is left for whoever uses this browser next.
  expect(queryClient.getQueryData(["current-user"])).toBeUndefined();
});
