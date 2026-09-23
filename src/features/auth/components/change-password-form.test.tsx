import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi, requestsTo } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { ChangePasswordForm } from "./change-password-form";

const { success } = vi.hoisted(() => ({ success: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success } }));

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Senha atual"), "oldsecret");
  await user.type(screen.getByLabelText("Nova senha"), "newsecret");
  await user.click(screen.getByRole("button", { name: "Alterar senha" }));
}

beforeEach(() => success.mockClear());
afterEach(() => vi.unstubAllGlobals());

describe("ChangePasswordForm", () => {
  it("validates before sending anything", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({});
    renderWithProviders(<ChangePasswordForm />);

    await user.click(screen.getByRole("button", { name: "Alterar senha" }));

    expect(
      await screen.findByText("Informe sua senha atual."),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends both passwords with PATCH, confirms and clears the fields", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({
      "PATCH /users/password/change": { status: 204 },
    });
    renderWithProviders(<ChangePasswordForm />);

    await fill(user);

    await waitFor(() =>
      expect(success).toHaveBeenCalledWith("Senha alterada."),
    );
    const [, init] = requestsTo(fetchMock, "PATCH /users/password/change")[0];
    expect(JSON.parse(init!.body as string)).toEqual({
      currentPassword: "oldsecret",
      newPassword: "newsecret",
    });
    expect(screen.getByLabelText("Senha atual")).toHaveValue("");
    expect(screen.getByLabelText("Nova senha")).toHaveValue("");
  });

  it("blames the current password field when it is wrong", async () => {
    const user = userEvent.setup();
    mockApi({
      "PATCH /users/password/change": {
        status: 401,
        body: { name: "InvalidCredentials", message: "Invalid credentials." },
      },
    });
    renderWithProviders(<ChangePasswordForm />);

    await fill(user);

    expect(
      await screen.findByText("Senha atual incorreta."),
    ).toBeInTheDocument();
    expect(success).not.toHaveBeenCalled();
  });

  it("blames the new password field when it repeats the old one", async () => {
    const user = userEvent.setup();
    mockApi({
      "PATCH /users/password/change": {
        status: 400,
        body: { name: "SamePassword", message: "same" },
      },
    });
    renderWithProviders(<ChangePasswordForm />);

    await fill(user);

    expect(
      await screen.findByText("A nova senha deve ser diferente da atual."),
    ).toBeInTheDocument();
  });
});
