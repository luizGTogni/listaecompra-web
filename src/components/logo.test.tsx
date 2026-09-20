import { render, screen } from "@testing-library/react";
import { Logo, LogoMark } from "@/components/logo";

describe("Logo", () => {
  it("renders the wordmark as real text", () => {
    const { container } = render(<Logo />);

    expect(container).toHaveTextContent("Lista e Compra");
  });

  it("hides the decorative mark from assistive tech", () => {
    const { container } = render(<LogoMark />);

    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("accepts a custom size through className", () => {
    const { container } = render(<LogoMark className="size-12" />);

    expect(container.querySelector("svg")).toHaveClass("size-12");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
