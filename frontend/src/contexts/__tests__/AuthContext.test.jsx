import React from "react";
import { render, screen } from "@testing-library/react";
import { useAuth, AuthProvider } from "../AuthContext";

// Utility test component to consume context
function TestComponent() {
  const { user, role, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="user">{user ? user.name : "no-user"}</div>
      <div data-testid="role">{role || "no-role"}</div>
      <button onClick={() => login({ name: "Shiva" }, "admin")}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  test("provides default values", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    expect(screen.getByTestId("role")).toHaveTextContent("no-role");
  });

  test("updates values after login and logout", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Click Login
    screen.getByText("Login").click();
    expect(screen.getByTestId("user")).toHaveTextContent("Shiva");
    expect(screen.getByTestId("role")).toHaveTextContent("admin");

    // Click Logout
    screen.getByText("Logout").click();
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");
  });
});
