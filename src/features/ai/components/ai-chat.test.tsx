import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi, requestsTo } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { AiChat } from "./ai-chat";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const PROPOSAL = {
  title: "Bolo de cenoura",
  addItems: [
    { title: "Cenoura", quantity: 3 },
    { title: "Ovos", quantity: 4 },
  ],
  removeItems: [{ id: "old-1", title: "Pão" }],
};

function setup(shopperListId?: string) {
  renderWithProviders(
    <AiChat
      shopperListId={shopperListId}
      greeting="Oi! O que você quer comprar?"
      placeholder="Descreva"
      suggestions={["Bolo de cenoura"]}
    />,
  );
}

beforeEach(() => push.mockClear());
afterEach(() => vi.unstubAllGlobals());

async function ask(text: string) {
  await userEvent.type(screen.getByLabelText("Mensagem para a IA"), text);
  await userEvent.keyboard("{Enter}");
}

describe("AiChat", () => {
  it("greets, offers suggestions and starts with sending disabled", () => {
    setup();

    expect(screen.getByText("Oi! O que você quer comprar?")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Bolo de cenoura" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled();
  });

  it("sends the conversation without the greeting and shows the proposal", async () => {
    const fetchMock = mockApi({
      "POST /ai/chat": {
        status: 200,
        body: { reply: "Pensei nestes itens:", proposal: PROPOSAL },
      },
    });
    setup("list-1");

    await ask("quero um bolo");

    expect(await screen.findByText("Pensei nestes itens:")).toBeVisible();
    const [, init] = requestsTo(fetchMock, "POST /ai/chat")[0];
    expect(JSON.parse(init?.body as string)).toEqual({
      shopperListId: "list-1",
      messages: [{ role: "user", content: "quero um bolo" }],
    });
    expect(screen.getByText("Cenoura")).toBeVisible();
    expect(screen.getByText("×4")).toBeVisible();
    expect(screen.getByText("Pão")).toBeVisible();
    // Nothing is applied until the person confirms.
    expect(requestsTo(fetchMock, "POST /ai/apply")).toHaveLength(0);
  });

  it("applies the proposal to an existing list only when confirmed", async () => {
    const fetchMock = mockApi({
      "POST /ai/chat": {
        status: 200,
        body: { reply: "ok", proposal: PROPOSAL },
      },
      "POST /ai/apply": {
        status: 200,
        body: { shopperListId: "list-1", added: 2, removed: 1 },
      },
    });
    setup("list-1");
    await ask("bolo");

    await userEvent.click(
      await screen.findByRole("button", { name: "Aplicar" }),
    );

    expect(await screen.findByText("Aplicado à lista")).toBeVisible();
    const [, init] = requestsTo(fetchMock, "POST /ai/apply")[0];
    expect(JSON.parse(init?.body as string)).toMatchObject({
      shopperListId: "list-1",
      title: "Bolo de cenoura",
      addItems: PROPOSAL.addItems,
      removeItemIds: ["old-1"],
    });
    expect(push).not.toHaveBeenCalled();
  });

  it("creates a list and opens it when there is no list yet", async () => {
    mockApi({
      "POST /ai/chat": {
        status: 200,
        body: { reply: "ok", proposal: { ...PROPOSAL, removeItems: [] } },
      },
      "POST /ai/apply": {
        status: 200,
        body: { shopperListId: "new-id", added: 2, removed: 0 },
      },
    });
    setup();
    await ask("bolo");

    await userEvent.click(
      await screen.findByRole("button", { name: "Criar lista" }),
    );

    await waitFor(() => expect(push).toHaveBeenCalledWith("/lists/new-id"));
  });

  it("discards a proposal without calling the backend", async () => {
    const fetchMock = mockApi({
      "POST /ai/chat": {
        status: 200,
        body: { reply: "ok", proposal: PROPOSAL },
      },
    });
    setup("list-1");
    await ask("bolo");

    await userEvent.click(
      await screen.findByRole("button", { name: "Descartar" }),
    );

    expect(screen.getByText("Descartado")).toBeVisible();
    expect(requestsTo(fetchMock, "POST /ai/apply")).toHaveLength(0);
  });

  it("shows a reply with no changes as plain text", async () => {
    mockApi({
      "POST /ai/chat": {
        status: 200,
        body: { reply: "Claro, me conte mais.", proposal: null },
      },
    });
    setup();
    await ask("oi");

    expect(await screen.findByText("Claro, me conte mais.")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Criar lista" })).toBeNull();
  });

  it("explains when the AI is unavailable and lets the person try again", async () => {
    mockApi({
      "POST /ai/chat": {
        status: 503,
        body: { name: "AiUnavailable", message: "x" },
      },
    });
    setup();
    await ask("bolo");

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText(/indisponível/)).toBeVisible();
    expect(screen.getByLabelText("Mensagem para a IA")).toBeEnabled();
  });
});
