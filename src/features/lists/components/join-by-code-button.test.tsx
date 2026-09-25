import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { JoinByCodeButton } from "./join-by-code-button";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

afterEach(() => {
  push.mockClear();
  vi.unstubAllGlobals();
});

async function openAndType(code: string) {
  const user = userEvent.setup();
  renderWithProviders(<JoinByCodeButton />);
  await user.click(screen.getByRole("button", { name: "Entrar com código" }));
  await user.type(screen.getByLabelText("Código da lista"), code);
  await user.click(screen.getByRole("button", { name: "Entrar na lista" }));
}

describe("JoinByCodeButton", () => {
  it("joins with the typed code and opens the list", async () => {
    const fetchMock = mockApi({
      "POST /shoppers/members/enter": {
        status: 201,
        body: { shopperListMember: { shopperListId: "list-9" } },
      },
    });

    await openAndType("  abc-123 ");

    await waitFor(() => expect(push).toHaveBeenCalledWith("/lists/list-9"));
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init?.body as string)).toEqual({ shareCode: "abc-123" });
  });

  it("accepts a pasted share link", async () => {
    const fetchMock = mockApi({
      "POST /shoppers/members/enter": {
        status: 201,
        body: { shopperListMember: { shopperListId: "list-9" } },
      },
    });

    await openAndType("http://localhost:3001/join/abc-123");

    await waitFor(() => expect(push).toHaveBeenCalled());
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init?.body as string)).toEqual({ shareCode: "abc-123" });
  });

  it("explains an unknown code", async () => {
    mockApi({
      "POST /shoppers/members/enter": {
        status: 404,
        body: { name: "ResourceNotFound", message: "x" },
      },
    });

    await openAndType("nope");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Código inválido ou expirado",
    );
    expect(push).not.toHaveBeenCalled();
  });
});
