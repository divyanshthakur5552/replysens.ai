"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { format, isSameDay, isAfter, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, User, Phone, Clock } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { ChatSidebar } from "@/components/chat";

interface Booking {
  _id: string;
  service: string;
  slot: string;
  status: string;
  customer: {
    name: string;
    phone: string;
  };
}

interface CalendarData {
  [date: string]: Booking[];
}

type FilterType = "today" | "upcoming" | "all";

export default function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarData>({});

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/booking/calendar", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCalendarData(response.data);
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get dates that have bookings (for highlighting)
  const datesWithBookings = Object.keys(calendarData).map(dateStr => new Date(dateStr));

  // Get bookings for selected date
  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedBookings = calendarData[selectedDateKey] || [];

  // Filter bookings based on selected filter
  const getFilteredDates = () => {
    const today = startOfDay(new Date());
    
    return Object.entries(calendarData).filter(([dateStr]) => {
      const date = new Date(dateStr);
      
      switch (filter) {
        case "today":
          return isSameDay(date, today);
        case "upcoming":
          return isAfter(date, today);
        case "all":
        default:
          return true;
      }
    });
  };

  const filteredDates = getFilteredDates();
  const totalFilteredBookings = filteredDates.reduce(
    (sum, [, bookings]) => sum + bookings.length, 
    0
  );

  // Format time slot for display
  const formatSlot = (slot: string) => {
    const [hours, minutes] = slot.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes || "00"} ${ampm}`;
  };

  // Custom day content to show booking indicators
  const modifiers = {
    hasBooking: datesWithBookings,
  };

  const modifiersClassNames = {
    hasBooking: "relative after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:size-1.5 after:rounded-full after:bg-green-500",
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <CalendarIcon className="size-8 text-primary" />
            Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your bookings
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["today", "upcoming", "all"] as FilterType[]).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="capitalize"
            >
              {filterType}
              {filterType === filter && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-background/20">
                  {totalFilteredBookings}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Calendar Section */}
            <div className="p-6 border-b lg:border-b-0 lg:border-r border-border">
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  className="bg-card"
                />
              )}
              
              {/* Legend */}
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-green-500"></div>
                  <span>Has bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary"></div>
                  <span>Today</span>
                </div>
              </div>
            </div>

            {/* Bookings List Section */}
            <div className="flex-1 min-w-0">
              <div className="p-4 border-b border-border bg-muted/30">
                <h2 className="font-semibold text-foreground">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedBookings.length} booking{selectedBookings.length !== 1 ? "s" : ""}
                </p>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-3">
                  {selectedBookings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CalendarIcon className="size-12 mx-auto mb-3 opacity-50" />
                      <p>No bookings for this date</p>
                    </div>
                  ) : (
                    selectedBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground capitalize">
                              {booking.service}
                            </h3>
                            
                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="size-4" />
                                <span>{formatSlot(booking.slot)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="size-4" />
                                <span>{booking.customer?.name || "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="size-4" />
                                <span>{booking.customer?.phone || "N/A"}</span>
                              </div>
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

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Today", count: Object.entries(calendarData).filter(([d]) => isSameDay(new Date(d), new Date())).reduce((s, [,b]) => s + b.length, 0), color: "text-blue-400" },
            { label: "This Week", count: Object.values(calendarData).flat().length, color: "text-green-400" },
            { label: "Confirmed", count: Object.values(calendarData).flat().filter(b => b.status === "confirmed").length, color: "text-emerald-400" },
            { label: "Pending", count: Object.values(calendarData).flat().filter(b => b.status === "pending").length, color: "text-yellow-400" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
