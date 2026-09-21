import { screen } from "@testing-library/react";
import NewListPage from "@/app/(main)/lists/new/page";
import { resetAuthStore } from "@/test/auth";
import { renderWithProviders } from "@/test/render";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

beforeEach(resetAuthStore);

describe("NewListPage", () => {
  it("renders the heading and the form", () => {
    renderWithProviders(<NewListPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Nova lista" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nome da lista")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Criar lista" }),
    ).toBeInTheDocument();
  });
});
