import { render, screen } from "@testing-library/react";
import { Header } from "@/layouts/header";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/",
}));

describe("Header", () => {
  it("links the logo to the home page", () => {
    render(<Header />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lista&Compra" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("has the section links and a way to sign out", () => {
    render(<Header />);

    expect(screen.getByRole("link", { name: "Lista" })).toHaveAttribute(
      "href",
      "/lists",
    );
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
  });
});
