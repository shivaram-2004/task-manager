import { render, screen } from "@testing-library/react";
import React from "react";

function Demo() {
  return <div>Hello Jest + RTL 👋</div>;
}

test("renders demo text", () => {
  render(<Demo />);
  expect(screen.getByText(/Hello Jest/i)).toBeInTheDocument();
});
