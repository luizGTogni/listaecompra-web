import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { ShareListSheet } from "./share-list-sheet";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => {
  vi.unstubAllGlobals();
});

async function openSheet() {
  const user = userEvent.setup();
  renderWithProviders(
    <ShareListSheet listId="list-1" listTitle="Feira" shareCode="code-1" />,
  );
  await user.click(screen.getByRole("button", { name: "Compartilhar" }));
  return user;
}

describe("ShareListSheet", () => {
  it("shows the code and a QR code", async () => {
    await openSheet();

    expect(screen.getByTestId("share-code")).toHaveTextContent("code-1");
    expect(
      screen.getByTitle("QR code para entrar na lista Feira"),
    ).toBeInTheDocument();
  });

  it("asks before replacing the code, then resets it", async () => {
    const fetchMock = mockApi({
      "PATCH /shoppers/list-1/share-code/reset": {
        status: 200,
        body: { shopperList: {} },
      },
    });
    const user = await openSheet();

    await user.click(screen.getByRole("button", { name: "Gerar novo código" }));
    expect(fetchMock).not.toHaveBeenCalled();

    await user.click(
      screen.getAllByRole("button", { name: "Gerar novo código" }).at(-1)!,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });
});
