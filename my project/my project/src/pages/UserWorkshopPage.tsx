import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Plus, Trash2, AlertTriangle, Edit2, Check, X, ArrowUpDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppContext, WorkshopItem } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";

const categories = ["Equipment", "Software", "Service", "Material", "Personnel", "Marketing", "Other"];
const priorities = [
  { value: "high" as const, label: "High", color: "bg-destructive/10 text-destructive" },
  { value: "medium" as const, label: "Medium", color: "bg-accent/10 text-accent" },
  { value: "low" as const, label: "Low", color: "bg-muted text-muted-foreground" },
];

export default function UserWorkshopPage() {
  const { selectedIndustry, budget, workshopItems, addWorkshopItem, removeWorkshopItem, updateWorkshopItem, workshopTotalCost } = useAppContext();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<WorkshopItem | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "cost" | "priority">("priority");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [newItem, setNewItem] = useState<Omit<WorkshopItem, "id">>({
    name: "", category: "Equipment", estimatedCost: 0, notes: "", priority: "medium",
  });

  if (!selectedIndustry) {
    return (
      <div className="flex flex-col items-center justify-center h-96 page-enter">
        <AlertTriangle className="w-10 h-10 text-accent mb-3" />
        <h2 className="text-base font-semibold mb-1">No Industry Selected</h2>
        <p className="text-sm text-muted-foreground mb-3">Select an industry first to customize your needs.</p>
        <button onClick={() => navigate("/dashboard/industry")} className="text-primary underline text-sm">
          Go to Industries
        </button>
      </div>
    );
  }

  const handleAdd = () => {
    if (!newItem.name) return;
    addWorkshopItem(newItem);
    setNewItem({ name: "", category: "Equipment", estimatedCost: 0, notes: "", priority: "medium" });
  };

  const startEdit = (item: WorkshopItem) => {
    setEditingId(item.id);
    setEditItem({ ...item });
  };

  const saveEdit = () => {
    if (!editItem) return;
    updateWorkshopItem(editItem);
    setEditingId(null);
    setEditItem(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditItem(null);
  };

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const sortedItems = [...workshopItems]
    .filter(i => !filterCategory || i.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "cost") return b.estimatedCost - a.estimatedCost;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const totalCost = workshopTotalCost;
  const highPriorityCount = workshopItems.filter(i => i.priority === "high").length;
  const categoryBreakdown = categories
    .map(c => ({ category: c, count: workshopItems.filter(i => i.category === c).length, cost: workshopItems.filter(i => i.category === c).reduce((s, i) => s + i.estimatedCost, 0) }))
    .filter(c => c.count > 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto page-enter">
      <div className="text-center mb-8">
        <div className="icon-box mx-auto"><Lightbulb className="w-6 h-6 text-accent" /></div>
        <h1 className="section-title-gradient text-3xl mb-1.5">My Workshop</h1>
        <p className="text-muted-foreground text-sm">
          {selectedIndustry.icon} {selectedIndustry.name} — Add your own requirements
        </p>
      </div>

      {/* Summary Stats */}
      {workshopItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
          <div className="neo-card text-center py-3">
            <p className="text-[10px] text-muted-foreground mb-0.5">Items</p>
            <p className="font-mono text-xl font-bold text-primary">{workshopItems.length}</p>
          </div>
          <div className="neo-card text-center py-3">
            <p className="text-[10px] text-muted-foreground mb-0.5">Total Cost</p>
            <p className="font-mono text-xl font-bold text-accent">${totalCost.toLocaleString()}</p>
          </div>
          <div className="neo-card text-center py-3">
            <p className="text-[10px] text-muted-foreground mb-0.5">High Priority</p>
            <p className="font-mono text-xl font-bold text-destructive">{highPriorityCount}</p>
          </div>
          <div className="neo-card text-center py-3">
            <p className="text-[10px] text-muted-foreground mb-0.5">Budget Left</p>
            <p className={`font-mono text-xl font-bold ${budget - totalCost >= 0 ? "text-primary" : "text-destructive"}`}>
              ${(budget - totalCost).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Add New Item Form */}
      <div className="neo-card mb-6">
        <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">Add Custom Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Item Name *</label>
            <Input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. CRM Software" className="bg-secondary border-border rounded-lg" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Category</label>
            <select value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}
              className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-foreground">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Estimated Cost ($)</label>
            <Input type="number" value={newItem.estimatedCost || ""}
              onChange={e => setNewItem(p => ({ ...p, estimatedCost: parseFloat(e.target.value) || 0 }))}
              placeholder="0" className="bg-secondary border-border rounded-lg font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
            <select value={newItem.priority} onChange={e => setNewItem(p => ({ ...p, priority: e.target.value as WorkshopItem["priority"] }))}
              className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-foreground">
              {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
          <Input value={newItem.notes} onChange={e => setNewItem(p => ({ ...p, notes: e.target.value }))}
            placeholder="Optional notes" className="bg-secondary border-border rounded-lg" />
        </div>
        <Button onClick={handleAdd} disabled={!newItem.name}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm">
          <Plus className="w-4 h-4 mr-1" /> Add Item
        </Button>
      </div>

      {/* Items List */}
      {workshopItems.length > 0 ? (
        <>
          {/* Sort & Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowUpDown className="w-3 h-3" /> Sort:
            </div>
            {(["priority", "cost", "name"] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`chip ${sortBy === s ? "chip-active" : "chip-inactive"}`}>
                {s === "cost" ? "Cost ↓" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
              <Filter className="w-3 h-3" /> Filter:
            </div>
            <button onClick={() => setFilterCategory("")}
              className={`chip ${!filterCategory ? "chip-active" : "chip-inactive"}`}>All</button>
            {categoryBreakdown.map(c => (
              <button key={c.category} onClick={() => setFilterCategory(c.category)}
                className={`chip ${filterCategory === c.category ? "chip-active" : "chip-inactive"}`}>
                {c.category} ({c.count})
              </button>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            {sortedItems.map((item, i) => {
              const isEditing = editingId === item.id;
              const priorityStyle = priorities.find(p => p.value === item.priority);

              return (
                <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="neo-card flex items-center justify-between py-3.5">
                  {isEditing && editItem ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                      <Input value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                        className="bg-secondary border-border rounded-lg text-sm" />
                      <Input type="number" value={editItem.estimatedCost}
                        onChange={e => setEditItem({ ...editItem, estimatedCost: parseFloat(e.target.value) || 0 })}
                        className="bg-secondary border-border rounded-lg text-sm font-mono" />
                      <select value={editItem.priority}
                        onChange={e => setEditItem({ ...editItem, priority: e.target.value as WorkshopItem["priority"] })}
                        className="h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-foreground">
                        {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                      <div className="flex gap-1.5">
                        <button onClick={saveEdit} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Check className="w-4 h-4" /></button>
                        <button onClick={cancelEdit} className="p-2 text-muted-foreground hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 flex-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${priorityStyle?.color}`}>
                          {item.priority.toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground">
                          {item.category}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-primary">${item.estimatedCost.toLocaleString()}</span>
                        <button onClick={() => startEdit(item)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => removeWorkshopItem(item.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Category Breakdown */}
          {categoryBreakdown.length > 1 && (
            <div className="neo-card mb-4">
              <h3 className="text-[10px] tracking-widest text-muted-foreground mb-3 uppercase">By Category</h3>
              <div className="space-y-2">
                {categoryBreakdown.map(c => (
                  <div key={c.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{c.category}</span>
                      <span className="text-xs text-muted-foreground">({c.count} items)</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-primary">${c.cost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="neo-card text-center border-primary/15">
            <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-widest">Total Workshop Cost</p>
            <p className="font-mono text-3xl font-bold text-primary">${totalCost.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{workshopItems.length} item{workshopItems.length !== 1 ? "s" : ""} across {categoryBreakdown.length} categor{categoryBreakdown.length !== 1 ? "ies" : "y"}</p>
            {budget > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (totalCost / budget) * 100)}%`,
                      background: totalCost > budget ? "hsl(var(--destructive))" : "hsl(var(--primary))",
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {((totalCost / budget) * 100).toFixed(1)}% of your ${budget.toLocaleString()} budget
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="neo-card text-center py-10">
          <Lightbulb className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No custom items yet. Add what you need above!</p>
        </div>
      )}
    </motion.div>
  );
}
