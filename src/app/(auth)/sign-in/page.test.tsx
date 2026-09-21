import { screen } from "@testing-library/react";
import SignInPage from "@/app/(auth)/sign-in/page";
import { resetAuthStore } from "@/test/auth";
import { renderWithProviders } from "@/test/render";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

beforeEach(resetAuthStore);

describe("SignInPage", () => {
  it("renders the heading, the form and a link to sign up", () => {
    renderWithProviders(<SignInPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Bem-vindo de volta" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/sign-up",
    );
  });
});
