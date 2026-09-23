import { screen } from "@testing-library/react";
import MainLayout from "@/app/(main)/layout";
import { meReply, mockApi } from "@/test/fetch";
import { renderWithProviders } from "@/test/render";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  // A page where the floating "+" is expected to show.
  usePathname: () => "/lists",
}));

beforeEach(() => {
  replace.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("MainLayout", () => {
  it("shows the page, the bottom bar and the new list button to a verified user", async () => {
    mockApi({ "GET /users/me": meReply("2026-09-20T12:05:00.000Z") });
    renderWithProviders(
      <MainLayout>
        <p>page</p>
      </MainLayout>,
    );

    expect(await screen.findByText("page")).toBeInTheDocument();
    // Header links and the bottom bar both exist (CSS shows one per screen size).
    expect(
      screen.getAllByRole("navigation", { name: "Principal" }),
    ).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "Nova lista" }),
    ).toBeInTheDocument();
  });

  it("shows no navigation until the account is verified", async () => {
    mockApi({ "GET /users/me": meReply() });
    renderWithProviders(
      <MainLayout>
        <p>page</p>
      </MainLayout>,
    );

    expect(screen.queryByText("page")).not.toBeInTheDocument();
    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(
      screen.getAllByRole("navigation", { name: "Principal" }),
    ).toHaveLength(1);
    expect(screen.queryByRole("link", { name: "Nova lista" })).toBeNull();
  });
});
