import { screen } from "@testing-library/react";
import InvitesPage from "@/app/(main)/invites/page";
import ListDetailPage from "@/app/(main)/lists/[id]/page";
import ProfilePage from "@/app/(main)/profile/page";
import { renderWithProviders } from "@/test/render";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

describe.each([
  ["Lista", ListDetailPage],
  ["Convites", InvitesPage],
  ["Perfil", ProfilePage],
])("%s page", (title, Page) => {
  it("has its heading", () => {
    renderWithProviders(<Page />);

    expect(
      screen.getByRole("heading", { level: 1, name: title }),
    ).toBeInTheDocument();
  });
});

describe("Perfil page", () => {
  it("has the sign out button (the header hides it on mobile)", () => {
    renderWithProviders(<ProfilePage />);

    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
  });
});
