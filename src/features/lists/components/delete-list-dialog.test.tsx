import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockApi } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { DeleteListDialog } from "./delete-list-dialog";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

beforeEach(() => {
  replace.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("DeleteListDialog", () => {
  it("asks for confirmation before deleting anything", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({});
    renderWithProviders(<DeleteListDialog listId="list-1" listTitle="Feira" />);

    await user.click(screen.getByRole("button", { name: "Excluir lista" }));

    expect(
      screen.getByRole("heading", { name: "Excluir “Feira”?" }),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("closes without deleting on cancel", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({});
    renderWithProviders(<DeleteListDialog listId="list-1" listTitle="Feira" />);
    await user.click(screen.getByRole("button", { name: "Excluir lista" }));

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Excluir “Feira”?" }),
      ).not.toBeInTheDocument(),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("deletes the list and leaves for /lists", async () => {
    const user = userEvent.setup();
    mockApi({ "DELETE /shoppers/list-1": { status: 204 } });
    renderWithProviders(<DeleteListDialog listId="list-1" listTitle="Feira" />);
    await user.click(screen.getByRole("button", { name: "Excluir lista" }));

    await user.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/lists"));
  });

  it("keeps the dialog open and shows the error when deleting fails", async () => {
    const user = userEvent.setup();
    mockApi({
      "DELETE /shoppers/list-1": {
        status: 404,
        body: { name: "ResourceNotFound", message: "x" },
      },
    });
    renderWithProviders(<DeleteListDialog listId="list-1" listTitle="Feira" />);
    await user.click(screen.getByRole("button", { name: "Excluir lista" }));

    await user.click(screen.getByRole("button", { name: "Excluir" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível encontrar esta lista.",
    );
    expect(
      screen.getByRole("heading", { name: "Excluir “Feira”?" }),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
