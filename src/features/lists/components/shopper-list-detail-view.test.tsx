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

  it("shows who marked an item as purchased", async () => {
    const at = "2026-09-20T12:00:00Z";
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", userId: ME }),
        [
          makeItem({
            title: "Leite",
            purchasedAt: at,
            purchasedById: "other-id",
            purchasedBy: { name: "Maria Silva", username: "maria" },
          }),
          makeItem({
            title: "Pão",
            purchasedAt: at,
            purchasedById: ME,
            purchasedBy: { name: "Eu Mesmo", username: "eu" },
          }),
          makeItem({ title: "Ovos", purchasedAt: at }),
          makeItem({ title: "Café" }),
        ],
      ),
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);

    expect(await screen.findByText("Comprado por Maria Silva")).toBeVisible();
    expect(screen.getByText("Comprado por você")).toBeVisible();
    expect(screen.getAllByText(/Comprado por/)).toHaveLength(2);
  });

  it("opens the AI chat from the floating button on an open list", async () => {
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", userId: ME }),
      ),
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);

    await userEvent.click(
      await screen.findByRole("button", { name: /Sugerir itens com IA/ }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Ajuda da IA" });
    expect(within(dialog).getByLabelText("Mensagem para a IA")).toBeVisible();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Fechar" }),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("hides the AI helper on a closed list", async () => {
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({
          id: "list-1",
          userId: ME,
          closedAt: "2026-09-20T12:00:00Z",
        }),
      ),
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);

    await screen.findByText(/Esta lista está concluída/);
    expect(screen.queryByRole("button", { name: /IA/ })).toBeNull();
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
      unit: "UNIT",
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
    await openOptions(user);

    await user.click(screen.getByRole("menuitem", { name: "Concluir lista" }));

    await openOptions(user);
    expect(
      await screen.findByRole("menuitem", { name: "Reabrir lista" }),
    ).toBeInTheDocument();
  });

  it("opens the members in a sheet, without leaving the list", async () => {
    const user = userEvent.setup();
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", userId: ME, title: "Feira" }),
      ),
      "GET /shoppers/list-1/members": {
        status: 200,
        body: { shopperListMembers: [] },
      },
    });
    renderWithProviders(<ShopperListDetailView listId="list-1" />);
    await openOptions(user);

    await user.click(screen.getByRole("menuitem", { name: "Membros" }));

    const dialog = await screen.findByRole("dialog", { name: "Membros" });
    expect(await within(dialog).findByText("Dono da lista")).toBeVisible();
    expect(
      within(dialog).getByText("Ninguém foi convidado ainda."),
    ).toBeVisible();
  });

  describe("quantities and units", () => {
    const list = () => makeList({ id: "list-1", userId: ME });

    function setup(items: unknown[]) {
      return mockApi({
        "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
        "GET /shoppers/list-1": listDetailReply(list(), items),
      });
    }

    async function addItem(quantity: string, unit: string) {
      const user = userEvent.setup();
      await screen.findByText("Ainda não há itens.");
      await user.type(screen.getByLabelText("Nome do item"), "Arroz");
      await user.clear(screen.getByLabelText("Quantidade"));
      await user.type(screen.getByLabelText("Quantidade"), quantity);
      await user.selectOptions(screen.getByLabelText("Unidade"), unit);
      await user.click(screen.getByRole("button", { name: "Adicionar item" }));
    }

    it("sends a decimal typed with a comma as a number", async () => {
      const fetchMock = mockApi({
        "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
        "GET /shoppers/list-1": listDetailReply(list()),
        "POST /shoppers/list-1/items/add": {
          status: 201,
          body: { shopperItem: makeItem({ quantity: 1.5, unit: "KG" }) },
        },
      });
      renderWithProviders(<ShopperListDetailView listId="list-1" />);

      await addItem("1,5", "KG");

      await waitFor(() =>
        expect(
          requestsTo(fetchMock, "POST /shoppers/list-1/items/add"),
        ).toHaveLength(1),
      );
      const [, init] = requestsTo(
        fetchMock,
        "POST /shoppers/list-1/items/add",
      )[0];
      expect(JSON.parse(init!.body as string)).toMatchObject({
        quantity: 1.5,
        unit: "KG",
      });
    });

    it("refuses a fraction in a unit that takes only whole numbers", async () => {
      const fetchMock = setup([]);
      renderWithProviders(<ShopperListDetailView listId="list-1" />);

      await addItem("1,5", "BOTTLE");

      expect(await screen.findByText("Use um número inteiro.")).toBeVisible();
      expect(
        requestsTo(fetchMock, "POST /shoppers/list-1/items/add"),
      ).toHaveLength(0);
    });

    it("refuses more than the unit's maximum (100 bottles)", async () => {
      const fetchMock = setup([]);
      renderWithProviders(<ShopperListDetailView listId="list-1" />);

      await addItem("100", "BOTTLE");

      expect(
        await screen.findByText("A quantidade máxima é 99 garrafas."),
      ).toBeVisible();
      expect(
        requestsTo(fetchMock, "POST /shoppers/list-1/items/add"),
      ).toHaveLength(0);
    });

    it("refuses more than 3 decimal places", async () => {
      setup([]);
      renderWithProviders(<ShopperListDetailView listId="list-1" />);

      await addItem("1,2345", "KG");

      expect(
        await screen.findByText("Use no máximo 3 casas decimais."),
      ).toBeVisible();
    });

    it("shows the unit next to the quantity", async () => {
      setup([
        makeItem({ title: "Carne", quantity: 1.5, unit: "KG" }),
        makeItem({ title: "Refri", quantity: 2, unit: "L" }),
        makeItem({ title: "Cerveja", quantity: 24, unit: "CAN" }),
      ]);
      renderWithProviders(<ShopperListDetailView listId="list-1" />);

      expect(await screen.findByText("1,5 kg")).toBeVisible();
      expect(screen.getByText("2 L")).toBeVisible();
      expect(screen.getByText("24 latas")).toBeVisible();
    });

    it("reads an item without a unit as plain units", async () => {
      const legacy = makeItem({ title: "Arroz", quantity: 2 });
      delete legacy.unit;
      setup([legacy]);
      renderWithProviders(<ShopperListDetailView listId="list-1" />);

      await screen.findByText("Arroz");

      expect(screen.getByText("2")).toBeVisible();
      await userEvent.click(
        screen.getByRole("button", { name: "Editar Arroz" }),
      );
      expect(
        within(screen.getByRole("dialog")).getByLabelText("Unidade"),
      ).toHaveValue("UNIT");
    });

    it("steps decimals by half a kilo and never reaches zero", async () => {
      const user = userEvent.setup();
      const fetchMock = mockApi({
        "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
        "GET /shoppers/list-1": listDetailReply(list(), [
          makeItem({ id: "item-1", title: "Carne", quantity: 0.5, unit: "KG" }),
        ]),
        "PATCH /shoppers/list-1/items/item-1/quantity": {
          status: 200,
          body: { shopperItem: makeItem({ quantity: 1, unit: "KG" }) },
        },
      });
      renderWithProviders(<ShopperListDetailView listId="list-1" />);
      await screen.findByText("Carne");

      // 0.5 - 0.5 would be 0, which deletes the item on the backend.
      expect(
        screen.getByRole("button", { name: "Diminuir quantidade" }),
      ).toBeDisabled();

      await user.click(
        screen.getByRole("button", { name: "Aumentar quantidade" }),
      );

      const [, init] = requestsTo(
        fetchMock,
        "PATCH /shoppers/list-1/items/item-1/quantity",
      )[0];
      expect(JSON.parse(init!.body as string)).toEqual({ quantity: 1 });
    });

    it("edits the exact quantity and the unit", async () => {
      const user = userEvent.setup();
      const fetchMock = mockApi({
        "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
        "GET /shoppers/list-1": listDetailReply(list(), [
          makeItem({ id: "item-1", title: "Suco", quantity: 1.5, unit: "L" }),
        ]),
        "PATCH /shoppers/list-1/items/item-1/quantity": {
          status: 200,
          body: { shopperItem: makeItem({ quantity: 2, unit: "BOTTLE" }) },
        },
      });
      renderWithProviders(<ShopperListDetailView listId="list-1" />);
      await screen.findByText("Suco");

      await user.click(screen.getByRole("button", { name: "Editar Suco" }));
      const dialog = within(screen.getByRole("dialog"));
      await user.selectOptions(dialog.getByLabelText("Unidade"), "BOTTLE");
      await user.clear(dialog.getByLabelText("Quantidade"));
      await user.type(dialog.getByLabelText("Quantidade"), "2");
      await user.click(dialog.getByRole("button", { name: "Salvar" }));

      const [, init] = requestsTo(
        fetchMock,
        "PATCH /shoppers/list-1/items/item-1/quantity",
      )[0];
      expect(JSON.parse(init!.body as string)).toEqual({
        quantity: 2,
        unit: "BOTTLE",
      });
    });

    it("starts the edit from the current value and refuses an invalid one", async () => {
      const user = userEvent.setup();
      const fetchMock = setup([
        makeItem({ id: "item-1", title: "Carne", quantity: 1.5, unit: "KG" }),
      ]);
      renderWithProviders(<ShopperListDetailView listId="list-1" />);
      await screen.findByText("Carne");

      await user.click(screen.getByRole("button", { name: "Editar Carne" }));
      const dialog = within(screen.getByRole("dialog"));
      expect(dialog.getByLabelText("Quantidade")).toHaveValue("1,5");

      await user.clear(dialog.getByLabelText("Quantidade"));
      await user.type(dialog.getByLabelText("Quantidade"), "101");
      await user.click(dialog.getByRole("button", { name: "Salvar" }));

      expect(
        await screen.findByText("A quantidade máxima é 100 kg."),
      ).toBeVisible();
      expect(
        requestsTo(fetchMock, "PATCH /shoppers/list-1/items/item-1/quantity"),
      ).toHaveLength(0);
    });
  });
});
