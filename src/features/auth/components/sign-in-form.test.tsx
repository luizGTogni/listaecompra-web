import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuthStore } from "@/features/auth/store";
import { resetAuthStore } from "@/test/auth";
import {
  meReply,
  mockApi,
  mockFetchNetworkFailure,
  requestsTo,
} from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { SignInForm } from "./sign-in-form";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const session = { status: 204 };
async function signIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("E-mail"), " ana@example.com ");
  await user.type(screen.getByLabelText("Senha"), "secret");
  await user.click(screen.getByRole("button", { name: "Entrar" }));
}

beforeEach(() => {
  resetAuthStore();
  replace.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SignInForm", () => {
  it("validates before sending anything", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({});
    renderWithProviders(<SignInForm />);

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText("Informe um e-mail válido."),
    ).toBeInTheDocument();
    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("goes to the home page when the account is verified", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({
      "POST /session": session,
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
    });
    renderWithProviders(<SignInForm />);

    await signIn(user);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    const [, init] = requestsTo(fetchMock, "POST /session")[0];
    expect(JSON.parse(init!.body as string)).toEqual({
      email: "ana@example.com",
      password: "secret",
    });
    expect(useAuthStore.getState().email).toBe("ana@example.com");
    // The cookie the backend just set travels on the request that follows.
    const [, meInit] = requestsTo(fetchMock, "GET /users/me")[0];
    expect(meInit!.credentials).toBe("include");
  });

  it("goes to the code screen when the account is not verified yet", async () => {
    const user = userEvent.setup();
    mockApi({ "POST /session": session, "GET /users/me": meReply() });
    renderWithProviders(<SignInForm />);

    await signIn(user);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/verify"));
  });

  it("still goes home when the check fails for another reason", async () => {
    const user = userEvent.setup();
    mockApi({
      "POST /session": session,
      "GET /users/me": { status: 500, body: { name: "x", message: "x" } },
    });
    renderWithProviders(<SignInForm />);

    await signIn(user);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });

  it("shows a single message for wrong credentials", async () => {
    const user = userEvent.setup();
    mockApi({
      "POST /session": {
        status: 401,
        body: { name: "InvalidCredentials", message: "Invalid credentials." },
      },
    });
    renderWithProviders(<SignInForm />);

    await signIn(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "E-mail ou senha incorretos.",
    );
    expect(replace).not.toHaveBeenCalled();
    expect(useAuthStore.getState().email).toBeNull();
  });

  it("reports when the server cannot be reached", async () => {
    const user = userEvent.setup();
    mockFetchNetworkFailure();
    renderWithProviders(<SignInForm />);

    await signIn(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Não foi possível conectar/,
    );
  });

  it("shows progress while signing in", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    renderWithProviders(<SignInForm />);

    await signIn(user);

    expect(
      await screen.findByRole("button", { name: "Entrando..." }),
    ).toBeDisabled();
  });
});
