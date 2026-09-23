import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { meReply, mockApi } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";
import { MyUsername } from "./my-username";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("MyUsername", () => {
  it("renders nothing until the user loads", () => {
    mockApi({ "GET /users/me": meReply("2026-09-20T12:05:00.000Z") });
    const { container } = renderWithProviders(<MyUsername />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the name and username, and copies the username", async () => {
    const user = userEvent.setup();
    mockApi({ "GET /users/me": meReply("2026-09-20T12:05:00.000Z") });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    renderWithProviders(<MyUsername />);
    expect(await screen.findByText("Ana Souza")).toBeInTheDocument();
    expect(screen.getByText("@ana_souza")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Copiar usuário" }));

    expect(writeText).toHaveBeenCalledWith("ana_souza");
  });
});
