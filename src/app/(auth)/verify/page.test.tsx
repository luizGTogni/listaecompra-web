import { screen } from "@testing-library/react";
import VerifyPage from "@/app/(auth)/verify/page";
import { resetAuthStore, signInAs } from "@/test/auth";
import { renderWithProviders } from "@/test/render";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

beforeEach(() => {
  resetAuthStore();
  replace.mockClear();
});

describe("VerifyPage", () => {
  it("shows the code form to a signed-in user", () => {
    signInAs();
    renderWithProviders(<VerifyPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Confirme seu e-mail" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Código de verificação")).toBeInTheDocument();
  });

  it("sends visitors without a session to sign in", () => {
    renderWithProviders(<VerifyPage />);

    expect(screen.queryByLabelText("Código de verificação")).toBeNull();
    expect(replace).toHaveBeenCalledWith("/sign-in");
  });
});
