import { ApiError, NetworkError } from "@/services/api";
import {
  getResendMessage,
  getSignInMessage,
  getSignUpFeedback,
  getVerifyMessage,
} from "./errors";

describe("getSignUpFeedback", () => {
  it("puts a taken e-mail under the e-mail field", () => {
    const feedback = getSignUpFeedback(
      new ApiError(409, { name: "EmailAlreadyExists", message: "x" }),
    );

    expect(feedback.fields).toEqual({ email: "Este e-mail já está em uso." });
    expect(feedback.form).toBeUndefined();
  });

  it("puts a taken username under the username field", () => {
    const feedback = getSignUpFeedback(
      new ApiError(409, { name: "UsernameAlreadyExists", message: "x" }),
    );

    expect(feedback.fields).toEqual({
      username: "Este nome de usuário já está em uso.",
    });
  });

  it("maps validation errors to their fields", () => {
    const feedback = getSignUpFeedback(
      new ApiError(400, {
        name: "ValidationError",
        message: "x",
        fields: [
          { code: "invalid_format", field: "username", message: "x" },
          { code: "invalid_format", field: "unknown", message: "x" },
        ],
      }),
    );

    expect(feedback.fields).toEqual({ username: "Valor inválido." });
    expect(feedback.form).toBeUndefined();
  });

  it("falls back to a general message when no issue matches a field", () => {
    const feedback = getSignUpFeedback(
      new ApiError(400, { name: "ValidationError", message: "x", fields: [] }),
    );

    expect(feedback.form).toMatch(/Algo deu errado/);
  });

  it("reports connection problems", () => {
    expect(getSignUpFeedback(new NetworkError()).form).toMatch(/conectar/);
  });

  it("reports rate limiting", () => {
    const feedback = getSignUpFeedback(new ApiError(429, null));

    expect(feedback.form).toMatch(/Muitas tentativas/);
  });

  it("falls back to a general message for anything else", () => {
    expect(getSignUpFeedback(new ApiError(500, null)).form).toMatch(
      /Algo deu errado/,
    );
    expect(getSignUpFeedback(new Error("boom")).form).toMatch(
      /Algo deu errado/,
    );
  });
});

describe("getSignInMessage", () => {
  it("does not say whether the e-mail or the password was wrong", () => {
    const error = new ApiError(401, {
      name: "InvalidCredentials",
      message: "x",
    });

    expect(getSignInMessage(error)).toBe("E-mail ou senha incorretos.");
  });

  it("falls back to the common messages", () => {
    expect(getSignInMessage(new NetworkError())).toMatch(/conectar/);
    expect(getSignInMessage(new ApiError(429, null))).toMatch(/Muitas/);
    expect(getSignInMessage(new ApiError(500, null))).toMatch(
      /Algo deu errado/,
    );
  });
});

describe("getVerifyMessage", () => {
  const api = (status: number, name: string) =>
    new ApiError(status, { name, message: "x" });

  it("tells a wrong code from an expired one", () => {
    expect(getVerifyMessage(api(401, "CodeInvalid"))).toMatch(/incorreto/);
    expect(getVerifyMessage(api(404, "ResourceNotFound"))).toMatch(/incorreto/);
    expect(getVerifyMessage(api(401, "CodeExpired"))).toMatch(/expirou/);
  });

  it("falls back to the common messages", () => {
    expect(getVerifyMessage(new NetworkError())).toMatch(/conectar/);
    expect(getVerifyMessage(api(500, "InternalServerError"))).toMatch(
      /Algo deu errado/,
    );
  });
});

describe("getResendMessage", () => {
  it("says how long to wait when asked too soon", () => {
    const error = new ApiError(
      429,
      { name: "TooManyRequests", message: "x" },
      42,
    );

    expect(getResendMessage(error)).toBe(
      "Aguarde 42s para pedir um novo código.",
    );
  });

  it("falls back to the common messages", () => {
    expect(getResendMessage(new NetworkError())).toMatch(/conectar/);
  });
});
