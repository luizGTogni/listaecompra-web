import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi, mockFetchNetworkFailure, requestsTo } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { ForgotPasswordForm } from "./forgot-password-form";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

async function submit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("E-mail"), " ana@example.com ");
  await user.click(screen.getByRole("button", { name: "Enviar código" }));
}

beforeEach(() => replace.mockClear());
afterEach(() => vi.unstubAllGlobals());

describe("ForgotPasswordForm", () => {
  it("validates the e-mail before sending anything", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({});
    renderWithProviders(<ForgotPasswordForm />);

    await user.click(screen.getByRole("button", { name: "Enviar código" }));

    expect(
      await screen.findByText("Informe um e-mail válido."),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the trimmed e-mail and moves on to the code screen", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({ "POST /password/forgot": { status: 204 } });
    renderWithProviders(<ForgotPasswordForm />);

    await submit(user);

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/reset-password"),
    );
    const [, init] = requestsTo(fetchMock, "POST /password/forgot")[0];
    expect(JSON.parse(init!.body as string)).toEqual({
      email: "ana@example.com",
    });
    expect(
      screen.getByRole("button", { name: "Enviar código" }),
    ).toBeDisabled();
  });

  it("does not reveal that an e-mail has no account", async () => {
    const user = userEvent.setup();
    mockApi({
      "POST /password/forgot": {
        status: 404,
        body: { name: "ResourceNotFound", message: "Resource not found." },
      },
    });
    renderWithProviders(<ForgotPasswordForm />);

    await submit(user);

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/reset-password"),
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows a message when the server cannot be reached", async () => {
    const user = userEvent.setup();
    mockFetchNetworkFailure();
    renderWithProviders(<ForgotPasswordForm />);

    await submit(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível conectar",
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
