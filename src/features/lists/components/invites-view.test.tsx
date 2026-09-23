import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/fetch";
import { makeInvite } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { InvitesView } from "./invites-view";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("InvitesView", () => {
  it("shows an empty state with no invites", async () => {
    mockApi({
      "GET /users/shoppers/invites": {
        status: 200,
        body: { shopperListMembers: [] },
      },
    });
    renderWithProviders(<InvitesView />);

    expect(
      await screen.findByText("Nenhum convite pendente."),
    ).toBeInTheDocument();
  });

  it("shows the list's title, who invited, and how long ago", async () => {
    mockApi({
      "GET /users/shoppers/invites": {
        status: 200,
        body: {
          shopperListMembers: [
            makeInvite(
              {
                shopperListId: "list-1",
                memberId: "me",
                invitedAt: new Date().toISOString(),
              },
              {
                title: "Churrasco de domingo",
                user: { name: "Maria Souza", username: "maria" },
              },
            ),
          ],
        },
      },
    });
    renderWithProviders(<InvitesView />);

    expect(await screen.findByText("Churrasco de domingo")).toBeInTheDocument();
    expect(
      screen.getByText(/Convite de Maria Souza \(@maria\) ·/),
    ).toBeInTheDocument();
    // Relative, with the exact date one hover away.
    expect(screen.getByText("hoje")).toHaveAttribute("title");
  });

  it("does not crash on an invite without list details (older backend)", async () => {
    mockApi({
      "GET /users/shoppers/invites": {
        status: 200,
        body: {
          shopperListMembers: [
            {
              memberId: "me",
              shopperListId: "list-1",
              acceptedAt: null,
              invitedAt: "2026-09-21T09:00:00.000Z",
            },
          ],
        },
      },
    });
    renderWithProviders(<InvitesView />);

    expect(
      await screen.findByText("Convite para uma lista"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aceitar" })).toBeInTheDocument();
  });

  it("accepts an invite", async () => {
    const user = userEvent.setup();
    mockApi({
      "GET /users/shoppers/invites": [
        {
          status: 200,
          body: {
            shopperListMembers: [
              makeInvite({ shopperListId: "list-1", memberId: "me" }),
            ],
          },
        },
        { status: 200, body: { shopperListMembers: [] } },
      ],
      "PATCH /shoppers/list-1/members/me/accept": {
        status: 200,
        body: {
          shopperListMember: makeInvite({
            shopperListId: "list-1",
            memberId: "me",
            acceptedAt: "2026-09-20T12:00:00.000Z",
          }),
        },
      },
    });
    renderWithProviders(<InvitesView />);
    await screen.findByRole("button", { name: "Aceitar" });

    await user.click(screen.getByRole("button", { name: "Aceitar" }));

    await waitFor(() =>
      expect(screen.getByText("Nenhum convite pendente.")).toBeInTheDocument(),
    );
  });

  it("declines an invite", async () => {
    const user = userEvent.setup();
    mockApi({
      "GET /users/shoppers/invites": [
        {
          status: 200,
          body: {
            shopperListMembers: [
              makeInvite({ shopperListId: "list-1", memberId: "me" }),
            ],
          },
        },
        { status: 200, body: { shopperListMembers: [] } },
      ],
      "DELETE /shoppers/list-1/members/me/decline": { status: 204 },
    });
    renderWithProviders(<InvitesView />);
    await screen.findByRole("button", { name: "Recusar" });

    await user.click(screen.getByRole("button", { name: "Recusar" }));

    await waitFor(() =>
      expect(screen.getByText("Nenhum convite pendente.")).toBeInTheDocument(),
    );
  });

  it("shows an error when accepting fails", async () => {
    const user = userEvent.setup();
    mockApi({
      "GET /users/shoppers/invites": {
        status: 200,
        body: {
          shopperListMembers: [
            makeInvite({ shopperListId: "list-1", memberId: "me" }),
          ],
        },
      },
      "PATCH /shoppers/list-1/members/me/accept": {
        status: 404,
        body: { name: "ResourceNotFound", message: "x" },
      },
    });
    renderWithProviders(<InvitesView />);
    await screen.findByRole("button", { name: "Aceitar" });

    await user.click(screen.getByRole("button", { name: "Aceitar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Este convite não existe mais.",
    );
  });

  it("offers a retry when loading fails", async () => {
    const user = userEvent.setup();
    mockApi({
      "GET /users/shoppers/invites": [
        { status: 500, body: { name: "x", message: "x" } },
        { status: 200, body: { shopperListMembers: [] } },
      ],
    });
    renderWithProviders(<InvitesView />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível carregar seus convites.",
    );

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(
      await screen.findByText("Nenhum convite pendente."),
    ).toBeInTheDocument();
  });
});
