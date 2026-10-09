import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  Flame,
  Heart,
  LayoutDashboard,
  Leaf,
  ListChecks,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Sprout,
  Star,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

const STORAGE_KEY = "rootquest.app.v1";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CATEGORIES = ["Learning", "Wellbeing", "Creative", "Life admin"] as const;
type Category = (typeof CATEGORIES)[number];
type View = "overview" | "quests" | "habits" | "insights";
type QuestFilter = "All quests" | "To do" | "Completed";

type Quest = {
  id: string;
  title: string;
  detail: string;
  category: Category;
  minutes: number;
  reward: number;
  completed: boolean;
};

type Habit = {
  id: string;
  title: string;
  detail: string;
  category: Category;
  days: boolean[];
};

type AppData = {
  displayName: string;
  quests: Quest[];
  habits: Habit[];
  xp: number;
  streak: number;
  focusMinutes: number;
  weeklyXp: number[];
};

const CATEGORY_META: Record<Category, { icon: LucideIcon; color: string }> = {
  Learning: { icon: BookOpen, color: "learning" },
  Wellbeing: { icon: Heart, color: "wellbeing" },
  Creative: { icon: Pencil, color: "creative" },
  "Life admin": { icon: BriefcaseBusiness, color: "admin" },
};

const VIEW_META: Record<View, { label: string; icon: LucideIcon }> = {
  overview: { label: "Overview", icon: LayoutDashboard },
  quests: { label: "My quests", icon: ListChecks },
  habits: { label: "Habits", icon: Leaf },
  insights: { label: "Insights", icon: BarChart3 },
};

function getTodayIndex() {
  return (new Date().getDay() + 6) % 7;
}

function createDefaultData(): AppData {
  const today = getTodayIndex();
  const week = (recentDays: number) =>
    WEEKDAYS.map((_, index) => index <= today && today - index < recentDays);

  return {
    displayName: "Maya Chen",
    xp: 1280,
    streak: 6,
    focusMinutes: 45,
    weeklyXp: [38, 56, 42, 73, 65, 0, 0].map((xp, index) => index <= today ? xp : 0),
    quests: [
      {
        id: "quest-1",
        title: "Plan the week with intention",
        detail: "Choose three priorities and protect time for them.",
        category: "Life admin",
        minutes: 15,
        reward: 20,
        completed: true,
      },
      {
        id: "quest-2",
        title: "Get outside for a morning walk",
        detail: "A little fresh air before the day gets busy.",
        category: "Wellbeing",
        minutes: 25,
        reward: 35,
        completed: true,
      },
      {
        id: "quest-3",
        title: "Read a chapter of Deep Work",
        detail: "Chapter 4 · Rules for focused success.",
        category: "Learning",
        minutes: 25,
        reward: 40,
        completed: false,
      },
      {
        id: "quest-4",
        title: "Sketch the next big idea",
        detail: "Start rough. Give yourself room to explore.",
        category: "Creative",
        minutes: 20,
        reward: 25,
        completed: false,
      },
      {
        id: "quest-5",
        title: "Send the project follow-up",
        detail: "Close the loop with the design team.",
        category: "Life admin",
        minutes: 10,
        reward: 15,
        completed: false,
      },
    ],
    habits: [
      {
        id: "habit-1",
        title: "Move your body",
        detail: "Walk, stretch, or get a workout in.",
        category: "Wellbeing",
        days: week(5),
      },
      {
        id: "habit-2",
        title: "Read for 20 minutes",
        detail: "A few pages still move you forward.",
        category: "Learning",
        days: week(4),
      },
      {
        id: "habit-3",
        title: "Write a daily reflection",
        detail: "Notice one thing you want to remember.",
        category: "Creative",
        days: week(3),
      },
    ],
  };
}

