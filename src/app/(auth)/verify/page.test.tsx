import { screen, waitFor } from "@testing-library/react";
import VerifyPage from "@/app/(auth)/verify/page";
import { meReply, mockApi } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

beforeEach(() => {
  replace.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("VerifyPage", () => {
  it("shows the code form once the session is confirmed", async () => {
    mockApi({ "GET /users/me": meReply() });
    renderWithProviders(<VerifyPage />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Confirme seu e-mail",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Código de verificação")).toBeInTheDocument();
  });

  it("sends visitors without a session to sign in", async () => {
    mockApi({
      "GET /users/me": {
        status: 401,
        body: { name: "Unauthorized", message: "x" },
      },
    });
    renderWithProviders(<VerifyPage />);

    expect(screen.queryByLabelText("Código de verificação")).toBeNull();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/sign-in"));
  });
});
