import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { listDetailReply, meReply, mockApi, requestsTo } from "@/test/fetch";
import { makeList, makeMember } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { MembersView } from "./members-view";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

// The user id meReply uses.
const ME = "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed";

beforeEach(() => {
  replace.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("MembersView, as the owner", () => {
  it("shows itself as the owner, the invite form, and each member", async () => {
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", title: "Feira", userId: ME }),
      ),
      "GET /shoppers/list-1/members": {
        status: 200,
        body: {
          shopperListMembers: [
            makeMember({ memberId: "guest-1" }),
            makeMember({ memberId: "guest-2", acceptedAt: null }),
          ],
        },
      },
    });
    renderWithProviders(<MembersView listId="list-1" />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Membros" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Feira")).toBeInTheDocument();
    expect(screen.getByLabelText("Convidar por usuário")).toBeInTheDocument();
    expect(screen.getByText("Dono da lista")).toBeInTheDocument();
    expect(screen.getByText("Usuário guest-1")).toBeInTheDocument();
    expect(screen.getByText("Usuário guest-2")).toBeInTheDocument();
    expect(screen.getByText("Convite pendente")).toBeInTheDocument();
  });

  it("invites someone by username, normalizing @ and case", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", userId: ME }),
      ),
      "GET /shoppers/list-1/members": [
        { status: 200, body: { shopperListMembers: [] } },
        {
          status: 200,
          body: {
            shopperListMembers: [
              makeMember({ memberId: "maria-id-1234", acceptedAt: null }),
            ],
          },
        },
      ],
      "POST /shoppers/list-1/members/invite": {
        status: 201,
        body: {
          shopperListMember: makeMember({
            memberId: "maria-id-1234",
            acceptedAt: null,
          }),
        },
      },
    });
    renderWithProviders(<MembersView listId="list-1" />);
    await screen.findByLabelText("Convidar por usuário");

    await user.type(screen.getByLabelText("Convidar por usuário"), " @Maria ");
    await user.click(screen.getByRole("button", { name: "Convidar" }));

    expect(await screen.findByText("Usuário maria-id")).toBeInTheDocument();
    const [, init] = requestsTo(
      fetchMock,
      "POST /shoppers/list-1/members/invite",
    )[0];
    expect(JSON.parse(init!.body as string)).toEqual({ username: "maria" });
    // Ready to invite the next person.
    await waitFor(() =>
      expect(screen.getByLabelText("Convidar por usuário")).toHaveValue(""),
    );
  });

  it("rejects an invalid username before sending anything", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", userId: ME }),
      ),
      "GET /shoppers/list-1/members": {
        status: 200,
        body: { shopperListMembers: [] },
      },
    });
    renderWithProviders(<MembersView listId="list-1" />);
    await screen.findByLabelText("Convidar por usuário");

    await user.type(screen.getByLabelText("Convidar por usuário"), "a b");
    await user.click(screen.getByRole("button", { name: "Convidar" }));

    expect(
      await screen.findByText("Use apenas letras, números e _."),
    ).toBeInTheDocument();
    expect(
      requestsTo(fetchMock, "POST /shoppers/list-1/members/invite"),
    ).toHaveLength(0);
  });

  it("explains when nobody has that username", async () => {
    const user = userEvent.setup();
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", userId: ME }),
      ),
      "GET /shoppers/list-1/members": {
        status: 200,
        body: { shopperListMembers: [] },
      },
      "POST /shoppers/list-1/members/invite": {
        status: 404,
        body: { name: "ResourceNotFound", message: "x" },
      },
    });
    renderWithProviders(<MembersView listId="list-1" />);
    await screen.findByLabelText("Convidar por usuário");

    await user.type(screen.getByLabelText("Convidar por usuário"), "ninguem");
    await user.click(screen.getByRole("button", { name: "Convidar" }));

    expect(
      await screen.findByText("Não encontramos ninguém com esse usuário."),
    ).toBeInTheDocument();
  });

  it("marks the field when the person was already invited", async () => {
    const user = userEvent.setup();
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", userId: ME }),
      ),
      "GET /shoppers/list-1/members": {
        status: 200,
        body: { shopperListMembers: [] },
      },
      "POST /shoppers/list-1/members/invite": {
        status: 409,
        body: { name: "ResourceAlreadyExists", message: "x" },
      },
    });
    renderWithProviders(<MembersView listId="list-1" />);
    await screen.findByLabelText("Convidar por usuário");

    await user.type(screen.getByLabelText("Convidar por usuário"), "maria");
    await user.click(screen.getByRole("button", { name: "Convidar" }));

    expect(
      await screen.findByText("Esta pessoa já foi convidada."),
    ).toBeInTheDocument();
  });

  it("removes a member", async () => {
    const user = userEvent.setup();
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", userId: ME }),
      ),
      "GET /shoppers/list-1/members": [
        {
          status: 200,
          body: { shopperListMembers: [makeMember({ memberId: "guest-1" })] },
        },
        { status: 200, body: { shopperListMembers: [] } },
      ],
      "DELETE /shoppers/list-1/members/guest-1/remove": { status: 204 },
    });
    renderWithProviders(<MembersView listId="list-1" />);
    await screen.findByText("Usuário guest-1");

    await user.click(
      screen.getByRole("button", { name: "Remover usuário guest-1" }),
    );

    await waitFor(() =>
      expect(screen.queryByText("Usuário guest-1")).not.toBeInTheDocument(),
    );
  });

  it("hides the invite form when the list is closed", async () => {
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({
          id: "list-1",
          userId: ME,
          closedAt: "2026-09-10T12:00:00.000Z",
        }),
      ),
      "GET /shoppers/list-1/members": {
        status: 200,
        body: { shopperListMembers: [] },
      },
    });
    renderWithProviders(<MembersView listId="list-1" />);

    expect(
      await screen.findByText("Reabra a lista para convidar mais gente."),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Convidar por usuário")).toBeNull();
  });
});

describe("MembersView, as a guest", () => {
  it("shows the owner and itself, with no invite form or remove buttons", async () => {
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({
          id: "list-1",
          userId: "owner-1",
          user: { name: "Maria Souza", username: "maria" },
        }),
      ),
      "GET /shoppers/list-1/members": {
        status: 200,
        body: { shopperListMembers: [makeMember({ memberId: ME })] },
      },
    });
    renderWithProviders(<MembersView listId="list-1" />);

    expect(await screen.findByText("Dono da lista")).toBeInTheDocument();
    expect(screen.getByText("Maria Souza (@maria)")).toBeInTheDocument();
    expect(screen.getAllByText("Você")).toHaveLength(1);
    expect(screen.queryByLabelText("Convidar por usuário")).toBeNull();
    expect(screen.queryByRole("button", { name: /Remover/ })).toBeNull();
  });

  it("lets a guest leave the list", async () => {
    const user = userEvent.setup();
    mockApi({
      "GET /users/me": meReply("2026-09-20T12:05:00.000Z"),
      "GET /shoppers/list-1": listDetailReply(
        makeList({ id: "list-1", userId: "owner-1" }),
      ),
      "GET /shoppers/list-1/members": {
        status: 200,
        body: { shopperListMembers: [makeMember({ memberId: ME })] },
      },
      [`DELETE /shoppers/list-1/members/${ME}/remove`]: { status: 204 },
    });
    renderWithProviders(<MembersView listId="list-1" />);
    await screen.findByText("Você");

    await user.click(screen.getByRole("button", { name: "Sair" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/lists"));
  });
});
