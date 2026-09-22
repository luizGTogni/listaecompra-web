import { screen } from "@testing-library/react";
import { Header } from "@/layouts/header";
import { renderWithProviders } from "@/test/render";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/",
}));

describe("Header", () => {
  it("links the logo to the home page", () => {
    renderWithProviders(<Header />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lista&Compra" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("has the section links and a way to sign out", () => {
    renderWithProviders(<Header />);

    expect(screen.getByRole("link", { name: "Lista" })).toHaveAttribute(
      "href",
      "/lists",
    );
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
  });
});
