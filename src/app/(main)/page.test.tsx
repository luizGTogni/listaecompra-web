import { render, screen } from "@testing-library/react";
import Home from "@/app/(main)/page";

describe("Home", () => {
  it("has its heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Início" }),
    ).toBeInTheDocument();
  });
});
