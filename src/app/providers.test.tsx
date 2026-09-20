import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { Providers } from "@/app/providers";
import { mockPrefersDark } from "@/test/match-media";
import { renderWithProviders } from "@/test/render";

function Greeting() {
  const { data } = useQuery({
    queryKey: ["greeting"],
    queryFn: async () => "hello",
  });

  return <p>{data ?? "loading"}</p>;
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <p>theme: {theme}</p>
      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={() => setTheme("dark")}>Dark</button>
      <button onClick={() => setTheme("system")}>System</button>
    </>
  );
}

beforeEach(() => {
  mockPrefersDark(false);
  localStorage.clear();
  document.documentElement.className = "";
});

describe("Providers", () => {
  it("renders its children", () => {
    render(
      <Providers>
        <p>child</p>
      </Providers>,
    );

    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("gives children access to TanStack Query", async () => {
    render(
      <Providers>
        <Greeting />
      </Providers>,
    );

    expect(screen.getByText("loading")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("hello")).toBeInTheDocument());
  });
});

describe("dark mode", () => {
  it("follows prefers-color-scheme by default", () => {
    mockPrefersDark(true);
    render(
      <Providers>
        <ThemeSwitcher />
      </Providers>,
    );

    expect(screen.getByText("theme: system")).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");
  });

  it("stays light when the system prefers light", () => {
    render(
      <Providers>
        <ThemeSwitcher />
      </Providers>,
    );

    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("lets the user override the system preference and remembers it", async () => {
    const user = userEvent.setup();
    mockPrefersDark(true);
    render(
      <Providers>
        <ThemeSwitcher />
      </Providers>,
    );

    await user.click(screen.getByRole("button", { name: "Light" }));

    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("light");

    await user.click(screen.getByRole("button", { name: "Dark" }));

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});

describe("renderWithProviders", () => {
  it("supports components that use queries", async () => {
    renderWithProviders(<Greeting />);

    expect(await screen.findByText("hello")).toBeInTheDocument();
  });
});
