"use client";

import {
  BoardColumn,
  BoardContainer,
  Column,
} from "@/components/kanban/board-column";
import { TaskItem } from "@/components/kanban/task-item";
import api from "@/lib/services/api";
import { ColStatus, Task, TaskStatus } from "@/lib/types/models/task";
import { getStatusLabel, hasDraggableData } from "@/lib/utils";
import {
  Announcements,
  defaultDropAnimation,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useTeam } from "../providers/team-provider";
import { coordinateGetter } from "./mutiple-containers-keyboard-preset";

const defaultCols = [
  {
    id: ColStatus.TODO,
    title: "Todo",
    status: TaskStatus.Pending,
  },
  {
    id: ColStatus.IN_PROGRESS,
    title: "In Progress",
    status: TaskStatus.InProgress,
  },
  {
    id: ColStatus.COMPLETE,
    title: "Complete",
    status: TaskStatus.Completed,
  },
  {
    id: ColStatus.OVERDUE,
    title: "Overdue",
    status: TaskStatus.Overdue,
  },
] satisfies Column[];

export type ColumnId = (typeof defaultCols)[number]["id"];

export default function KanbanBoard() {
  const { team } = useTeam();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const pickedUpTaskColumn = useRef<TaskStatus | null>(null);
  const [saveOldTask, setSaveOldTask] = useState<Task | null>(null);
  const columnsId = useMemo(
    () => defaultCols.map((col) => col.id),
    [defaultCols]
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    })
  );

  function getDraggingTaskData(
    taskId: UniqueIdentifier,
    colStatus: TaskStatus
  ) {
    const tasksInColumn = tasks.filter((task) => task.status === colStatus);
    const taskPosition = tasksInColumn.findIndex((task) => task._id === taskId);
    const column = defaultCols.find((col) => col.status === colStatus);
    return {
      tasksInColumn,
      taskPosition,
      column,
    };
  }

  // Announcements provide accessibility features for screen readers
  // They announce what's happening during drag operations
  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return;
      if (active.data.current?.type === "Task") {
        pickedUpTaskColumn.current = active.data.current.task.status;
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          active.id,
          pickedUpTaskColumn.current
        );
        return `Picked up Task ${active.data.current.task.title} at position: ${
          taskPosition + 1
        } of ${tasksInColumn.length} in column ${column?.title}`;
      }
    },
    onDragOver({ active, over }) {
      if (!over || !hasDraggableData(active) || !hasDraggableData(over)) return;

      if (
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.status
        );
        if (over.data.current.task.status !== pickedUpTaskColumn.current) {
          return `Task ${
            active.data.current.task.title
          } was moved over column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        return `Task was moved over position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
    },
    onDragEnd({ active, over }) {
      if (!over || !hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpTaskColumn.current = null;
        return;
      }
      if (
        active.data.current?.type === "Task" &&
        over.data.current?.type === "Task"
      ) {
        const { tasksInColumn, taskPosition, column } = getDraggingTaskData(
          over.id,
          over.data.current.task.status
        );
        if (over.data.current.task.status !== pickedUpTaskColumn.current) {
          return `Task was dropped into column ${column?.title} in position ${
            taskPosition + 1
          } of ${tasksInColumn.length}`;
        }
        return `Task was dropped into position ${taskPosition + 1} of ${
          tasksInColumn.length
        } in column ${column?.title}`;
      }
      pickedUpTaskColumn.current = null;
    },
    onDragCancel({ active }) {
      pickedUpTaskColumn.current = null;
      if (!hasDraggableData(active)) return;
      return `Dragging ${active.data.current?.type} cancelled.`;
    },
  };

  useEffect(() => {
    const fetchTasks = async () => {
      if (!team._id) return;
      try {
        const result = await api.getUserTeamTasks(team._id as string, {
          page: 1,
          limit: 500,
        });
        if (result?.data) {
          setTasks(result.data);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load tasks");
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [team._id]);

  const handleTaskStatusUpdate = async (
    taskId: string,
    newStatus: TaskStatus
  ) => {
    try {
      console.log(`Updating task ${taskId} to status: ${newStatus}`);

      const result = await api.updateTask(team._id as string, taskId, { status: newStatus });

      if (result && result.data) {
        toast.success(`Task moved to ${getStatusLabel(newStatus)}`);
      } else {
        throw new Error("Failed to update task status");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update task status");
      console.error("Error updating task:", error);
    }
  };

  return (
    <DndContext
      accessibility={{
        announcements,
      }}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <BoardContainer>
        <SortableContext items={columnsId}>
          {defaultCols.map((col) => (
            <BoardColumn
              key={col.id}
              column={col}
              tasks={tasks.filter((task) => task.status === col.status)}
            />
          ))}
        </SortableContext>
      </BoardContainer>

      {typeof window !== "undefined" &&
        "document" in window &&
        createPortal(
          <DragOverlay dropAnimation={defaultDropAnimation}>
            {activeTask && <TaskItem task={activeTask} isOverlay />}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );

  // Handle dragging a task
  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === "Task") {
      setActiveTask(data.task);
      setSaveOldTask(data.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) {
      return;
    }
    const activeId = active.id;
    if (!hasDraggableData(active)) return;
    const activeData = active.data.current;

    if (activeData?.type === "Task") {
      const task = activeData.task as Task;
      let newStatus: TaskStatus = task.status;
      console.log(saveOldTask);

      if (hasDraggableData(over)) {
        const overData = over.data.current;
        if (overData?.type === "Task") {
          newStatus = (overData.task as Task).status;
        }

        if (saveOldTask?.status !== newStatus) {
          handleTaskStatusUpdate(activeId.toString(), newStatus);
        }
      }
    }
    setSaveOldTask(null);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;

    const isActiveATask = activeData?.type === "Task";

    if (!isActiveATask) return;

    if (hasDraggableData(over)) {
      const overData = over.data.current;
      const isOverATask = overData?.type === "Task";
      const isOverAColumn = overData?.type === "Column";

      if (isActiveATask && isOverATask) {
        setTasks((tasks) => {
          const activeIndex = tasks.findIndex((t) => t._id === activeId);
          const overIndex = tasks.findIndex((t) => t._id === overId);

          if (activeIndex === -1 || overIndex === -1) return tasks;
          if (activeIndex === overIndex) return tasks;

          const activeTask = tasks[activeIndex];
          const overTask = tasks[overIndex];
          
          // Only update if the tasks exist and are in different statuses
          if (activeTask && overTask && activeTask.status !== overTask.status) {
            const updatedTasks = [...tasks];
            updatedTasks[activeIndex] = {...activeTask, status: overTask.status};
            return arrayMove(updatedTasks, activeIndex, overIndex - 1);
          }

          // Only reorder if position actually changes
          if (Math.abs(activeIndex - overIndex) <= 0) return tasks;
          
          return arrayMove(tasks, activeIndex, overIndex);
        });
      } else if (isActiveATask && isOverAColumn) {
        setTasks((tasks) => {
          const activeIndex = tasks.findIndex((t) => t._id === activeId);
          if (activeIndex === -1) return tasks;

          const activeTask = { ...tasks[activeIndex] };
          const newStatus = overData.column.status;

          // Only update if status is changing
          if (activeTask.status === newStatus) return tasks;

          // Create a new array with the updated task
          const updatedTasks = [...tasks];
          updatedTasks[activeIndex] = {
            ...activeTask,
            status: newStatus,
          };

          return updatedTasks;
        });
      }
    }
  }
}
