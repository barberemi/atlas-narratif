const LoreCard = ({ item, type }) => {
  // On définit une icône selon le type d'élément
  const icons = {
    character: "👤",
    location: "📍",
    item: "⚔️",
    threat: "⚠️"
  };

  return (
    <div className="group relative bg-[#13212E]/50 border border-white/5 rounded-2xl p-6 hover:border-[#3F51B5FF]/50 transition-all duration-500 hover:-translate-y-1 shadow-xl overflow-hidden">
      {/* Effet de halo au survol */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#3F51B5FF]/10 blur-3xl group-hover:bg-[#3F51B5FF]/20 transition-colors"></div>

      <div className="flex justify-between items-start mb-4">
        <span className="text-3xl">{icons[type] || "📄"}</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
          {type}
        </span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#3F51B5FF] transition-colors">
        {item.name}
      </h3>
      
      <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">
        {item.description}
      </p>

      {/* Affichage des tags (traits pour perso, régime pour pays, etc.) */}
      <div className="flex flex-wrap gap-2">
        {(item.traits || [item.type || item.regime]).filter(Boolean).map((tag, i) => (
          <span key={i} className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-300 border border-white/10">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LoreCard;