function loadAppData(): AppData {
  const fallback = createDefaultData();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return fallback;
    const value = JSON.parse(stored) as Partial<AppData>;
    return {
      ...fallback,
      ...value,
      quests: Array.isArray(value.quests) ? value.quests : fallback.quests,
      habits: Array.isArray(value.habits) ? value.habits : fallback.habits,
      xp: typeof value.xp === "number" ? value.xp : fallback.xp,
      streak: typeof value.streak === "number" ? value.streak : fallback.streak,
      focusMinutes:
        typeof value.focusMinutes === "number" ? value.focusMinutes : fallback.focusMinutes,
      weeklyXp:
        Array.isArray(value.weeklyXp) && value.weeklyXp.length === 7 && value.weeklyXp.every((item) => typeof item === "number")
          ? value.weeklyXp
          : fallback.weeklyXp,
      displayName:
        typeof value.displayName === "string" ? value.displayName : fallback.displayName,
    };
  } catch {
    return fallback;
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function CategoryIcon({ category, size = 17 }: { category: Category; size?: number }) {
  const Icon = CATEGORY_META[category].icon;
  return <Icon aria-hidden="true" size={size} strokeWidth={1.9} />;
}

function Modal({
  children,
  title,
  subtitle,
  onClose,
  size = "regular",
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onClose: () => void;
  size?: "regular" | "wide";
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="dialog-title"
        aria-modal="true"
        className={`modal-card ${size === "wide" ? "modal-card-wide" : ""}`}
        role="dialog"
      >
        <div className="modal-heading">
          <div>
            <h2 id="dialog-title">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button aria-label="Close dialog" className="icon-button modal-close" onClick={onClose} type="button">
            <X size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tint,
}: {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tint: string;
}) {
  return (
    <article className="stat-card surface-card">
      <div className={`stat-icon ${tint}`}>
        <Icon aria-hidden="true" size={19} strokeWidth={1.9} />
      </div>
      <div className="stat-copy">
        <p className="stat-label">{label}</p>
        <div className="stat-value">{value}</div>
        <p className="stat-note">{note}</p>
      </div>
    </article>
  );
}

function QuestRow({
  quest,
  menuOpen,
  onToggle,
  onMenuToggle,
  onDelete,
}: {
  quest: Quest;
  menuOpen: boolean;
  onToggle: (quest: Quest) => void;
  onMenuToggle: (id: string) => void;
  onDelete: (quest: Quest) => void;
}) {
  const color = CATEGORY_META[quest.category].color;
  return (
    <article className={`quest-row ${quest.completed ? "quest-row-complete" : ""}`}>
      <button
        aria-label={quest.completed ? `Reopen ${quest.title}` : `Complete ${quest.title}`}
        className={`quest-check ${quest.completed ? "is-checked" : ""}`}
        onClick={() => onToggle(quest)}
        type="button"
      >
        {quest.completed && <Check size={15} strokeWidth={2.5} />}
      </button>
      <div className={`quest-category-icon ${color}`}>
        <CategoryIcon category={quest.category} />
      </div>
      <div className="quest-main-copy">
        <div className="quest-title-line">
          <h3>{quest.title}</h3>
          <span className={`category-pill ${color}`}>{quest.category}</span>
        </div>
        <p>{quest.detail}</p>
      </div>
      <div className="quest-row-meta">
        <span className="quest-duration"><Clock3 size={14} /> {quest.minutes} min</span>
        <span className="quest-xp"><Zap size={13} fill="currentColor" /> {quest.reward} XP</span>
      </div>
      <div className="quest-menu-wrap">
        <button
          aria-label={`More options for ${quest.title}`}
          aria-expanded={menuOpen}
          className="icon-button quest-more"
          onClick={() => onMenuToggle(quest.id)}
          type="button"
        >
          <MoreHorizontal size={18} />
        </button>
        {menuOpen && (
          <div className="small-menu quest-small-menu">
            <button onClick={() => onDelete(quest)} type="button">
              <X size={15} /> Remove quest
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function WeekChart({ values, compact = false }: { values: number[]; compact?: boolean }) {
  const today = getTodayIndex();
  const points = WEEKDAYS.map((_, index) => Math.max(0, values[index] ?? 0));
  const maxValue = Math.max(1, ...points);
  return (
    <div className={`week-chart ${compact ? "week-chart-compact" : ""}`}>
      {points.map((value, index) => {
        const height = value ? Math.max(9, (value / maxValue) * 100) : 4;
        return (
          <div className="chart-column" key={WEEKDAYS[index]}>
            <div className="chart-bar-area">
              <span className="chart-tooltip">{value} XP</span>
              <div
                aria-label={`${WEEKDAYS[index]}: ${value} experience points`}
                className={`chart-bar ${index === today ? "chart-bar-today" : ""}`}
                style={{ height: `${height}%` }}
              />
            </div>
            <span className={`chart-day ${index === today ? "chart-day-today" : ""}`}>{WEEKDAYS[index]}</span>
          </div>
        );
      })}
    </div>
  );
}

function HabitRow({
  habit,
  todayIndex,
  onToggle,
}: {
  habit: Habit;
  todayIndex: number;
  onToggle: (id: string, dayIndex: number) => void;
}) {
  const meta = CATEGORY_META[habit.category];
  const Icon = meta.icon;
  const completedDays = habit.days.filter(Boolean).length;
  const isDoneToday = Boolean(habit.days[todayIndex]);
  return (
    <div className="habit-row">
      <div className={`habit-icon ${meta.color}`}><Icon size={17} strokeWidth={1.9} /></div>
      <div className="habit-row-copy">
        <strong>{habit.title}</strong>
        <span>{completedDays} of 7 days this week</span>
      </div>
      <button
        aria-label={`${isDoneToday ? "Uncheck" : "Check off"} ${habit.title} for today`}
        className={`habit-today-check ${isDoneToday ? "habit-today-done" : ""}`}
        onClick={() => onToggle(habit.id, todayIndex)}
        type="button"
      >
        {isDoneToday ? <Check size={15} strokeWidth={2.4} /> : <Plus size={15} />}
      </button>
    </div>
  );
}

function HabitCard({
  habit,
  todayIndex,
  onToggleDay,
}: {
  habit: Habit;
  todayIndex: number;
  onToggleDay: (id: string, dayIndex: number) => void;
}) {
  const meta = CATEGORY_META[habit.category];
  const Icon = meta.icon;
  const done = habit.days.filter(Boolean).length;
  return (
    <article className="habit-card surface-card">
      <div className="habit-card-heading">
        <div className={`habit-icon habit-icon-large ${meta.color}`}><Icon size={19} strokeWidth={1.9} /></div>
        <div className="habit-card-title">
          <h3>{habit.title}</h3>
          <p>{habit.detail}</p>
        </div>
        <div className="habit-week-total"><strong>{done}</strong><span>/ 7</span></div>
      </div>
      <div className="habit-week-strip">
        {WEEKDAYS.map((day, index) => (
          <button
            aria-label={`${habit.days[index] ? "Unmark" : "Mark"} ${day} for ${habit.title}`}
            className={`habit-day ${habit.days[index] ? "habit-day-done" : ""} ${index === todayIndex ? "habit-day-today" : ""}`}
            key={day}
            onClick={() => onToggleDay(habit.id, index)}
            type="button"
          >
            <span className="habit-day-label">{day}</span>
            <span className="habit-day-mark">{habit.days[index] ? <Check size={13} strokeWidth={2.6} /> : <Circle size={14} />}</span>
          </button>
        ))}
      </div>
    </article>
  );
}

function App() {
  const [data, setData] = useState<AppData>(loadAppData);
  const [view, setView] = useState<View>("overview");
  const [questFilter, setQuestFilter] = useState<QuestFilter>("All quests");
  const [categoryFilter, setCategoryFilter] = useState("All domains");
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<"quest" | "habit" | "settings" | null>(null);
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const [activeQuestMenu, setActiveQuestMenu] = useState<string | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [nameDraft, setNameDraft] = useState(data.displayName);
  const searchRef = useRef<HTMLInputElement>(null);
  const todayIndex = getTodayIndex();
  const currentView = VIEW_META[view];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!focusRunning) return undefined;
    const interval = window.setInterval(() => {
      setFocusSeconds((remaining) => Math.max(0, remaining - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [focusRunning]);

  useEffect(() => {
    if (focusRunning && focusSeconds === 0) {
      setFocusRunning(false);
      setData((current) => ({ ...current, focusMinutes: current.focusMinutes + 25 }));
      setToast("Focus session complete — 25 minutes added to your progress.");
    }
  }, [focusRunning, focusSeconds]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setModal(null);
        setFocusOpen(false);
        setNotificationOpen(false);
        setAccountMenuOpen(false);
        setActiveQuestMenu(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const visibleQuests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return [...data.quests]
      .filter((quest) => {
        const matchesFilter =
          questFilter === "All quests" ||
          (questFilter === "To do" && !quest.completed) ||
          (questFilter === "Completed" && quest.completed);
        const matchesCategory = categoryFilter === "All domains" || quest.category === categoryFilter;
        const matchesQuery =
          !query || `${quest.title} ${quest.detail} ${quest.category}`.toLowerCase().includes(query);
        return matchesFilter && matchesCategory && matchesQuery;
      })
      .sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [data.quests, questFilter, categoryFilter, searchQuery]);

  const completedQuests = data.quests.filter((quest) => quest.completed).length;
  const completionPercent = data.quests.length ? Math.round((completedQuests / data.quests.length) * 100) : 0;
  const firstName = data.displayName.trim().split(/\s+/)[0] || "friend";
  const currentLevel = Math.floor(data.xp / 1600) + 8;
  const xpIntoLevel = data.xp % 1600;
  const levelName = currentLevel >= 10 ? "Wayfinder" : "Trailblazer";
  const todayString = formatDate(new Date());

  function showToast(message: string) {
    setToast(message);
  }

  function handleToggleQuest(quest: Quest) {
    const nextCompleted = !quest.completed;
    setData((current) => ({
      ...current,
      xp: Math.max(0, current.xp + (nextCompleted ? quest.reward : -quest.reward)),
      weeklyXp: current.weeklyXp.map((xp, index) =>
        index === todayIndex ? Math.max(0, xp + (nextCompleted ? quest.reward : -quest.reward)) : xp,
      ),
      quests: current.quests.map((item) =>
        item.id === quest.id ? { ...item, completed: nextCompleted } : item,
      ),
    }));
    setActiveQuestMenu(null);
    showToast(nextCompleted ? `Quest complete. +${quest.reward} XP earned.` : "Quest moved back to your list.");
  }

  function handleDeleteQuest(quest: Quest) {
    setData((current) => ({
      ...current,
      xp: Math.max(0, current.xp - (quest.completed ? quest.reward : 0)),
      weeklyXp: current.weeklyXp.map((xp, index) =>
        index === todayIndex && quest.completed ? Math.max(0, xp - quest.reward) : xp,
      ),
      quests: current.quests.filter((item) => item.id !== quest.id),
    }));
    setActiveQuestMenu(null);
    showToast("Quest removed from your list.");
  }

  function handleAddQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const detail = String(form.get("detail") ?? "").trim();
    const category = String(form.get("category") ?? "Learning") as Category;
    const minutes = Number(form.get("minutes") ?? 20);
    const reward = Number(form.get("reward") ?? 25);
    if (!title || !CATEGORIES.includes(category)) return;
    const quest: Quest = {
      id: `quest-${Date.now()}`,
      title,
      detail: detail || "A new step on your path.",
      category,
      minutes,
      reward,
      completed: false,
    };
    setData((current) => ({ ...current, quests: [quest, ...current.quests] }));
    setModal(null);
    setSearchQuery("");
    setQuestFilter("All quests");
    setCategoryFilter("All domains");
    showToast("Your new quest is ready when you are.");
  }

  function handleAddHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const detail = String(form.get("detail") ?? "").trim();
    const category = String(form.get("category") ?? "Wellbeing") as Category;
    if (!title || !CATEGORIES.includes(category)) return;
    const habit: Habit = {
      id: `habit-${Date.now()}`,
      title,
      detail: detail || "A small ritual, repeated with care.",
      category,
      days: Array(7).fill(false) as boolean[],
    };
    setData((current) => ({ ...current, habits: [...current.habits, habit] }));
    setModal(null);
    showToast("Habit added to your weekly rhythm.");
  }

  function handleToggleHabitDay(id: string, dayIndex: number) {
    setData((current) => {
      const hadCheckInToday = current.habits.some((habit) => Boolean(habit.days[todayIndex]));
      const habits = current.habits.map((habit) =>
        habit.id === id
          ? { ...habit, days: habit.days.map((done, index) => index === dayIndex ? !done : done) }
          : habit,
      );
      const hasCheckInToday = habits.some((habit) => Boolean(habit.days[todayIndex]));
      const streakChange = dayIndex === todayIndex
        ? Number(hasCheckInToday) - Number(hadCheckInToday)
        : 0;
      return {
        ...current,
        habits,
        streak: Math.max(0, current.streak + streakChange),
      };
    });
  }

  function openNewQuest() {
    setActiveQuestMenu(null);
    setModal("quest");
  }

  function startFocus() {
    if (focusSeconds === 0) setFocusSeconds(25 * 60);
    setFocusOpen(true);
    setFocusRunning(true);
  }

  function saveDisplayName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = nameDraft.trim();
    if (!trimmedName) return;
    setData((current) => ({ ...current, displayName: trimmedName }));
    setModal(null);
    showToast("Your profile has been updated.");
  }

  function selectView(nextView: View) {
    setView(nextView);
    setAccountMenuOpen(false);
    setNotificationOpen(false);
    setActiveQuestMenu(null);
  }

  const navItems = (Object.entries(VIEW_META) as [View, (typeof VIEW_META)[View]][]).map(([key, item]) => {
    const Icon = item.icon;
    return (
      <button
        aria-current={view === key ? "page" : undefined}
        className={`nav-item ${view === key ? "nav-item-active" : ""}`}
        key={key}
        onClick={() => selectView(key)}
        type="button"
      >
        <Icon aria-hidden="true" size={18} strokeWidth={1.9} />
        <span>{item.label}</span>
        {key === "quests" && <span className="nav-count">{data.quests.filter((quest) => !quest.completed).length}</span>}
      </button>
    );
  });

  function renderOverview() {
    const dashboardQuests = [...visibleQuests].slice(0, 4);
    const weekXpTotal = data.weeklyXp.reduce((sum, xp) => sum + xp, 0);
    const habitWeekCheckIns = data.habits.reduce(
      (sum, habit) => sum + habit.days.slice(0, todayIndex + 1).filter(Boolean).length,
      0,
    );
    const possibleCheckIns = data.habits.length * (todayIndex + 1);
    const weeklyConsistency = possibleCheckIns ? Math.round((habitWeekCheckIns / possibleCheckIns) * 100) : 0;
    return (
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" />{todayString}</p>
            <h1>{getGreeting()}, {firstName}.</h1>
            <p className="page-subtitle">Small steps today. A stronger path tomorrow.</p>
          </div>
          <div className="heading-actions">
            <div aria-label={todayString} className="button button-secondary date-button">
              <CalendarDays size={16} /> Today
            </div>
            <button className="button button-primary" onClick={openNewQuest} type="button">
              <Plus size={17} /> New quest
            </button>
          </div>
        </div>

        <section aria-label="Your progress" className="stats-grid">
          <StatCard label="Total experience" value={data.xp.toLocaleString()} note={`+${weekXpTotal} XP this week`} icon={Star} tint="stat-icon-gold" />
          <StatCard label="Current streak" value={`${data.streak} days`} note="One day at a time" icon={Flame} tint="stat-icon-coral" />
          <StatCard label="Quests complete" value={`${completedQuests} / ${data.quests.length}`} note={`${completionPercent}% of today's list`} icon={CheckCircle2} tint="stat-icon-green" />
          <StatCard label="Focused time" value={`${data.focusMinutes} min`} note="Time for what matters" icon={Timer} tint="stat-icon-blue" />
        </section>

        <div className="dashboard-grid">
          <section className="surface-card quests-panel">
            <div className="section-card-heading">
              <div>
                <p className="card-kicker">YOUR NEXT STEPS</p>
                <h2>Today's quests <span className="heading-count">{completedQuests}/{data.quests.length}</span></h2>
              </div>
              <button className="text-button" onClick={() => selectView("quests")} type="button">
                Quest board <ArrowRight size={15} />
              </button>
            </div>
            <div className="quest-progress-copy">
              <span>{completedQuests === data.quests.length ? "All quests complete — beautiful work." : "Steady progress is still progress."}</span>
              <strong>{completionPercent}%</strong>
            </div>
            <div aria-label={`${completionPercent}% of quests complete`} className="progress-track">
              <span style={{ width: `${completionPercent}%` }} />
            </div>
            {dashboardQuests.length ? (
              <div className="quest-list">
                {dashboardQuests.map((quest) => (
                  <QuestRow
                    key={quest.id}
                    menuOpen={activeQuestMenu === quest.id}
                    onDelete={handleDeleteQuest}
                    onMenuToggle={(id) => setActiveQuestMenu((current) => current === id ? null : id)}
                    onToggle={handleToggleQuest}
                    quest={quest}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state compact-empty">
                <div className="empty-icon"><Search size={19} /></div>
                <strong>No quests match that search.</strong>
                <span>Try a different phrase or create something new.</span>
              </div>
            )}
          </section>

          <div className="dashboard-side-stack">
            <section className="focus-card">
              <div className="focus-card-glow" />
              <div className="focus-card-topline"><span><span className="live-dot" /> MAKE ROOM FOR FOCUS</span><Target size={18} /></div>
              <h2>One thing at a time.</h2>
              <p>Give your best work a little protected space.</p>
              <div className="focus-card-bottom">
                <div className="focus-time-preview"><Timer size={17} /><strong>{focusRunning ? formatTime(focusSeconds) : "25:00"}</strong><span>focus session</span></div>
                <button aria-label="Start a focus session" className="focus-play-button" onClick={startFocus} type="button">
                  {focusRunning ? <ArrowRight size={18} /> : <Play size={16} fill="currentColor" />}
                </button>
              </div>
            </section>

            <section className="surface-card weekly-card">
              <div className="section-card-heading weekly-heading">
                <div>
                  <p className="card-kicker">A LITTLE EVERY DAY</p>
                  <h2>Your week</h2>
                </div>
                <div className="weekly-trend"><TrendingUp size={15} />{weeklyConsistency >= 70 ? "In a good rhythm" : weeklyConsistency >= 40 ? "Building momentum" : "Fresh start"}</div>
              </div>
              <div className="weekly-summary"><strong>{weeklyConsistency}%</strong><span>weekly rhythm</span><span className="weekly-summary-note">{habitWeekCheckIns} of {possibleCheckIns} check-ins</span></div>
              <WeekChart compact values={data.weeklyXp} />
            </section>
          </div>
        </div>

        <section className="surface-card habits-overview">
          <div className="section-card-heading">
            <div>
              <p className="card-kicker">BUILT THROUGH REPETITION</p>
              <h2>Daily rituals</h2>
            </div>
            <button className="text-button" onClick={() => selectView("habits")} type="button">
              All habits <ArrowRight size={15} />
            </button>
          </div>
          {data.habits.length ? (
            <div className="habit-row-grid">
              {data.habits.slice(0, 3).map((habit) => (
                <HabitRow habit={habit} key={habit.id} onToggle={handleToggleHabitDay} todayIndex={todayIndex} />
              ))}
              {data.habits.length > 3 && (
                <button className="habit-more-card" onClick={() => selectView("habits")} type="button">
                  <span>+{data.habits.length - 3}</span><span>more rituals</span><ArrowRight size={14} />
                </button>
              )}
            </div>
          ) : (
            <div className="empty-habit-inline"><span>Start with one small ritual that feels good to repeat.</span><button className="text-button" onClick={() => setModal("habit")} type="button">Add a habit <Plus size={15} /></button></div>
          )}
        </section>
      </>
    );
  }

  function renderQuests() {
    const counts: Record<QuestFilter, number> = {
      "All quests": data.quests.length,
      "To do": data.quests.filter((quest) => !quest.completed).length,
      Completed: data.quests.filter((quest) => quest.completed).length,
    };
    return (
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" />YOUR PERSONAL QUEST BOARD</p>
            <h1>Make your next move.</h1>
            <p className="page-subtitle">A clear path is built one meaningful action at a time.</p>
          </div>
          <button className="button button-primary" onClick={openNewQuest} type="button"><Plus size={17} /> New quest</button>
        </div>
        <section className="surface-card quest-board-card">
          <div className="quest-board-toolbar">
            <div className="filter-tabs" role="tablist" aria-label="Filter quests">
              {(["All quests", "To do", "Completed"] as QuestFilter[]).map((filter) => (
                <button
                  aria-selected={questFilter === filter}
                  className={`filter-tab ${questFilter === filter ? "filter-tab-active" : ""}`}
                  key={filter}
                  onClick={() => setQuestFilter(filter)}
                  role="tab"
                  type="button"
                >
                  {filter}<span>{counts[filter]}</span>
                </button>
              ))}
            </div>
            <label className="category-select-wrap">
              <span className="sr-only">Filter by domain</span>
              <select aria-label="Filter by domain" onChange={(event) => setCategoryFilter(event.target.value)} value={categoryFilter}>
                <option>All domains</option>
                {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
              <ChevronDown aria-hidden="true" size={14} />
            </label>
          </div>
          <div className="quest-board-summary">
            <div><h2>{questFilter === "All quests" ? "Your quests" : questFilter}</h2><p>{visibleQuests.length} {visibleQuests.length === 1 ? "quest" : "quests"} · {completedQuests} completed today</p></div>
            <div className="board-progress"><span>{completionPercent}% done</span><div className="progress-track"><span style={{ width: `${completionPercent}%` }} /></div></div>
          </div>
          {visibleQuests.length ? (
            <div className="quest-list quest-board-list">
              {visibleQuests.map((quest) => (
                <QuestRow
                  key={quest.id}
                  menuOpen={activeQuestMenu === quest.id}
                  onDelete={handleDeleteQuest}
                  onMenuToggle={(id) => setActiveQuestMenu((current) => current === id ? null : id)}
                  onToggle={handleToggleQuest}
                  quest={quest}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon"><ListChecks size={20} /></div>
              <strong>Nothing on this path just yet.</strong>
              <span>Add a quest or adjust your filters to see more.</span>
              <button className="button button-primary button-small" onClick={openNewQuest} type="button"><Plus size={15} /> Create a quest</button>
            </div>
          )}
        </section>
        <div className="quiet-note"><Sparkles size={16} /><span>Remember: progress is personal. Your only competition is who you were yesterday.</span></div>
      </>
    );
  }

  function renderHabits() {
    const totalCheckIns = data.habits.reduce(
      (sum, habit) => sum + habit.days.slice(0, todayIndex + 1).filter(Boolean).length,
      0,
    );
    const possibleCheckIns = data.habits.length * (todayIndex + 1);
    const weeklyRate = possibleCheckIns ? Math.round((totalCheckIns / possibleCheckIns) * 100) : 0;
    return (
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" />YOUR WEEKLY RHYTHM</p>
            <h1>Small rituals. Strong roots.</h1>
            <p className="page-subtitle">Consistency isn't about perfect days. It's about returning.</p>
          </div>
          <button className="button button-primary" onClick={() => setModal("habit")} type="button"><Plus size={17} /> Add a habit</button>
        </div>
        <section aria-label="Habit summary" className="stats-grid habit-stats-grid">
          <StatCard label="Active rituals" value={String(data.habits.length)} note="A rhythm that fits your life" icon={Leaf} tint="stat-icon-green" />
          <StatCard label="This week's check-ins" value={String(totalCheckIns)} note={`Across ${data.habits.length} active habits`} icon={CalendarCheck2} tint="stat-icon-blue" />
          <StatCard label="Weekly consistency" value={`${weeklyRate}%`} note="Small steps add up" icon={Activity} tint="stat-icon-gold" />
          <StatCard label="Current streak" value={`${data.streak} days`} note="Keep your momentum kind" icon={Flame} tint="stat-icon-coral" />
        </section>
        <section className="surface-card habits-board-card">
          <div className="section-card-heading habits-board-heading">
            <div><p className="card-kicker">WEEK AT A GLANCE</p><h2>Your rituals</h2></div>
            <div className="week-date-chip"><CalendarDays size={15} /> {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date())}</div>
          </div>
          {data.habits.length ? (
            <div className="habit-card-grid">
              {data.habits.map((habit) => <HabitCard habit={habit} key={habit.id} onToggleDay={handleToggleHabitDay} todayIndex={todayIndex} />)}
              <button className="add-habit-card" onClick={() => setModal("habit")} type="button">
                <span className="add-habit-icon"><Plus size={19} /></span>
                <strong>Add another ritual</strong>
                <span>Choose a habit you want to make space for.</span>
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon"><Leaf size={20} /></div>
              <strong>Your weekly rhythm starts here.</strong>
              <span>Choose a small ritual that supports the person you want to become.</span>
              <button className="button button-primary button-small" onClick={() => setModal("habit")} type="button"><Plus size={15} /> Add your first habit</button>
            </div>
          )}
        </section>
        <p className="habit-footnote"><Heart size={15} /> Missed a day? You're not starting over. You're starting again.</p>
      </>
    );
  }

  function renderInsights() {
    const totalCompletedXP = data.quests.filter((quest) => quest.completed).reduce((sum, quest) => sum + quest.reward, 0);
    const weekXpTotal = data.weeklyXp.reduce((sum, xp) => sum + xp, 0);
    const categoryTotals = CATEGORIES.map((category) => ({
      category,
      count: data.quests.filter((quest) => quest.category === category).length,
      xp: data.quests.filter((quest) => quest.category === category && quest.completed).reduce((sum, quest) => sum + quest.reward, 0),
    }));
    const highest = Math.max(1, ...categoryTotals.map((item) => item.count));
    return (
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" />A MOMENT TO LOOK BACK</p>
            <h1>Look how far you've come.</h1>
            <p className="page-subtitle">A little perspective makes progress easier to see.</p>
          </div>
          <div className="insight-period"><CalendarDays size={16} /> This week <ChevronDown size={14} /></div>
        </div>
        <section className="insights-stat-grid">
          <article className="insight-highlight-card">
            <div className="insight-highlight-icon"><Sparkles size={19} /></div>
            <span className="card-kicker">EXPERIENCE EARNED</span>
            <strong>{totalCompletedXP.toLocaleString()} <small>XP</small></strong>
            <p>From the quests you've completed in this view.</p>
            <div className="insight-highlight-decoration"><Sprout size={98} strokeWidth={0.8} /></div>
          </article>
          <StatCard label="Quests completed" value={String(completedQuests)} note="Every check-in counts" icon={CheckCircle2} tint="stat-icon-green" />
          <StatCard label="Habits checked in" value={String(data.habits.reduce((sum, habit) => sum + habit.days.slice(0, todayIndex + 1).filter(Boolean).length, 0))} note="This week's routines" icon={CalendarCheck2} tint="stat-icon-blue" />
          <StatCard label="Focused time" value={`${data.focusMinutes} min`} note="Time spent on what matters" icon={Timer} tint="stat-icon-gold" />
        </section>
        <div className="insights-grid">
          <section className="surface-card insights-chart-card">
            <div className="section-card-heading">
              <div><p className="card-kicker">YOUR MOMENTUM</p><h2>A week of showing up</h2></div>
              <div className="chart-legend"><span /> Quest experience</div>
            </div>
            <div className="insights-chart-summary"><strong>+{weekXpTotal} XP</strong><span>earned across this week</span><ArrowUpRight size={16} /></div>
            <WeekChart values={data.weeklyXp} />
            <div className="chart-caption"><span>Every bar is a step you chose to take.</span><span>Daily XP earned</span></div>
          </section>
          <section className="surface-card domain-card">
            <div className="section-card-heading">
              <div><p className="card-kicker">WHERE YOUR ENERGY GOES</p><h2>Your domains</h2></div>
              <span className="domain-card-icon"><Target size={17} /></span>
            </div>
            <div className="domain-breakdown">
              {categoryTotals.map(({ category, count, xp }) => {
                const color = CATEGORY_META[category].color;
                const Icon = CATEGORY_META[category].icon;
                return (
                  <div className="domain-row" key={category}>
                    <div className={`domain-icon ${color}`}><Icon size={15} /></div>
                    <div className="domain-info"><div><strong>{category}</strong><span>{count} {count === 1 ? "quest" : "quests"}</span></div><div className="domain-track"><span className={color} style={{ width: `${Math.max(count ? 12 : 0, (count / highest) * 100)}%` }} /></div></div>
                    <span className="domain-xp">{xp} XP</span>
                  </div>
                );
              })}
            </div>
            <div className="domain-card-footer"><Trophy size={16} /><span>Balance across domains makes a resilient journey.</span></div>
          </section>
        </div>
        <div className="insight-bottom-note"><div className="note-spark"><Sparkles size={17} /></div><div><strong>You're building a pattern, not chasing perfection.</strong><span>Keep noticing the small wins. That's where meaningful change takes root.</span></div><ArrowRight size={17} /></div>
      </>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><Sprout size={21} strokeWidth={2} /></div>
          <div className="brand-wordmark">root<span>quest</span><small>GROW WITH PURPOSE</small></div>
        </div>

        <div className="sidebar-workspace">
          <span className="workspace-label">WORKSPACE</span>
          <div className="workspace-switcher">
            <div className="workspace-avatar"><Sprout size={15} /></div>
            <span>Personal space</span>
          </div>
        </div>

        <nav aria-label="Main navigation" className="sidebar-nav">
          <span className="nav-section-label">YOUR JOURNEY</span>
          {navItems}
          <span className="nav-section-label nav-section-spaced">FOCUS & FLOW</span>
          <button className="nav-item" onClick={() => setFocusOpen(true)} type="button">
            <Timer aria-hidden="true" size={18} strokeWidth={1.9} />
            <span>Focus timer</span>
            {focusRunning && <span className="nav-live-dot" />}
          </button>
        </nav>

        <div className="sidebar-bottom">
          <section className="level-card">
            <div className="level-card-top"><span>YOUR CURRENT LEVEL</span><span>{String(currentLevel).padStart(2, "0")}</span></div>
            <div className="level-name"><span className="level-badge"><Trophy size={13} /></span><strong>{levelName}</strong><span>Level {currentLevel}</span></div>
            <div className="level-progress"><span style={{ width: `${xpIntoLevel / 16}%` }} /></div>
            <div className="level-progress-caption"><span>{xpIntoLevel} / 1,600 XP</span><span>Level {currentLevel + 1}</span></div>
          </section>
          <div className="sidebar-divider" />
          <div className="profile-menu-anchor">
            {accountMenuOpen && (
              <div className="account-popover">
                <div className="account-popover-heading"><span className="avatar-small">{firstName.slice(0, 1).toUpperCase()}</span><div><strong>{data.displayName}</strong><span>Level {currentLevel} · {levelName}</span></div></div>
                <button onClick={() => { setNameDraft(data.displayName); setModal("settings"); setAccountMenuOpen(false); }} type="button"><Settings size={15} /> Profile preferences</button>
              </div>
            )}
            <button className="profile-button" onClick={() => setAccountMenuOpen((open) => !open)} type="button">
              <span className="profile-avatar">{data.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
              <span className="profile-copy"><strong>{data.displayName}</strong><small>Level {currentLevel} · {levelName}</small></span>
              <MoreHorizontal size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-brand-mobile">
            <div className="brand-mark"><Sprout size={19} strokeWidth={2} /></div><strong>root<span>quest</span></strong>
          </div>
          <div className="breadcrumb"><span>Personal space</span><ChevronRight size={14} /><strong>{currentView.label}</strong></div>
          <label className="global-search">
            <Search aria-hidden="true" size={17} />
            <input
              aria-label="Search quests"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search quests..."
              ref={searchRef}
              type="search"
              value={searchQuery}
            />
            <kbd>⌘ K</kbd>
          </label>
          <div className="topbar-actions">
            <div className="notification-anchor">
              <button
                aria-expanded={notificationOpen}
                aria-label="Notifications"
                className={`icon-button notification-button ${notificationOpen ? "icon-button-selected" : ""}`}
                onClick={() => { setNotificationOpen((open) => !open); setAccountMenuOpen(false); }}
                type="button"
              >
                <Bell size={18} />
                {!notificationsRead && <span className="notification-dot" />}
              </button>
              {notificationOpen && (
                <div className="notification-popover">
                  <div className="notification-popover-heading"><div><strong>You're right on track</strong><span>A little encouragement for today</span></div><span className="notification-spark"><Sparkles size={16} /></span></div>
                  <div className="notification-item"><span className="notification-icon notification-icon-gold"><Flame size={16} /></span><div><strong>{data.streak}-day streak</strong><span>You've shown up for yourself {data.streak} days in a row.</span></div></div>
                  <div className="notification-item"><span className="notification-icon notification-icon-green"><CheckCircle2 size={16} /></span><div><strong>{completedQuests} quests complete</strong><span>Every small win is adding up.</span></div></div>
                  {!notificationsRead && <button className="notification-mark-read" onClick={() => setNotificationsRead(true)} type="button">Mark all as read</button>}
                </div>
              )}
            </div>
            <button className="topbar-avatar" onClick={() => { setNameDraft(data.displayName); setModal("settings"); setAccountMenuOpen(false); setNotificationOpen(false); }} type="button" aria-label="Open profile preferences">
              {data.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
            </button>
          </div>
        </header>

        <main className="page-content">
          {view === "overview" && renderOverview()}
          {view === "quests" && renderQuests()}
          {view === "habits" && renderHabits()}
          {view === "insights" && renderInsights()}
          <footer className="page-footer"><span>RootQuest</span><span>Make progress feel personal.</span><span>Built one step at a time <Sprout size={13} /></span></footer>
        </main>
      </div>

      <nav aria-label="Mobile navigation" className="mobile-nav">
        {(Object.entries(VIEW_META) as [View, (typeof VIEW_META)[View]][]).map(([key, item]) => {
          const Icon = item.icon;
          return <button aria-current={view === key ? "page" : undefined} className={view === key ? "mobile-nav-active" : ""} key={key} onClick={() => selectView(key)} type="button"><Icon size={19} /><span>{item.label}</span></button>;
        })}
        <button onClick={() => setFocusOpen(true)} type="button"><Timer size={19} /><span>Focus</span></button>
      </nav>

      {modal === "quest" && (
        <Modal onClose={() => setModal(null)} subtitle="Make it meaningful, keep it manageable." title="Create a new quest">
          <form className="dialog-form" onSubmit={handleAddQuest}>
            <label className="field-label" htmlFor="quest-title">Quest name</label>
            <input autoFocus className="form-input" id="quest-title" maxLength={80} name="title" placeholder="What would you like to make progress on?" required />
            <label className="field-label" htmlFor="quest-detail">A little context <span>Optional</span></label>
            <textarea className="form-input form-textarea" id="quest-detail" maxLength={160} name="detail" placeholder="Add a note to help you get started..." rows={3} />
            <div className="form-field-row">
              <div className="form-field-column"><label className="field-label" htmlFor="quest-category">Domain</label><div className="select-field"><select id="quest-category" name="category">{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select><ChevronDown size={15} /></div></div>
              <div className="form-field-column"><label className="field-label" htmlFor="quest-minutes">Time estimate</label><div className="select-field"><select defaultValue="20" id="quest-minutes" name="minutes"><option value="10">10 minutes</option><option value="20">20 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">1 hour</option></select><ChevronDown size={15} /></div></div>
            </div>
            <div className="reward-field"><span><Zap size={15} fill="currentColor" /> Reward for finishing</span><div className="select-field reward-select"><select defaultValue="25" name="reward"><option value="15">15 XP</option><option value="25">25 XP</option><option value="35">35 XP</option><option value="50">50 XP</option></select><ChevronDown size={15} /></div></div>
            <div className="modal-actions"><button className="button button-secondary" onClick={() => setModal(null)} type="button">Cancel</button><button className="button button-primary" type="submit"><Plus size={16} /> Create quest</button></div>
          </form>
        </Modal>
      )}

      {modal === "habit" && (
        <Modal onClose={() => setModal(null)} subtitle="Keep it kind, clear, and easy to return to." title="Add a weekly ritual">
          <form className="dialog-form" onSubmit={handleAddHabit}>
            <label className="field-label" htmlFor="habit-title">Habit name</label>
            <input autoFocus className="form-input" id="habit-title" maxLength={60} name="title" placeholder="e.g. Take a screen-free lunch" required />
            <label className="field-label" htmlFor="habit-detail">Your reminder <span>Optional</span></label>
            <textarea className="form-input form-textarea" id="habit-detail" maxLength={130} name="detail" placeholder="What will help this feel easy to repeat?" rows={3} />
            <label className="field-label" htmlFor="habit-category">Domain</label>
            <div className="select-field"><select id="habit-category" name="category"><option>Wellbeing</option><option>Learning</option><option>Creative</option><option>Life admin</option></select><ChevronDown size={15} /></div>
            <div className="modal-actions"><button className="button button-secondary" onClick={() => setModal(null)} type="button">Cancel</button><button className="button button-primary" type="submit"><Plus size={16} /> Add habit</button></div>
          </form>
        </Modal>
      )}

      {modal === "settings" && (
        <Modal onClose={() => setModal(null)} subtitle="A small corner of RootQuest that's yours." title="Profile preferences">
          <form className="dialog-form" onSubmit={saveDisplayName}>
            <label className="field-label" htmlFor="display-name">Your name</label>
            <input autoFocus className="form-input" id="display-name" maxLength={40} onChange={(event) => setNameDraft(event.target.value)} placeholder="Your name" value={nameDraft} />
            <div className="settings-info"><div className="settings-info-icon"><Settings size={17} /></div><p>Your quests and habits are saved privately in this browser. No account setup required.</p></div>
            <div className="modal-actions"><button className="button button-secondary" onClick={() => setModal(null)} type="button">Cancel</button><button className="button button-primary" type="submit"><Check size={16} /> Save changes</button></div>
          </form>
        </Modal>
      )}

      {focusOpen && (
        <div className="focus-overlay">
          <section aria-label="Focus session" aria-modal="true" className="focus-session-modal" role="dialog">
            <button aria-label="Close focus timer" className="focus-close icon-button" onClick={() => setFocusOpen(false)} type="button"><X size={19} /></button>
            <div className="focus-session-brand"><div className="brand-mark"><Sprout size={19} /></div><span>ROOTQUEST <i>/</i> FOCUS</span></div>
            <div className="focus-session-kicker"><span className="live-dot" /> A LITTLE SPACE FOR YOURSELF</div>
            <h2>One thing at a time.</h2>
            <p className="focus-session-copy">Choose one thing that matters. We'll keep the rest of the world quiet for a while.</p>
            <div className="timer-ring-wrap">
              <svg aria-hidden="true" className="timer-ring" viewBox="0 0 220 220">
                <circle className="timer-ring-track" cx="110" cy="110" r="98" />
                <circle className="timer-ring-progress" cx="110" cy="110" r="98" style={{ strokeDashoffset: 616 - (616 * (focusSeconds / (25 * 60))) }} />
              </svg>
              <div className="timer-ring-content"><span>{focusRunning ? "STAY WITH IT" : "TAKE YOUR TIME"}</span><strong>{formatTime(focusSeconds)}</strong><small>25 minute focus</small></div>
            </div>
            <div className="focus-session-controls">
              <button className="button button-focus-main" onClick={() => { if (focusSeconds === 0) setFocusSeconds(25 * 60); setFocusRunning((running) => !running); }} type="button">
                {focusRunning ? <><Pause size={17} fill="currentColor" /> Pause session</> : <><Play size={16} fill="currentColor" /> {focusSeconds === 25 * 60 ? "Start session" : focusSeconds === 0 ? "Start again" : "Continue session"}</>}
              </button>
              <button aria-label="Reset timer" className="icon-button focus-reset" onClick={() => { setFocusRunning(false); setFocusSeconds(25 * 60); }} type="button"><RotateCcw size={17} /></button>
            </div>
            <div className="focus-session-footer"><span><CheckCircle2 size={15} /> No streaks to protect. Just time for you.</span><span>Session progress saves automatically</span></div>
          </section>
        </div>
      )}

      {toast && <div className="toast-message" role="status"><span><Check size={15} /></span>{toast}</div>}
    </div>
  );
}

export default App;
