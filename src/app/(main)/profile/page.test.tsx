import { screen } from "@testing-library/react";
import ProfilePage from "@/app/(main)/profile/page";
import { meReply, mockApi } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ProfilePage", () => {
  it("has its heading and the sign out button", () => {
    mockApi({ "GET /users/me": meReply("2026-09-20T12:05:00.000Z") });
    renderWithProviders(<ProfilePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Perfil" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
  });

  it("shows the user's name and username, for others to invite them by", async () => {
    mockApi({ "GET /users/me": meReply("2026-09-20T12:05:00.000Z") });
    renderWithProviders(<ProfilePage />);

    expect(await screen.findByText("@ana_souza")).toBeInTheDocument();
  });
});
