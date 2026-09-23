import { render, screen, within } from "@testing-library/react";
import { BottomNav } from "./bottom-nav";
import { DesktopNav } from "./desktop-nav";
import { NewListButton } from "./new-list-button";

const { navigation } = vi.hoisted(() => ({ navigation: { pathname: "/" } }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

beforeEach(() => {
  navigation.pathname = "/";
});

describe.each([
  ["BottomNav", BottomNav],
  ["DesktopNav", DesktopNav],
])("%s", (_name, Nav) => {
  it("links to every section", () => {
    render(<Nav />);
    const nav = screen.getByRole("navigation", { name: "Principal" });

    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Início",
      "Histórico",
      "Lista",
      "Convites",
      "Perfil",
    ]);
    expect(within(nav).getByRole("link", { name: "Lista" })).toHaveAttribute(
      "href",
      "/lists",
    );
    expect(within(nav).getByRole("link", { name: "Perfil" })).toHaveAttribute(
      "href",
      "/profile",
    );
  });

  it("marks only the current page", () => {
    navigation.pathname = "/lists/new";
    render(<Nav />);

    const current = screen.getAllByRole("link", { current: "page" });
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("Lista");
  });

  it("marks Início on the home page", () => {
    render(<Nav />);

    expect(screen.getByRole("link", { current: "page" })).toHaveTextContent(
      "Início",
    );
  });
});

describe("NewListButton", () => {
  it("links to the new list screen with an accessible name", () => {
    navigation.pathname = "/lists";
    render(<NewListButton />);

    expect(screen.getByRole("link", { name: "Nova lista" })).toHaveAttribute(
      "href",
      "/lists/new",
    );
  });

  it.each([
    "/",
    "/lists/new",
    "/lists/abc-123",
    "/history/",
    "/invites",
    "/profile",
  ])("is hidden on %s", (pathname) => {
    navigation.pathname = pathname;
    render(<NewListButton />);

    expect(screen.queryByRole("link", { name: "Nova lista" })).toBeNull();
  });

  it.each(["/lists", "/history"])("shows on %s", (pathname) => {
    navigation.pathname = pathname;
    render(<NewListButton />);

    expect(
      screen.getByRole("link", { name: "Nova lista" }),
    ).toBeInTheDocument();
  });
});
