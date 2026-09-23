import { screen, within } from "@testing-library/react";
import { listsReply, meReply, mockApi } from "@/test/fetch";
import { makeInvite, makeList, makeLists } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { HomeView } from "./home-view";

afterEach(() => {
  vi.unstubAllGlobals();
});

const verified = meReply("2026-09-20T12:05:00.000Z");
const noInvites = { status: 200, body: { shopperListMembers: [] } };

describe("HomeView", () => {
  it("greets the user by first name and links to a new list", async () => {
    mockApi({
      "GET /users/me": verified,
      "GET /shoppers": listsReply([makeList({ title: "Feira" })]),
      "GET /users/shoppers/invites": noInvites,
    });
    renderWithProviders(<HomeView />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Olá, Ana" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nova lista" })).toHaveAttribute(
      "href",
      "/lists/new",
    );
  });

  it("shows only the 3 most recent open lists, with a link to all of them", async () => {
    mockApi({
      "GET /users/me": verified,
      "GET /shoppers": (url) => {
        expect(url.searchParams.get("status")).toBe("open");
        return listsReply(makeLists(5));
      },
      "GET /users/shoppers/invites": noInvites,
    });
    renderWithProviders(<HomeView />);

    expect(await screen.findAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Ver todas" })).toHaveAttribute(
      "href",
      "/lists",
    );
  });

  it("flags a list the user was invited to", async () => {
    mockApi({
      "GET /users/me": verified,
      "GET /shoppers": listsReply([
        makeList({ title: "Da Maria", userId: "someone-else" }),
      ]),
      "GET /users/shoppers/invites": noInvites,
    });
    renderWithProviders(<HomeView />);

    const card = (
      await screen.findByRole("heading", { name: "Da Maria" })
    ).closest("li")!;
    expect(within(card).getByText("Convidado")).toBeInTheDocument();
  });

  it("warns about pending invites, in the singular and the plural", async () => {
    const fetchReplies = { invites: [makeInvite()] };
    mockApi({
      "GET /users/me": verified,
      "GET /shoppers": listsReply([]),
      "GET /users/shoppers/invites": () => ({
        status: 200,
        body: { shopperListMembers: fetchReplies.invites },
      }),
    });
    const { unmount } = renderWithProviders(<HomeView />);
    expect(
      await screen.findByRole("link", { name: /1 convite pendente/ }),
    ).toHaveAttribute("href", "/invites");
    unmount();

    fetchReplies.invites = [makeInvite(), makeInvite()];
    renderWithProviders(<HomeView />);
    expect(
      await screen.findByRole("link", { name: /2 convites pendentes/ }),
    ).toBeInTheDocument();
  });

  it("shows no banner without invites", async () => {
    mockApi({
      "GET /users/me": verified,
      "GET /shoppers": listsReply([makeList()]),
      "GET /users/shoppers/invites": noInvites,
    });
    renderWithProviders(<HomeView />);

    await screen.findAllByRole("listitem");
    expect(screen.queryByText(/convite/)).toBeNull();
  });

  it("invites the user to create a first list when there are none", async () => {
    mockApi({
      "GET /users/me": verified,
      "GET /shoppers": listsReply([]),
      "GET /users/shoppers/invites": noInvites,
    });
    renderWithProviders(<HomeView />);

    expect(
      await screen.findByText("Você não tem listas em andamento"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Criar minha primeira lista" }),
    ).toHaveAttribute("href", "/lists/new");
    expect(screen.queryByRole("link", { name: "Ver todas" })).toBeNull();
  });

  it("offers a retry when the lists fail to load", async () => {
    mockApi({
      "GET /users/me": verified,
      "GET /shoppers": { status: 500, body: { name: "x", message: "x" } },
      "GET /users/shoppers/invites": noInvites,
    });
    renderWithProviders(<HomeView />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar suas listas.",
    );
    expect(
      screen.getByRole("button", { name: "Tentar novamente" }),
    ).toBeInTheDocument();
  });
});
