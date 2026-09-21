import { isActive, NAV_ITEMS } from "./nav-items";

describe("NAV_ITEMS", () => {
  it("keeps the featured Lista (shopping bag icon) in the middle of the bar", () => {
    const middle = NAV_ITEMS[Math.floor(NAV_ITEMS.length / 2)];

    expect(NAV_ITEMS.length % 2).toBe(1);
    expect(middle).toMatchObject({ label: "Lista", href: "/lists" });
    expect(NAV_ITEMS.filter((item) => item.featured)).toEqual([middle]);
  });

  it("has Perfil as the last item", () => {
    expect(NAV_ITEMS.at(-1)).toMatchObject({
      label: "Perfil",
      href: "/profile",
    });
  });
});

describe("isActive", () => {
  it("matches the home page only on '/'", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/lists", "/")).toBe(false);
  });

  it("matches a tab and its sub-routes", () => {
    expect(isActive("/lists", "/lists")).toBe(true);
    expect(isActive("/lists/new", "/lists")).toBe(true);
  });

  it("does not match a route that only shares a prefix", () => {
    expect(isActive("/lists-archive", "/lists")).toBe(false);
  });
});
