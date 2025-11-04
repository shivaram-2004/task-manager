import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { TasksProvider, useTasks } from "../TasksContext";

// Simple test component to consume TasksContext
function TestComponent() {
  const { tasks, loading, addTask } = useTasks();

  return (
    <div>
      <div data-testid="loading">{loading ? "true" : "false"}</div>
      <div data-testid="taskCount">{tasks.length}</div>
      <button
        onClick={() => addTask({ id: 1, title: "Sample Task", status: "To Do" })}
      >
        Add Task
      </button>
    </div>
  );
}

describe("TasksContext", () => {
  test("provides default values", () => {
    render(
      <TasksProvider>
        <TestComponent />
      </TasksProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("taskCount")).toHaveTextContent("0");
  });

  test("adds new task correctly", async () => {
    render(
      <TasksProvider>
        <TestComponent />
      </TasksProvider>
    );

    // Simulate adding task
    screen.getByText("Add Task").click();

    // Verify new task count
    await waitFor(() =>
      expect(screen.getByTestId("taskCount")).toHaveTextContent("1")
    );
  });
});
