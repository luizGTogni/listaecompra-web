import { signUpSchema } from "./schemas";

const valid = {
  name: "Ana Souza",
  username: "ana_souza",
  email: "ana@example.com",
  password: "secret",
};

function messages(input: Record<string, string>) {
  const result = signUpSchema.safeParse({ ...valid, ...input });
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe("signUpSchema", () => {
  it("accepts valid data", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("requires a name", () => {
    expect(messages({ name: "   " })).toEqual(["Informe seu nome."]);
  });

  describe("username", () => {
    it("needs at least 3 characters", () => {
      expect(messages({ username: "ab" })).toHaveLength(1);
      expect(messages({ username: "abc" })).toEqual([]);
    });

    it("allows at most 20 characters", () => {
      expect(messages({ username: "a".repeat(20) })).toEqual([]);
      expect(messages({ username: "a".repeat(21) })).toHaveLength(1);
    });

    it("allows only letters, numbers and underscore", () => {
      expect(messages({ username: "Ana_99" })).toEqual([]);
      expect(messages({ username: "ana.souza" })).toHaveLength(1);
      expect(messages({ username: "ana souza" })).toHaveLength(1);
      expect(messages({ username: "ánã" })).toHaveLength(1);
    });

    it("ignores surrounding spaces", () => {
      const result = signUpSchema.parse({ ...valid, username: "  ana  " });
      expect(result.username).toBe("ana");
    });
  });

  describe("email", () => {
    it("rejects malformed addresses", () => {
      expect(messages({ email: "ana@" })).toEqual([
        "Informe um e-mail válido.",
      ]);
    });

    it("ignores surrounding spaces", () => {
      const result = signUpSchema.parse({
        ...valid,
        email: " ana@example.com ",
      });
      expect(result.email).toBe("ana@example.com");
    });
  });

  describe("password", () => {
    it("is trimmed before the length check, like the backend does", () => {
      expect(messages({ password: "  ab  " })).toHaveLength(1);
      expect(
        signUpSchema.parse({ ...valid, password: "  abc  " }).password,
      ).toBe("abc");
    });

    it("allows at most 64 characters", () => {
      expect(messages({ password: "a".repeat(64) })).toEqual([]);
      expect(messages({ password: "a".repeat(65) })).toHaveLength(1);
    });
  });
});
