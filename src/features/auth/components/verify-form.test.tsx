import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { resetAuthStore, signInAs } from "@/test/auth";
import { mockApi, requestsTo } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { useAuthStore } from "../store";
import { VerifyForm } from "./verify-form";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const codeInput = () => screen.getByLabelText("Código de verificação");

beforeEach(() => {
  resetAuthStore();
  signInAs("ana@example.com", "jwt-token");
  replace.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("VerifyForm", () => {
  it("says where the code was sent", () => {
    mockApi({});
    renderWithProviders(<VerifyForm />);

    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByText(/código de 6 caracteres/)).toBeInTheDocument();
  });

  it("submits automatically when the 6th character is typed", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({ "POST /users/verify": { status: 204 } });
    renderWithProviders(<VerifyForm />);

    await user.type(codeInput(), "ab3d9x");

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    const [, init] = requestsTo(fetchMock, "POST /users/verify")[0];
    // Typed in lower case, sent in upper case, with the session token.
    expect(JSON.parse(init!.body as string)).toEqual({ codeValue: "AB3D9X" });
    expect(init!.headers).toMatchObject({ Authorization: "Bearer jwt-token" });
  });

  it("does not submit an incomplete code", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({});
    renderWithProviders(<VerifyForm />);

    await user.type(codeInput(), "AB3");

    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("clears the boxes and explains a wrong code", async () => {
    const user = userEvent.setup();
    mockApi({
      "POST /users/verify": {
        status: 400,
        body: { name: "CodeInvalid", message: "Code invalid." },
      },
    });
    renderWithProviders(<VerifyForm />);

    await user.type(codeInput(), "AAAAAA");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Código incorreto.",
    );
    expect(codeInput()).toHaveValue("");
    expect(codeInput()).toHaveFocus();
    expect(replace).not.toHaveBeenCalled();
    // A wrong code is not a dead session.
    expect(useAuthStore.getState().token).toBe("jwt-token");
  });

  it("explains an expired code", async () => {
    const user = userEvent.setup();
    mockApi({
      "POST /users/verify": {
        status: 422,
        body: { name: "CodeExpired", message: "Code expired." },
      },
    });
    renderWithProviders(<VerifyForm />);

    await user.type(codeInput(), "AAAAAA");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Este código expirou.",
    );
  });

  it("treats an already verified account as success", async () => {
    const user = userEvent.setup();
    mockApi({
      "POST /users/verify": {
        status: 409,
        body: { name: "UserAlreadyVerified", message: "x" },
      },
    });
    renderWithProviders(<VerifyForm />);

    await user.type(codeInput(), "AAAAAA");

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });

  it("signs the user out when the session token is rejected", async () => {
    const user = userEvent.setup();
    mockApi({
      "POST /users/verify": {
        status: 401,
        body: { name: "Unauthorized", message: "Unauthorized." },
      },
    });
    renderWithProviders(<VerifyForm />);

    await user.type(codeInput(), "AAAAAA");

    await waitFor(() => expect(useAuthStore.getState().token).toBeNull());
  });

  it("resends the code and locks the button for 60 seconds", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const fetchMock = mockApi({ "POST /code/resend": { status: 204 } });
    renderWithProviders(<VerifyForm />);

    await user.click(screen.getByRole("button", { name: "Reenviar código" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Enviamos um novo código.",
    );
    expect(requestsTo(fetchMock, "POST /code/resend")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "Reenviar código em 60s" }),
    ).toBeDisabled();

    await act(() => vi.advanceTimersByTimeAsync(60_000));

    expect(
      screen.getByRole("button", { name: "Reenviar código" }),
    ).toBeEnabled();
  });

  it("starts locked when the code was just sent at sign-up", () => {
    mockApi({});
    useAuthStore.setState({ resendAvailableAt: Date.now() + 45_000 });
    renderWithProviders(<VerifyForm />);

    expect(
      screen.getByRole("button", { name: "Reenviar código em 45s" }),
    ).toBeDisabled();
  });

  it("follows the server when a resend comes too early", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ name: "TooManyRequests", message: "x" }),
            { status: 429, headers: { "Retry-After": "42" } },
          ),
        ),
    );
    renderWithProviders(<VerifyForm />);

    await user.click(screen.getByRole("button", { name: "Reenviar código" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Aguarde 42s para pedir um novo código.",
    );
    expect(
      screen.getByRole("button", { name: "Reenviar código em 42s" }),
    ).toBeDisabled();
  });

  it("lets the user leave with another account", async () => {
    const user = userEvent.setup();
    mockApi({});
    renderWithProviders(<VerifyForm />);

    await user.click(screen.getByRole("button", { name: "Usar outra conta" }));

    expect(useAuthStore.getState().token).toBeNull();
    expect(replace).toHaveBeenCalledWith("/sign-in");
  });
});
