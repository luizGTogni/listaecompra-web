import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  listsReply,
  meReply,
  mockApi,
  mockFetchNetworkFailure,
} from "@/test/fetch";
import { makeList, makeLists } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { ListsView } from "./lists-view";

const reply = listsReply;

const search = () => screen.getByRole("searchbox", { name: "Buscar listas" });

// The requests the screen made to GET /shoppers, as { page, query }.
function requested(fetchMock: ReturnType<typeof mockApi>) {
  return fetchMock.mock.calls
    .map(([url]) => new URL(url))
    .filter((url) => url.pathname.endsWith("/shoppers"))
    .map(({ searchParams }) => ({
      page: searchParams.get("page"),
      query: searchParams.get("query"),
    }));
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("ListsView", () => {
  it("shows a placeholder while loading, then the lists", async () => {
    mockApi({
      "GET /shoppers": reply([
        makeList({ id: "list-1", title: "Feira", description: "Sábado" }),
        makeList({ id: "list-2", title: "Mercado" }),
      ]),
    });
    renderWithProviders(<ListsView status="open" />);

    expect(
      screen.getByRole("status", { name: "Carregando listas" }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", { name: "Feira" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sábado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Feira/ })).toHaveAttribute(
      "href",
      "/lists/list-1",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("2 de 2 lista(s).")).toBeInTheDocument();
  });

  it("marks a finished list", async () => {
    mockApi({
      "GET /shoppers": reply([
        makeList({ title: "Antiga", closedAt: "2026-09-01T10:00:00.000Z" }),
        makeList({ title: "Atual" }),
      ]),
    });
    renderWithProviders(<ListsView status="open" />);

    const finished = await screen.findByRole("link", { name: /Antiga/ });
    expect(within(finished).getByText("Concluída")).toBeInTheDocument();
    expect(
      within(screen.getByRole("link", { name: /Atual/ })).queryByText(
        "Concluída",
      ),
    ).toBeNull();
  });

  it("flags the lists the user was invited to", async () => {
    // meReply's user owns lists made by makeList (same id); "someone-else"
    // is another owner, so that list is one the user is a guest of.
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers": reply([
        makeList({ title: "Minha lista" }),
        makeList({ title: "Da Maria", userId: "someone-else" }),
        makeList({
          title: "Da Maria antiga",
          userId: "someone-else",
          closedAt: "2026-09-01T10:00:00.000Z",
        }),
      ]),
    });
    renderWithProviders(<ListsView status="open" />);

    const guest = (
      await screen.findByRole("heading", { name: "Da Maria" })
    ).closest("a")!;
    expect(within(guest).getByText("Convidado")).toBeInTheDocument();
    expect(
      within(screen.getByRole("link", { name: /Minha lista/ })).queryByText(
        "Convidado",
      ),
    ).toBeNull();
    // A guest list can also be finished: both flags show.
    const both = screen.getByRole("link", { name: /Da Maria antiga/ });
    expect(within(both).getByText("Convidado")).toBeInTheDocument();
    expect(within(both).getByText("Concluída")).toBeInTheDocument();
  });

  it("does not flag anything before it knows who the user is", async () => {
    mockApi({
      "GET /users/me": { status: 500, body: { name: "x", message: "x" } },
      "GET /shoppers": reply([
        makeList({ title: "Da Maria", userId: "other" }),
      ]),
    });
    renderWithProviders(<ListsView status="open" />);

    const card = (
      await screen.findByRole("heading", { name: "Da Maria" })
    ).closest("a")!;

    expect(within(card).queryByText("Convidado")).toBeNull();
  });

  it("invites the user to create the first list", async () => {
    mockApi({ "GET /shoppers": reply([]) });
    renderWithProviders(<ListsView status="open" />);

    expect(
      await screen.findByText("Você ainda não tem listas"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Criar minha primeira lista" }),
    ).toHaveAttribute("href", "/lists/new");
    // Nothing to page through.
    expect(screen.queryByRole("navigation", { name: "Paginação" })).toBeNull();
  });

  it("offers a retry when loading fails", async () => {
    const user = userEvent.setup();
    mockFetchNetworkFailure();
    renderWithProviders(<ListsView status="open" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar suas listas.",
    );

    mockApi({ "GET /shoppers": reply([makeList({ title: "Feira" })]) });
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(
      await screen.findByRole("heading", { name: "Feira" }),
    ).toBeInTheDocument();
  });
});

