import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Group } from "@/types";
import { cn } from "@/lib/utils";

interface GroupTabsProps {
    groups: Group[];
    activeGroupId: string;
    onSelect: (id: string) => void;
    onReorder: (orderedIds: string[]) => void;
}

export function GroupTabs({
    groups,
    activeGroupId,
    onSelect,
    onReorder
}: GroupTabsProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 160, tolerance: 6 }
        })
    );

    const ids = groups.map((g) => g.id);

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = ids.indexOf(String(active.id));
        const newIndex = ids.indexOf(String(over.id));
        if (oldIndex < 0 || newIndex < 0) return;
        onReorder(arrayMove(ids, oldIndex, newIndex));
    };

    if (groups.length <= 1) return null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
        >
            <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
                <div className="w-full overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex w-max gap-2 px-4 pb-3.5">
                        {groups.map((group) => (
                            <GroupTab
                                key={group.id}
                                group={group}
                                active={group.id === activeGroupId}
                                onSelect={() => onSelect(group.id)}
                            />
                        ))}
                    </div>
                </div>
            </SortableContext>
        </DndContext>
    );
}

function GroupTab({
    group,
    active,
    onSelect
}: {
    group: Group;
    active: boolean;
    onSelect: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: group.id });

    return (
        <button
            ref={setNodeRef}
            type="button"
            onClick={onSelect}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                zIndex: isDragging ? 20 : undefined
            }}
            className={cn(
                "touch-none rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                active
                    ? "bg-white text-black shadow-sm"
                    : "bg-white/[0.12] text-white/70 hover:bg-white/[0.16] hover:text-white",
                isDragging && "scale-105 opacity-95 shadow-lg ring-2 ring-white/30"
            )}
            {...attributes}
            {...listeners}
        >
            {group.name}
            <span
                className={cn(
                    "ml-1.5 tabular-nums",
                    active ? "text-black/45" : "text-white/45"
                )}
            >
                {group.counters.length}
            </span>
        </button>
    );
}
