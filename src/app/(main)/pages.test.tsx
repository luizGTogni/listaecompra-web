import { render, screen } from "@testing-library/react";
import HistoryPage from "@/app/(main)/history/page";
import InvitesPage from "@/app/(main)/invites/page";
import ListsPage from "@/app/(main)/lists/page";
import ProfilePage from "@/app/(main)/profile/page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

describe.each([
  ["Lista", ListsPage],
  ["Histórico", HistoryPage],
  ["Convites", InvitesPage],
  ["Perfil", ProfilePage],
])("%s page", (title, Page) => {
  it("has its heading", () => {
    render(<Page />);

    expect(
      screen.getByRole("heading", { level: 1, name: title }),
    ).toBeInTheDocument();
  });
});

describe("Perfil page", () => {
  it("has the sign out button (the header hides it on mobile)", () => {
    render(<ProfilePage />);

    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
  });
});
