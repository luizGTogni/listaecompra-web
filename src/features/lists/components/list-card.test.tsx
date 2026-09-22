import { render, screen } from "@testing-library/react";
import { makeList } from "@/test/fixtures";
import { ListCard } from "./list-card";

describe("ListCard", () => {
  it("links to the list and shows its title, description and date", () => {
    render(
      <ListCard
        list={makeList({
          id: "abc",
          title: "Feira",
          description: "Sábado",
          createdAt: "2026-09-20T12:00:00.000Z",
        })}
      />,
    );

    const link = screen.getByRole("link", { name: /Feira/ });
    expect(link).toHaveAttribute("href", "/lists/abc");
    expect(screen.getByText("Sábado")).toBeInTheDocument();
    expect(
      screen.getByText("Criada em 20 de set. de 2026"),
    ).toBeInTheDocument();
  });

  it("has no flags by default", () => {
    render(<ListCard list={makeList()} />);

    expect(screen.queryByText("Convidado")).toBeNull();
    expect(screen.queryByText("Concluída")).toBeNull();
  });

  it("flags a list the user was invited to", () => {
    render(<ListCard list={makeList()} isGuest />);

    expect(screen.getByText("Convidado")).toBeInTheDocument();
  });

  it("flags a finished list", () => {
    render(
      <ListCard list={makeList({ closedAt: "2026-09-01T10:00:00.000Z" })} />,
    );

    expect(screen.getByText("Concluída")).toBeInTheDocument();
  });

  it("can hide the closed badge, e.g. on a screen that is closed lists only", () => {
    render(
      <ListCard
        list={makeList({ closedAt: "2026-09-01T10:00:00.000Z" })}
        showClosedBadge={false}
      />,
    );

    expect(screen.queryByText("Concluída")).toBeNull();
  });
});
