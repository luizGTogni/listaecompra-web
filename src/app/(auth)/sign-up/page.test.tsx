import { screen } from "@testing-library/react";
import SignUpPage from "@/app/(auth)/sign-up/page";
import { renderWithProviders } from "@/test/render";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

describe("SignUpPage", () => {
  it("renders the heading, the form and a link to sign in", () => {
    renderWithProviders(<SignUpPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Crie sua conta" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Criar conta" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
  });
});
