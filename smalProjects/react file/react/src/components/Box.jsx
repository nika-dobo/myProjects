import React, { useState } from "react";
import list from "./script";

function Box() {
  const [items, setItems] = useState(list);
  const [filter, setFilter] = useState("all");

  const handleToggle = (title) => {
    setItems((prev) =>
      prev.map((item) =>
        item.title === title ? { ...item, bool: !item.bool } : item,
      ),
    );
  };

  const handleRemove = (title) => {
    setItems((prev) => prev.filter((item) => item.title !== title));
  };

  const filteredItems = items.filter((item) => {
    if (filter === "active") return item.bool;
    if (filter === "inactive") return !item.bool;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Extensions List
        </h1>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setFilter("all")}
            className={`${
              filter === "all"
                ? "bg-[#ea5342] text-white"
                : "bg-[#181d33] text-slate-400 hover:text-slate-200"
            } px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`${
              filter === "active"
                ? "bg-[#ea5342] text-white"
                : "bg-[#181d33] text-slate-400 hover:text-slate-200"
            } px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("inactive")}
            className={`${
              filter === "inactive"
                ? "bg-[#ea5342] text-white"
                : "bg-[#181d33] text-slate-400 hover:text-slate-200"
            } px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Extensions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          return (
            <div
              key={item.title}
              className="bg-[#15192c] border border-[#212744] rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-43.75"
            >
              {/* Card Header (Image + Title + Description) */}
              <div className="flex items-start gap-4">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-12 h-12 rounded-xl object-contain shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-semibold text-base sm:text-lg leading-tight">
                    {item.title}
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Card Footer (Remove button + Toggle Switch) */}
              <div className="flex items-center justify-between pt-5 mt-auto">
                <button
                  onClick={() => handleRemove(item.title)}
                  className="px-3.5 py-1 text-xs text-slate-300 rounded-full border border-slate-700/80 bg-[#1e2338]/40 font-medium hover:border-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  Remove
                </button>

                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={item.bool}
                    onChange={() => handleToggle(item.title)}
                  />
                  <div className="toggle-switch-background">
                    <div className="toggle-switch-handle" />
                  </div>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Box;
