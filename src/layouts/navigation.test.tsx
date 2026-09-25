import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  it("opens a chooser: an empty list and the AI preview", async () => {
    navigation.pathname = "/lists";
    render(<NewListButton />);

    await userEvent.click(screen.getByRole("button", { name: "Nova lista" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Como você quer começar?",
    });
    expect(
      within(dialog).getByRole("link", { name: /Lista vazia/ }),
    ).toHaveAttribute("href", "/lists/new");
    expect(
      within(dialog).getByRole("link", { name: /Criar com IA/ }),
    ).toHaveAttribute("href", "/lists/new/ai");
  });

  it("closes the chooser with the close button", async () => {
    navigation.pathname = "/lists";
    render(<NewListButton />);

    await userEvent.click(screen.getByRole("button", { name: "Nova lista" }));
    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));

    expect(screen.queryByRole("dialog")).toBeNull();
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

    expect(screen.queryByRole("button", { name: "Nova lista" })).toBeNull();
  });

  it.each(["/lists", "/history"])("shows on %s", (pathname) => {
    navigation.pathname = pathname;
    render(<NewListButton />);

    expect(
      screen.getByRole("button", { name: "Nova lista" }),
    ).toBeInTheDocument();
  });
});
