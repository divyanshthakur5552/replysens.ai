import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ChatSidebar } from "@/components/chat";
import { BookingsChart } from "@/components/ui/BookingsChart";
import { ServicesBarChart } from "@/components/ui/ServicesBarChart";
import { StatusDonutChart } from "@/components/ui/StatusDonutChart";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusPill } from "@/components/ui/status-pill";
import { Clock, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


const API_URL = "http://localhost:8000/booking";

const getAuthToken = () => localStorage.getItem("token");

interface Customer {
  name?: string;
  phone?: string;
  address?: string;
  issue?: string;
}

interface Booking {
  _id: string;
  service: string;
  date: string;
  slot: string;
  status: "pending" | "confirmed" | "canceled";
  customer: Customer;
  source: string;
  createdAt: string;
}

type TabType = "all" | "today" | "upcoming";

interface CalendarBooking {
  _id: string;
  service: string;
  slot: string;
  status: string;
  customer: { name: string; phone: string };
}

interface CalendarData {
  [date: string]: CalendarBooking[];
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  
  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData>({});

  const fetchBookings = async (tab: TabType) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const endpoint = tab === "all" ? "/all" : tab === "today" ? "/today" : "/upcoming";
      const res = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(Array.isArray(res.data) ? res.data : [res.data].filter(Boolean));
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarData = async () => {
    try {
      const token = getAuthToken();
      const res = await axios.get(`${API_URL}/calendar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCalendarData(res.data);
    } catch (err) {
      console.error("Failed to fetch calendar data:", err);
    }
  };

  useEffect(() => {
    fetchBookings(activeTab);
    fetchCalendarData();
  }, [activeTab]);


  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/20 text-green-400";
      case "pending": return "bg-yellow-500/20 text-yellow-400";
      case "canceled": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  // Generate chart data from bookings (for line chart)
  const chartData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const count = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate >= dayStart && bookingDate <= dayEnd;
      }).length;
      
      last7Days.push({ date: dateStr, bookings: count });
    }
    return last7Days;
  }, [bookings]);

  // Generate service breakdown data
  const serviceData = useMemo(() => {
    const serviceCounts: Record<string, number> = {};
    bookings.forEach(b => {
      const service = b.service || "Unknown";
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });
    return Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [bookings]);

  // Generate status breakdown data
  const statusData = useMemo(() => {
    const confirmed = bookings.filter(b => b.status === "confirmed").length;
    const pending = bookings.filter(b => b.status === "pending").length;
    const canceled = bookings.filter(b => b.status === "canceled").length;
    return [
      { name: "Confirmed", value: confirmed, color: "#FF477E" },
      { name: "Pending", value: pending, color: "#FF7096" },
      { name: "Canceled", value: canceled, color: "#FF99AC" },
    ].filter(item => item.value > 0);
  }, [bookings]);

  return (
    <div className="h-screen w-full flex bg-[var(--background)]">
      <ChatSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col bg-[var(--surface)] h-screen overflow-hidden">
        {/* Header */}
        <div className="shrink-0 py-6 flex items-center justify-between" style={{ paddingLeft: "24px", paddingRight: "24px" }}>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Manage your bookings</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto pb-8" style={{ paddingLeft: "24px", paddingRight: "24px", paddingTop: "16px" }}>
          {/* Line Chart - Full Width */}
          <div style={{ marginBottom: "24px" }}>
            <BookingsChart data={chartData} title="Bookings (Last 7 Days)" />
          </div>

          {/* Bento Grid - Calendar + Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ marginTop: "24px" }}>
            {/* Compact Calendar Widget */}
            <div className="lg:col-span-2 bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
              <div className="p-4 border-b border-[var(--border)]">
                <h3 className="font-semibold text-[var(--text-primary)]">Calendar</h3>
              </div>
              <div className="flex flex-col md:flex-row">
                {/* Calendar */}
                <div className="p-4 flex-shrink-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    modifiers={{
                      hasBooking: Object.keys(calendarData).map(d => new Date(d)),
                    }}
                    modifiersClassNames={{
                      hasBooking: "relative after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:size-1.5 after:rounded-full after:bg-green-500",
                    }}
                    className="!w-auto"
                  />
                </div>
                
                {/* Selected Day Bookings */}
                <div className="flex-1 border-t md:border-t-0 md:border-l border-[var(--border)]" style={{ minWidth: "240px" }}>
                  <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                      {format(selectedDate, "EEEE, MMM d")}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {(calendarData[format(selectedDate, "yyyy-MM-dd")] || []).length} bookings
                    </p>
                  </div>
                  <ScrollArea className="h-[280px]">
                    <div style={{ padding: "12px" }}>
                      {(calendarData[format(selectedDate, "yyyy-MM-dd")] || []).length === 0 ? (
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)", textAlign: "center", padding: "40px 0" }}>No bookings</p>
                      ) : (
                        (calendarData[format(selectedDate, "yyyy-MM-dd")] || []).map((booking, index) => (
                          <div 
                            key={booking._id} 
                            style={{ 
                              padding: "12px 14px", 
                              borderRadius: "10px", 
                              backgroundColor: "var(--card)", 
                              border: "1px solid var(--border)",
                              marginBottom: index < (calendarData[format(selectedDate, "yyyy-MM-dd")] || []).length - 1 ? "10px" : 0
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize", marginBottom: "6px" }}>
                                  {booking.service}
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "var(--text-secondary)" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <Clock style={{ width: "12px", height: "12px" }} />
                                    {booking.slot}
                                  </span>
                                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <User style={{ width: "12px", height: "12px" }} />
                                    {booking.customer?.name || "N/A"}
                                  </span>
                                </div>
                              </div>
                              <StatusPill status={booking.status} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>

            {/* Status Donut Chart */}
            <StatusDonutChart data={statusData} title="Status Overview" />
          </div>

          {/* Services Bar Chart - Full Width */}
          <div style={{ marginTop: "24px" }}>
            <ServicesBarChart data={serviceData} title="Services Breakdown" />
          </div>


          {/* Tabs */}
          <div className="flex items-center gap-3" style={{ marginTop: "32px", marginBottom: "32px" }}>
            {(["all", "today", "upcoming"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ 
                  padding: activeTab === tab ? "10px 24px" : "8px 16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "all 0.2s",
                  backgroundColor: activeTab === tab ? "var(--primary)" : "transparent",
                  color: activeTab === tab ? "white" : "var(--text-secondary)"
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Bookings Table */}
          <div className="bg-[var(--surface)] overflow-hidden w-full" style={{ marginLeft: "-24px", marginRight: "-24px", width: "calc(100% + 48px)" }}>
            {loading ? (
              <div className="p-8 text-center text-[var(--text-secondary)]">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-secondary)]">No bookings found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-[var(--surface)]/50">
                    <TableHead className="h-9 py-2" style={{ paddingLeft: "24px" }}>Customer</TableHead>
                    <TableHead className="h-9 py-2">Service</TableHead>
                    <TableHead className="h-9 py-2">Date & Time</TableHead>
                    <TableHead className="h-9 py-2">Status</TableHead>
                    <TableHead className="h-9 py-2">Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="py-2" style={{ paddingLeft: "24px" }}>
                        <div className="text-[var(--text-primary)] font-medium">{booking.customer?.name || "N/A"}</div>
                        <div className="text-[var(--text-secondary)] text-sm">{booking.customer?.phone || ""}</div>
                      </TableCell>
                      <TableCell className="py-2 text-[var(--text-primary)]">{booking.service}</TableCell>
                      <TableCell className="py-2">
                        <div className="text-[var(--text-primary)]">{formatDate(booking.date)}</div>
                        <div className="text-[var(--text-secondary)] text-sm">{booking.slot}</div>
                      </TableCell>
                      <TableCell className="py-2">
                        <span 
                          className={`rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                          style={{ padding: "6px 16px" }}
                        >
                          {booking.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-2 text-[var(--text-secondary)]">{booking.source}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Footer spacer */}
          <div style={{ height: "100px" }}></div>
        </div>
      </div>
    </div>
  );
}
