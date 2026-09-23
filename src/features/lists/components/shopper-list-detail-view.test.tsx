import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { listDetailReply, meReply, mockApi, requestsTo } from "@/test/fetch";
import { makeItem, makeList } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { ShopperListDetailView } from "./shopper-list-detail-view";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

// The user id meReply uses, so makeList()'s default owner matches "me".
const ME = "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ShopperListDetailView", () => {
  it("shows the title, description and items", async () => {
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({
          id: "list-1",
          title: "Feira da semana",
          description: "Compras de sábado",
        }),
        [makeItem({ title: "Arroz", quantity: 2 })],
      ),
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);

    expect(
      screen.getByRole("status", { name: "Carregando lista" }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Feira da semana" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Compras de sábado")).toBeInTheDocument();
    expect(screen.getByText("Arroz")).toBeInTheDocument();
  });

  it("shows the owner's actions, but not the guest flag", async () => {
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", userId: ME }),
      ),
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);

    expect(
      await screen.findByRole("button", { name: "Concluir lista" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Excluir lista" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Convidado")).toBeNull();
  });

  it("flags a guest and hides the owner's actions", async () => {
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", userId: "someone-else" }),
      ),
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);

    expect(await screen.findByText("Convidado")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Concluir lista" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Excluir lista" })).toBeNull();
  });

  it("shows a closed list read-only, with no add-item form", async () => {
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({
          id: "list-1",
          userId: ME,
          closedAt: "2026-09-10T12:00:00.000Z",
        }),
        [makeItem({ title: "Arroz" })],
      ),
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);

    expect(await screen.findByText("Concluída")).toBeInTheDocument();
    expect(
      screen.getByText(/reabra para adicionar ou alterar itens/),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Nome do item")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Diminuir quantidade" }),
    ).toBeDisabled();
  });

  it("lists unpurchased items before purchased ones", async () => {
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", userId: ME }),
        [
          makeItem({ title: "Comprado", purchasedAt: "2026-09-20T12:00:00Z" }),
          makeItem({ title: "Pendente" }),
        ],
      ),
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);

    const items = await screen.findAllByRole("listitem");
    expect(within(items[0]).getByText("Pendente")).toBeInTheDocument();
    expect(within(items[1]).getByText("Comprado")).toBeInTheDocument();
  });

  it("shows an empty state with no items", async () => {
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", userId: ME }),
      ),
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);

    expect(await screen.findByText("Ainda não há itens.")).toBeInTheDocument();
  });

  it("offers a retry when loading fails", async () => {
    const user = userEvent.setup();
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": [
        { status: 500, body: { name: "x", message: "x" } },
        listDetailReply(makeList({ id: "list-1", title: "Feira" })),
      ],
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar esta lista.",
    );

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(
      await screen.findByRole("heading", { name: "Feira" }),
    ).toBeInTheDocument();
  });

  it("adds an item through the form", async () => {
    const user = userEvent.setup();
    const created = makeItem({ title: "Leite", quantity: 3 });
    const fetchMock = mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": [
        listDetailReply(makeList({ id: "list-1", userId: ME })),
        listDetailReply(makeList({ id: "list-1", userId: ME }), [created]),
      ],
      "POST /shoppers/list-1/items/add": {
        status: 201,
        body: { shopperItem: created },
      },
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);
    await screen.findByText("Ainda não há itens.");

    await user.type(screen.getByLabelText("Nome do item"), "Leite");
    await user.clear(screen.getByLabelText("Quantidade"));
    await user.type(screen.getByLabelText("Quantidade"), "3");
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));

    const [, init] = requestsTo(
      fetchMock,
      "POST /shoppers/list-1/items/add",
    )[0];
    expect(JSON.parse(init!.body as string)).toEqual({
      title: "Leite",
      description: "",
      quantity: 3,
    });
    expect(await screen.findByText("Leite")).toBeInTheDocument();
    // Ready for the next item.
    await waitFor(() =>
      expect(screen.getByLabelText("Nome do item")).toHaveValue(""),
    );
  });

  it("toggles an item as purchased", async () => {
    const user = userEvent.setup();
    const item = makeItem({ id: "item-1", title: "Arroz" });
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": [
        listDetailReply(makeList({ id: "list-1", userId: ME }), [item]),
        listDetailReply(makeList({ id: "list-1", userId: ME }), [
          { ...item, purchasedAt: "2026-09-20T12:10:00.000Z" },
        ]),
      ],
      "PATCH /shoppers/list-1/items/item-1/purchase": {
        status: 200,
        body: {
          shopperItem: { ...item, purchasedAt: "2026-09-20T12:10:00.000Z" },
        },
      },
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);
    const checkbox = await screen.findByRole("checkbox", {
      name: "Marcar Arroz como comprado",
    });

    await user.click(checkbox);

    await waitFor(() =>
      expect(
        screen.getByRole("checkbox", {
          name: "Marcar Arroz como não comprado",
        }),
      ).toHaveAttribute("aria-checked", "true"),
    );
  });

  it("removes an item", async () => {
    const user = userEvent.setup();
    const item = makeItem({ id: "item-1", title: "Arroz" });
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": [
        listDetailReply(makeList({ id: "list-1", userId: ME }), [item]),
        listDetailReply(makeList({ id: "list-1", userId: ME }), []),
      ],
      "DELETE /shoppers/list-1/items/item-1/remove": { status: 204 },
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);
    await screen.findByText("Arroz");

    await user.click(screen.getByRole("button", { name: "Remover Arroz" }));

    await waitFor(() =>
      expect(screen.getByText("Ainda não há itens.")).toBeInTheDocument(),
    );
  });

  it("changes an item's quantity", async () => {
    const user = userEvent.setup();
    const item = makeItem({ id: "item-1", title: "Arroz", quantity: 2 });
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": [
        listDetailReply(makeList({ id: "list-1", userId: ME }), [item]),
        listDetailReply(makeList({ id: "list-1", userId: ME }), [
          { ...item, quantity: 3 },
        ]),
      ],
      "PATCH /shoppers/list-1/items/item-1/quantity": {
        status: 200,
        body: { shopperItem: { ...item, quantity: 3 } },
      },
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);
    await screen.findByText("Arroz");

    await user.click(
      screen.getByRole("button", { name: "Aumentar quantidade" }),
    );

    await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());
  });

  it("explains when the list is closed mid-action", async () => {
    const user = userEvent.setup();
    const item = makeItem({ id: "item-1", title: "Arroz" });
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", userId: ME }),
        [item],
      ),
      "PATCH /shoppers/list-1/items/item-1/purchase": {
        status: 409,
        body: { name: "ShopperListClosed", message: "x" },
      },
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);
    const checkbox = await screen.findByRole("checkbox", {
      name: "Marcar Arroz como comprado",
    });

    await user.click(checkbox);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Esta lista está fechada.",
    );
  });

  it("closes and reopens the list", async () => {
    const user = userEvent.setup();
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": [
        listDetailReply(makeList({ id: "list-1", userId: ME, closedAt: null })),
        listDetailReply(
          makeList({
            id: "list-1",
            userId: ME,
            closedAt: "2026-09-20T12:00:00.000Z",
          }),
        ),
      ],
      "PATCH /shoppers/list-1/close": {
        status: 200,
        body: {
          shopperList: makeList({
            id: "list-1",
            userId: ME,
            closedAt: "2026-09-20T12:00:00.000Z",
          }),
        },
      },
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);
    await screen.findByRole("button", { name: "Concluir lista" });

    await user.click(screen.getByRole("button", { name: "Concluir lista" }));

    expect(
      await screen.findByRole("button", { name: "Reabrir lista" }),
    ).toBeInTheDocument();
  });
});
