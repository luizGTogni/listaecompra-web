import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { resetAuthStore, signInAs } from "@/test/auth";
import { meReply, mockApi, mockFetchNetworkFailure } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { useAuthStore } from "../store";
import { RequireToken } from "./require-token";
import { RequireVerified } from "./require-verified";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

beforeEach(() => {
  resetAuthStore();
  replace.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RequireToken", () => {
  it("sends visitors without a session to sign in", async () => {
    renderWithProviders(
      <RequireToken>
        <p>secret</p>
      </RequireToken>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in"));
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("renders its children for a signed-in user", () => {
    signInAs();
    renderWithProviders(
      <RequireToken>
        <p>secret</p>
      </RequireToken>,
    );

    expect(screen.getByText("secret")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects when the session disappears", async () => {
    signInAs();
    renderWithProviders(
      <RequireToken>
        <p>secret</p>
      </RequireToken>,
    );

    useAuthStore.getState().clearSession();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in"));
  });
});

describe("RequireVerified", () => {
  const page = (
    <RequireVerified>
      <p>home</p>
    </RequireVerified>
  );

  it("shows a spinner, then the page, for a verified user", async () => {
    signInAs();
    mockApi({ "GET /users/me": meReply("2026-09-20T12:05:00.000Z") });
    renderWithProviders(page);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(await screen.findByText("home")).toBeInTheDocument();
  });

  it("sends an unverified user to the code screen", async () => {
    signInAs();
    mockApi({ "GET /users/me": meReply() });
    renderWithProviders(page);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/verify"));
    expect(screen.queryByText("home")).not.toBeInTheDocument();
  });

  it("signs out when the API says the token expired", async () => {
    signInAs();
    mockApi({
      "GET /users/me": {
        status: 401,
        body: { name: "Unauthorized", message: "Unauthorized." },
      },
    });
    renderWithProviders(page);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in"));
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("lets the user retry when the server is unreachable", async () => {
    const user = userEvent.setup();
    signInAs();
    mockFetchNetworkFailure();
    renderWithProviders(page);

    expect(
      await screen.findByRole("alert", {}, { timeout: 5000 }),
    ).toHaveTextContent("Não foi possível carregar sua conta");

    mockApi({ "GET /users/me": meReply("2026-09-20T12:05:00.000Z") });
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("home")).toBeInTheDocument();
  });
});
