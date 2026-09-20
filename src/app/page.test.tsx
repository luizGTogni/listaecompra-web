import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home", () => {
  it("renders the app title", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Lista e Compra" }),
    ).toBeInTheDocument();
  });
});
