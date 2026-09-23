import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi, requestsTo } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { ResetPasswordForm } from "./reset-password-form";

const { replace, success } = vi.hoisted(() => ({
  replace: vi.fn(),
  success: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("sonner", () => ({ toast: { success } }));

async function fill(user: ReturnType<typeof userEvent.setup>, code = "ab3d9x") {
  await user.type(screen.getByLabelText("Código"), code);
  await user.type(screen.getByLabelText("Nova senha"), " newsecret ");
  await user.click(screen.getByRole("button", { name: "Redefinir senha" }));
}

beforeEach(() => {
  replace.mockClear();
  success.mockClear();
});
afterEach(() => vi.unstubAllGlobals());

describe("ResetPasswordForm", () => {
  it("validates before sending anything", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({});
    renderWithProviders(<ResetPasswordForm />);

    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));

    expect(
      await screen.findByText("Informe o código de 6 caracteres."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A senha deve ter pelo menos 3 caracteres."),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the upper-case code and the trimmed password, then goes to sign in", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({ "POST /password/reset": { status: 204 } });
    renderWithProviders(<ResetPasswordForm />);

    await fill(user);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in"));
    const [, init] = requestsTo(fetchMock, "POST /password/reset")[0];
    expect(JSON.parse(init!.body as string)).toEqual({
      codeValue: "AB3D9X",
      newPassword: "newsecret",
    });
    expect(success).toHaveBeenCalledWith(
      "Senha alterada. Entre com a nova senha.",
    );
  });

  it.each([
    ["CodeInvalid", 400, "Código incorreto"],
    ["ResourceNotFound", 404, "Código incorreto"],
    ["CodeExpired", 422, "Este código expirou"],
  ])("explains a %s answer", async (name, status, text) => {
    const user = userEvent.setup();
    mockApi({
      "POST /password/reset": { status, body: { name, message: name } },
    });
    renderWithProviders(<ResetPasswordForm />);

    await fill(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(text);
    expect(replace).not.toHaveBeenCalled();
  });
});
