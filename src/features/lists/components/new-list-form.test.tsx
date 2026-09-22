import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { resetAuthStore, signInAs } from "@/test/auth";
import { mockApi, mockFetchNetworkFailure, requestsTo } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { shopperListsKey } from "../queries";
import { NewListForm } from "./new-list-form";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

const created = {
  status: 201,
  body: {
    shopperList: {
      id: "5d1f0a3e-9f4e-4b1c-8f3a-0d1a2b3c4d5e",
      userId: "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
      title: "Feira",
      description: "",
      closedAt: null,
      createdAt: "2026-09-20T12:00:00.000Z",
    },
  },
};

const submit = () => screen.getByRole("button", { name: "Criar lista" });

beforeEach(() => {
  resetAuthStore();
  signInAs("ana@example.com");
  replace.mockClear();
  vi.mocked(toast.success).mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("NewListForm", () => {
  it("requires a title and sends nothing without it", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({});
    renderWithProviders(<NewListForm />);

    await user.click(submit());

    expect(
      await screen.findByText("Dê um nome para a lista."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nome da lista")).toBeInvalid();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("creates the list, confirms with a toast and goes to the lists", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({ "POST /shoppers": created });
    const { queryClient } = renderWithProviders(<NewListForm />);
    queryClient.setQueryData(shopperListsKey, { shopperLists: [] });

    await user.type(screen.getByLabelText("Nome da lista"), "  Feira ");
    await user.type(screen.getByLabelText("Descrição (opcional)"), "Sábado");
    await user.click(submit());

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/lists"));
    const [, init] = requestsTo(fetchMock, "POST /shoppers")[0];
    expect(JSON.parse(init!.body as string)).toEqual({
      title: "Feira",
      description: "Sábado",
    });
    expect(init!.credentials).toBe("include");
    expect(toast.success).toHaveBeenCalledWith('Lista "Feira" criada.');
    // The cached lists are stale now, so the list screen fetches again.
    expect(queryClient.getQueryState(shopperListsKey)?.isInvalidated).toBe(
      true,
    );
  });

  it("sends an empty description when none is typed", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({ "POST /shoppers": created });
    renderWithProviders(<NewListForm />);

    await user.type(screen.getByLabelText("Nome da lista"), "Feira");
    await user.click(submit());

    await waitFor(() => expect(replace).toHaveBeenCalled());
    const [, init] = requestsTo(fetchMock, "POST /shoppers")[0];
    expect(JSON.parse(init!.body as string)).toEqual({
      title: "Feira",
      description: "",
    });
  });

  it("marks the title when the name is already taken", async () => {
    const user = userEvent.setup();
    mockApi({
      "POST /shoppers": {
        status: 409,
        body: { name: "ResourceAlreadyExists", message: "x" },
      },
    });
    renderWithProviders(<NewListForm />);

    await user.type(screen.getByLabelText("Nome da lista"), "Feira");
    await user.click(submit());

    expect(
      await screen.findByText("Você já tem uma lista com este nome."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nome da lista")).toBeInvalid();
    expect(screen.getByLabelText("Nome da lista")).toHaveFocus();
    expect(submit()).toBeEnabled();
    expect(replace).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("reports when the server cannot be reached", async () => {
    const user = userEvent.setup();
    mockFetchNetworkFailure();
    renderWithProviders(<NewListForm />);

    await user.type(screen.getByLabelText("Nome da lista"), "Feira");
    await user.click(submit());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Não foi possível conectar/,
    );
  });

  it("locks the button while creating, so a double tap creates one list", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal("fetch", fetchMock);
    renderWithProviders(<NewListForm />);

    await user.type(screen.getByLabelText("Nome da lista"), "Feira");
    await user.click(submit());

    const pending = await screen.findByRole("button", {
      name: "Criando lista...",
    });
    expect(pending).toBeDisabled();
    await user.click(pending);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("counts the description characters", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewListForm />);

    expect(screen.getByText("0/200")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Descrição (opcional)"), "abc");

    expect(screen.getByText("3/200")).toBeInTheDocument();
  });

  it("lets the user cancel back to the lists", () => {
    renderWithProviders(<NewListForm />);

    expect(screen.getByRole("link", { name: "Cancelar" })).toHaveAttribute(
      "href",
      "/lists",
    );
  });
});
