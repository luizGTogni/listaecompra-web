import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { meReply, mockApi, mockFetchNetworkFailure } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { RequireToken } from "./require-token";
import { RequireVerified } from "./require-verified";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

beforeEach(() => {
  replace.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RequireToken", () => {
  it("sends visitors without a session to sign in", async () => {
    mockApi({
      "GET /users/me": {
        status: 401,
        body: { name: "Unauthorized", message: "x" },
      },
    });
    renderWithProviders(
      <RequireToken>
        <p>secret</p>
      </RequireToken>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in"));
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("renders its children once the session is confirmed", async () => {
    mockApi({ "GET /users/me": meReply() });
    renderWithProviders(
      <RequireToken>
        <p>secret</p>
      </RequireToken>,
    );

    expect(await screen.findByText("secret")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects when a later check finds the session gone", async () => {
    mockApi({
      "GET /users/me": [
        meReply(),
        { status: 401, body: { name: "Unauthorized", message: "x" } },
      ],
    });
    const { queryClient } = renderWithProviders(
      <RequireToken>
        <p>secret</p>
      </RequireToken>,
    );
    expect(await screen.findByText("secret")).toBeInTheDocument();

    // This is what the app's global 401 handling does (see Providers) after
    // any authenticated request comes back Unauthorized.
    await queryClient.invalidateQueries({ queryKey: ["current-user"] });

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
    mockApi({ "GET /users/me": meReply("2026-09-20T12:05:00.000Z") });
    renderWithProviders(page);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(await screen.findByText("home")).toBeInTheDocument();
  });

  it("sends an unverified user to the code screen", async () => {
    mockApi({ "GET /users/me": meReply() });
    renderWithProviders(page);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/verify"));
    expect(screen.queryByText("home")).not.toBeInTheDocument();
  });

  it("sends a visitor with no session to sign in", async () => {
    mockApi({
      "GET /users/me": {
        status: 401,
        body: { name: "Unauthorized", message: "x" },
      },
    });
    renderWithProviders(page);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in"));
  });

  it("lets the user retry when the server is unreachable", async () => {
    const user = userEvent.setup();
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