describe("search", () => {
  it("waits for a pause in typing, then asks for the search on page 1", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const fetchMock = mockApi({
      "GET /shoppers": (url) =>
        reply(
          url.searchParams.get("query") === "feira"
            ? [makeList({ title: "Feira da semana" })]
            : [
                makeList({ title: "Mercado" }),
                makeList({ title: "Feira da semana" }),
              ],
        ),
    });
    renderWithProviders(<ListsView status="open" />);
    await screen.findByRole("heading", { name: "Mercado" });

    await user.type(search(), "feira");

    // One request for the whole word, not one per letter.
    await waitFor(() =>
      expect(requested(fetchMock)).toEqual([
        { page: "1", query: null },
        { page: "1", query: "feira" },
      ]),
    );
    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: "Mercado" })).toBeNull(),
    );
    expect(
      screen.getByRole("heading", { name: "Feira da semana" }),
    ).toBeInTheDocument();
  });

  it("ignores surrounding spaces", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const fetchMock = mockApi({ "GET /shoppers": reply([makeList()]) });
    renderWithProviders(<ListsView status="open" />);
    await screen.findAllByRole("listitem");

    await user.type(search(), "  feira  ");
    await act(() => vi.advanceTimersByTimeAsync(400));

    await waitFor(() =>
      expect(requested(fetchMock).at(-1)).toEqual({
        page: "1",
        query: "feira",
      }),
    );
  });

  it("explains when nothing matches, and goes back to all lists", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockApi({
      "GET /shoppers": (url) =>
        reply(
          url.searchParams.get("query") ? [] : [makeList({ title: "Feira" })],
        ),
    });
    renderWithProviders(<ListsView status="open" />);
    await screen.findByRole("heading", { name: "Feira" });

    await user.type(search(), "xyz");

    expect(await screen.findByText(/Nenhuma lista com/)).toHaveTextContent(
      "Nenhuma lista com “xyz”.",
    );

    await user.click(
      screen.getByRole("button", { name: "Ver todas as listas" }),
    );

    expect(search()).toHaveValue("");
    expect(
      await screen.findByRole("heading", { name: "Feira" }),
    ).toBeInTheDocument();
  });

  it("clears with the X button inside the field", async () => {
    const user = userEvent.setup();
    mockApi({ "GET /shoppers": reply([makeList()]) });
    renderWithProviders(<ListsView status="open" />);
    await screen.findAllByRole("listitem");
    expect(screen.queryByRole("button", { name: "Limpar busca" })).toBeNull();

    await user.type(search(), "abc");
    await user.click(screen.getByRole("button", { name: "Limpar busca" }));

    expect(search()).toHaveValue("");
  });
});

describe("pagination", () => {
  // 11 lists over 2 pages of up to 10.
  const pages = (url: URL) =>
    url.searchParams.get("page") === "2"
      ? reply([makeList({ title: "Da página dois" })], { page: 2, total: 11 })
      : reply(makeLists(10), { page: 1, total: 11 });

  it("has no pager when everything fits on one page", async () => {
    mockApi({ "GET /shoppers": reply(makeLists(3)) });
    renderWithProviders(<ListsView status="open" />);

    await screen.findAllByRole("listitem");

    expect(screen.queryByRole("navigation", { name: "Paginação" })).toBeNull();
  });

  it("goes to the next page and back", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({ "GET /shoppers": pages });
    renderWithProviders(<ListsView status="open" />);
    await screen.findAllByRole("listitem");

    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Próxima" }));

    expect(
      await screen.findByRole("heading", { name: "Da página dois" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
    // The last page.
    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();
    expect(requested(fetchMock).at(-1)).toEqual({ page: "2", query: null });
    expect(window.scrollTo).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Anterior" }));

    await waitFor(() =>
      expect(screen.getByText("Página 1 de 2")).toBeInTheDocument(),
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(10);
  });

  it("scrolls to the top when the page changes", async () => {
    const user = userEvent.setup();
    const scrollTo = vi.spyOn(window, "scrollTo");
    mockApi({ "GET /shoppers": pages });
    renderWithProviders(<ListsView status="open" />);
    await screen.findAllByRole("listitem");

    await user.click(screen.getByRole("button", { name: "Próxima" }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
    scrollTo.mockRestore();
  });

  it("goes back to page 1 when the search changes", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const fetchMock = mockApi({ "GET /shoppers": pages });
    renderWithProviders(<ListsView status="open" />);
    await screen.findAllByRole("listitem");
    await user.click(screen.getByRole("button", { name: "Próxima" }));
    await screen.findByText("Página 2 de 2");

    await user.type(search(), "a");

    await waitFor(() =>
      expect(requested(fetchMock).at(-1)).toEqual({ page: "1", query: "a" }),
    );
    await waitFor(() =>
      expect(screen.getByText("Página 1 de 2")).toBeInTheDocument(),
    );
  });

  it("handles a page emptied out from under the user", async () => {
    // e.g. the backend's count went stale, or a list was deleted concurrently.
    const user = userEvent.setup();
    mockApi({
      "GET /shoppers": (url) =>
        url.searchParams.get("page") === "2"
          ? reply([], { page: 2, total: 10 })
          : reply(makeLists(10), { page: 1, total: 20 }),
    });
    renderWithProviders(<ListsView status="open" />);
    await screen.findAllByRole("listitem");

    await user.click(screen.getByRole("button", { name: "Próxima" }));

    expect(
      await screen.findByText("Não há mais listas depois desta página."),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Voltar para a primeira página" }),
    );

    await waitFor(() =>
      expect(screen.getAllByRole("listitem")).toHaveLength(10),
    );
  });
});

describe("status", () => {
  it("asks the backend to filter by status", async () => {
    const fetchMock = mockApi({ "GET /shoppers": reply([makeList()]) });
    renderWithProviders(<ListsView status="closed" />);
    await screen.findAllByRole("listitem");

    const [url] = fetchMock.mock.calls[0];
    expect(new URL(url).searchParams.get("status")).toBe("closed");
  });

  it("does not repeat 'Concluída' on every card of the closed screen", async () => {
    mockApi({
      "GET /shoppers": reply([
        makeList({ title: "Feira", closedAt: "2026-09-01T10:00:00.000Z" }),
      ]),
    });
    renderWithProviders(<ListsView status="closed" />);

    const card = await screen.findByRole("link", { name: /Feira/ });

    expect(within(card).queryByText("Concluída")).toBeNull();
  });

  it("has its own empty state, with no 'create a list' call to action", async () => {
    mockApi({ "GET /shoppers": reply([]) });
    renderWithProviders(<ListsView status="closed" />);

    expect(
      await screen.findByText("Nenhuma lista concluída"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Criar minha primeira lista" }),
    ).toBeNull();
  });
});
