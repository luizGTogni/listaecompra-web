import { render, screen } from "@testing-library/react";
import { Header } from "@/layouts/header";

describe("Header", () => {
  it("links the logo to the home page", () => {
    render(<Header />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Lista e Compra" }),
    ).toHaveAttribute("href", "/");
  });
});
