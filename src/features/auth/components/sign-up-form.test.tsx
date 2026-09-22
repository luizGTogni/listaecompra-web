import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuthStore } from "@/features/auth/store";
import { resetAuthStore } from "@/test/auth";
import {
  mockApi,
  mockFetch,
  mockFetchNetworkFailure,
  requestsTo,
} from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { SignUpForm } from "./sign-up-form";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const created = {
  user: {
    id: "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
    name: "Ana Souza",
    username: "ana_souza",
    email: "ana@example.com",
    verifiedAt: null,
    createdAt: "2026-09-20T12:00:00.000Z",
  },
};

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Nome"), "Ana Souza");
  await user.type(screen.getByLabelText("Usuário"), "ana_souza");
  await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
  await user.type(screen.getByLabelText("Senha"), "secret");
}

const submit = () => screen.getByRole("button", { name: "Criar conta" });

beforeEach(() => {
  resetAuthStore();
  replace.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SignUpForm", () => {
  it("shows field errors and sends nothing when the data is invalid", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch(201, created);
    renderWithProviders(<SignUpForm />);

    await user.type(screen.getByLabelText("Usuário"), "a!");
    await user.click(submit());

    expect(await screen.findByText("Informe seu nome.")).toBeInTheDocument();
    expect(
      screen.getByText("O usuário deve ter pelo menos 3 caracteres."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Usuário")).toBeInvalid();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("validates a field when it loses focus", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignUpForm />);

    await user.type(screen.getByLabelText("E-mail"), "ana@");
    await user.tab();

    expect(
      await screen.findByText("Informe um e-mail válido."),
    ).toBeInTheDocument();
  });

  it("creates the account, signs in silently and goes to the code screen", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({
      "POST /users": { status: 201, body: created },
      "POST /session": { status: 204 },
    });
    renderWithProviders(<SignUpForm />);

    await user.type(screen.getByLabelText("Nome"), "  Ana Souza ");
    await user.type(screen.getByLabelText("Usuário"), "ana_souza");
    await user.type(screen.getByLabelText("E-mail"), "ana@example.com");
    await user.type(screen.getByLabelText("Senha"), "  secret  ");
    await user.click(submit());

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/verify"));

    const [, createInit] = requestsTo(fetchMock, "POST /users")[0];
    expect(JSON.parse(createInit!.body as string)).toEqual({
      name: "Ana Souza",
      username: "ana_souza",
      email: "ana@example.com",
      password: "secret",
    });
    const [, sessionInit] = requestsTo(fetchMock, "POST /session")[0];
    expect(JSON.parse(sessionInit!.body as string)).toEqual({
      email: "ana@example.com",
      password: "secret",
    });
    expect(useAuthStore.getState().email).toBe("ana@example.com");
    // The first code was just sent, so a resend is locked for the cooldown.
    expect(useAuthStore.getState().resendAvailableAt).toBeGreaterThan(
      Date.now() + 55_000,
    );
  });

  it("sends the user to sign in when only the automatic sign in fails", async () => {
    const user = userEvent.setup();
    mockApi({
      "POST /users": { status: 201, body: created },
      "POST /session": { status: 500, body: { name: "x", message: "x" } },
    });
    renderWithProviders(<SignUpForm />);

    await fillForm(user);
    await user.click(submit());

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in"));
    expect(useAuthStore.getState().email).toBeNull();
  });

  it("disables the button while the request is in flight", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    renderWithProviders(<SignUpForm />);

    await fillForm(user);
    await user.click(submit());

    const pending = await screen.findByRole("button", {
      name: "Criando conta...",
    });
    expect(pending).toBeDisabled();
  });

  it("marks the e-mail field when the e-mail is taken", async () => {
    const user = userEvent.setup();
    mockFetch(409, { name: "EmailAlreadyExists", message: "Taken." });
    renderWithProviders(<SignUpForm />);

    await fillForm(user);
    await user.click(submit());

    expect(
      await screen.findByText("Este e-mail já está em uso."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInvalid();
    expect(screen.getByLabelText("E-mail")).toHaveFocus();
    // The form stays filled so the user can fix it.
    expect(screen.getByLabelText("Usuário")).toHaveValue("ana_souza");
    expect(submit()).toBeEnabled();
    expect(replace).not.toHaveBeenCalled();
  });

  it("marks the username field when the username is taken", async () => {
    const user = userEvent.setup();
    mockFetch(409, { name: "UsernameAlreadyExists", message: "Taken." });
    renderWithProviders(<SignUpForm />);

    await fillForm(user);
    await user.click(submit());

    expect(
      await screen.findByText("Este nome de usuário já está em uso."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Usuário")).toBeInvalid();
  });

  it("marks the field the server rejected", async () => {
    const user = userEvent.setup();
    mockFetch(400, {
      name: "ValidationError",
      message: "Invalid data.",
      fields: [{ code: "invalid_format", field: "email", message: "x" }],
    });
    renderWithProviders(<SignUpForm />);

    await fillForm(user);
    await user.click(submit());

    await waitFor(() => expect(screen.getByLabelText("E-mail")).toBeInvalid());
  });

  it("reports when the server cannot be reached", async () => {
    const user = userEvent.setup();
    mockFetchNetworkFailure();
    renderWithProviders(<SignUpForm />);

    await fillForm(user);
    await user.click(submit());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Não foi possível conectar/,
    );
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignUpForm />);
    const password = screen.getByLabelText("Senha");
    const toggle = screen.getByRole("button", { name: "Mostrar senha" });

    expect(password).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);

    expect(password).toHaveAttribute("type", "text");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("hints at browsers and phones what each field is for", () => {
    renderWithProviders(<SignUpForm />);

    expect(screen.getByLabelText("Nome")).toHaveAttribute(
      "autocomplete",
      "name",
    );
    expect(screen.getByLabelText("Usuário")).toHaveAttribute(
      "autocomplete",
      "username",
    );
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Senha")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );
  });
});
