package com.yeditepe.campusapp.service;

import com.yeditepe.campusapp.dto.*;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class MockCampusDataService {

    private record SectionModel(Long id, String day, String startTime, String endTime, String courseName, String classroom, String instructor) {}
    private record CourseModel(Long id, String name, List<SectionModel> sections) {}

    private final List<CourseModel> courses;
    private final AtomicLong scheduleIdSeq = new AtomicLong(1);

    // scheduleId -> alternative sessions (generated)
    private final Map<Long, ScheduleAlternativeResponse> generatedSchedules = new ConcurrentHashMap<>();

    // studentNo -> saved schedules
    private final Map<String, List<SavedScheduleResponse>> savedSchedulesByStudent = new ConcurrentHashMap<>();

    // studentNo -> favorites module keys
    private final Map<String, Set<String>> favoriteKeysByStudent = new ConcurrentHashMap<>();

    // studentNo -> notifications/reminders
    private final Map<String, List<ReminderResponse>> remindersByStudent = new ConcurrentHashMap<>();

    public MockCampusDataService() {
        this.courses = List.of(
                new CourseModel(1L, "CSE 344 - Project Lab", List.of(
                        new SectionModel(11L, "MONDAY", "09:00", "10:30", "CSE 344 - Project Lab", "A-201", "Prof. Özkaya"),
                        new SectionModel(12L, "THURSDAY", "14:00", "15:30", "CSE 344 - Project Lab", "A-101", "Prof. Özkaya")
                )),
                new CourseModel(2L, "ISE 402 - Interdisciplinary", List.of(
                        new SectionModel(21L, "MONDAY", "11:00", "12:30", "ISE 402 - Interdisciplinary", "B-305", "Prof. Sezer"),
                        new SectionModel(22L, "WEDNESDAY", "10:00", "11:30", "ISE 402 - Interdisciplinary", "B-105", "Prof. Sezer")
                )),
                new CourseModel(3L, "MATH 201 - Discrete Math", List.of(
                        new SectionModel(31L, "TUESDAY", "09:30", "11:00", "MATH 201 - Discrete Math", "C-210", "Dr. Kaya"),
                        new SectionModel(32L, "THURSDAY", "09:00", "10:30", "MATH 201 - Discrete Math", "C-115", "Dr. Kaya")
                )),
                new CourseModel(4L, "CSE 101 - Intro to CS", List.of(
                        new SectionModel(41L, "WEDNESDAY", "13:30", "15:00", "CSE 101 - Intro to CS", "D-401", "Dr. Yılmaz"),
                        new SectionModel(42L, "FRIDAY", "09:00", "10:30", "CSE 101 - Intro to CS", "D-106", "Dr. Yılmaz")
                ))
        );
    }

    public WeatherSummaryResponse getWeatherSummary() {
        WeatherSummaryResponse w = new WeatherSummaryResponse();
        w.setTemperatureC(16);
        w.setCondition("Partly Cloudy");
        return w;
    }

    public WeatherDetailResponse getWeatherDetail() {
        WeatherSummaryResponse summary = getWeatherSummary();
        WeatherCurrentDetailResponse current = new WeatherCurrentDetailResponse();
        current.setTemperatureC(summary.getTemperatureC());
        current.setCondition(summary.getCondition());
        current.setFeelsLikeC(15);
        current.setHumidityPct(62);
        current.setWindKmh(11);

        WeatherDetailResponse detail = new WeatherDetailResponse();
        detail.setCurrent(current);

        List<WeatherHourlyResponse> hourly = new ArrayList<>();
        String[] hours = {"09:00", "12:00", "15:00", "18:00"};
        int[] temps = {14, 17, 18, 15};
        String[] conditions = {"Cloudy", "Sunny", "Sunny", "Partly Cloudy"};
        for (int i = 0; i < hours.length; i++) {
            WeatherHourlyResponse h = new WeatherHourlyResponse();
            h.setTime(hours[i]);
            h.setTemperatureC(temps[i]);
            h.setCondition(conditions[i]);
            hourly.add(h);
        }
        detail.setHourly(hourly);

        List<WeatherDailyResponse> daily = new ArrayList<>();
        String[] days = {"Tue", "Wed", "Thu", "Fri"};
        String[] dCond = {"Partly Cloudy", "Rain", "Sunny", "Partly Cloudy"};
        int[] highs = {18, 16, 20, 19};
        int[] lows = {11, 10, 12, 13};
        for (int i = 0; i < days.length; i++) {
            WeatherDailyResponse d = new WeatherDailyResponse();
            d.setDayLabel(days[i]);
            d.setCondition(dCond[i]);
            d.setHighC(highs[i]);
            d.setLowC(lows[i]);
            daily.add(d);
        }
        detail.setDaily(daily);
        return detail;
    }

    private static String dayOfWeekToAbbr(DayOfWeek day) {
        return switch (day) {
            case MONDAY -> "MONDAY";
            case TUESDAY -> "TUESDAY";
            case WEDNESDAY -> "WEDNESDAY";
            case THURSDAY -> "THURSDAY";
            case FRIDAY -> "FRIDAY";
            case SATURDAY -> "SATURDAY";
            case SUNDAY -> "SUNDAY";
        };
    }

    private static int parseTimeToMinutes(String hhmm) {
        // expects HH:mm
        String[] p = hhmm.split(":");
        int h = Integer.parseInt(p[0]);
        int m = Integer.parseInt(p[1]);
        return h * 60 + m;
    }

    private boolean conflicts(String dayA, String startA, String endA, String dayB, String startB, String endB) {
        if (!dayA.equals(dayB)) return false;
        int aStart = parseTimeToMinutes(startA);
        int aEnd = parseTimeToMinutes(endA);
        int bStart = parseTimeToMinutes(startB);
        int bEnd = parseTimeToMinutes(endB);
        // overlap if start < otherEnd and end > otherStart
        return aStart < bEnd && aEnd > bStart;
    }

    public List<CourseResponse> getCourses() {
        List<CourseResponse> out = new ArrayList<>();
        for (CourseModel c : courses) {
            CourseResponse cr = new CourseResponse();
            cr.setId(c.id());
            cr.setName(c.name());

            List<CourseSectionResponse> sections = new ArrayList<>();
            for (SectionModel s : c.sections()) {
                CourseSectionResponse sec = new CourseSectionResponse();
                sec.setId(s.id());
                sec.setDay(s.day());
                sec.setStartTime(s.startTime());
                sec.setEndTime(s.endTime());
                sec.setClassroom(s.classroom());
                sec.setInstructor(s.instructor());
                sections.add(sec);
            }
            cr.setSections(sections);
            out.add(cr);
        }
        return out;
    }

    public List<AcademicClassResponse> getTodaysClasses() {
        String today = dayOfWeekToAbbr(LocalDate.now().getDayOfWeek());

        List<AcademicClassResponse> list = new ArrayList<>();
        for (CourseModel c : courses) {
            for (SectionModel s : c.sections()) {
                if (s.day().equals(today)) {
                    AcademicClassResponse a = new AcademicClassResponse();
                    a.setDay(s.day());
                    a.setStartTime(s.startTime());
                    a.setEndTime(s.endTime());
                    a.setCourseName(s.courseName());
                    a.setClassroom(s.classroom());
                    a.setInstructor(s.instructor());
                    list.add(a);
                }
            }
        }

        list.sort(Comparator.comparing(AcademicClassResponse::getDay)
                .thenComparing(x -> parseTimeToMinutes(x.getStartTime())));
        return list;
    }

    public AcademicClassResponse getNextCourse(List<AcademicClassResponse> todaysClasses) {
        LocalDateTime now = LocalDateTime.now();
        String today = dayOfWeekToAbbr(now.getDayOfWeek());
        int nowMin = now.getHour() * 60 + now.getMinute();

        return todaysClasses.stream()
                .filter(c -> c.getDay().equals(today))
                .filter(c -> parseTimeToMinutes(c.getStartTime()) >= nowMin)
                .min(Comparator.comparing(c -> parseTimeToMinutes(c.getStartTime())))
                .orElse(null);
    }

    public double getMockGpa(String studentNo) {
        // stable but different per student
        int hash = Math.abs(studentNo.hashCode());
        double base = 2.5 + (hash % 150) / 100.0; // 2.5 - 4.0
        return Math.round(Math.min(4.0, base) * 100.0) / 100.0;
    }

    public DashboardResponse getDashboard(String studentNo) {
        DashboardResponse d = new DashboardResponse();
        LocalDateTime now = LocalDateTime.now();
        d.setWelcomeMessage("Welcome back, " + studentNo + "!");
        d.setCurrentTime(now.format(DateTimeFormatter.ofPattern("HH:mm")));
        d.setCurrentDate(now.format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        d.setWeather(getWeatherSummary());

        List<AcademicClassResponse> todayClasses = getTodaysClasses();
        d.setTodaysClasses(todayClasses);
        d.setNextCourse(getNextCourse(todayClasses));

        AnnouncementResponse a1 = new AnnouncementResponse();
        a1.setTitle("Campus Shuttle Update");
        a1.setContent("New winter route starts tomorrow. Check shuttle tracking for ETA changes.");
        a1.setTime("Today");

        AnnouncementResponse a2 = new AnnouncementResponse();
        a2.setTitle("Library Reservation Tips");
        a2.setContent("Use the “I’m here” confirmation to keep your seat assignment active.");
        a2.setTime("Yesterday");

        d.setAnnouncements(List.of(a1, a2));

        // reminders
        d.setReminders(remindersByStudent.computeIfAbsent(studentNo, this::seedReminders));

        // favorites
        List<FavoriteModuleResponse> favorites = new ArrayList<>();
        Set<String> keys = favoriteKeysByStudent.computeIfAbsent(studentNo, this::seedFavorites);
        for (String key : keys) {
            FavoriteModuleResponse fr = new FavoriteModuleResponse();
            fr.setModuleKey(key);
            fr.setLabel(switch (key) {
                case "WEATHER" -> "Weather";
                case "LIBRARY" -> "Library Reservation";
                case "NOTES" -> "Lecture Notes";
                case "SHUTTLE" -> "Shuttle Tracking";
                case "CAMPUS_MAP" -> "Campus Map";
                default -> key;
            });
            favorites.add(fr);
        }
        d.setFavorites(favorites);

        return d;
    }

    public List<ReminderResponse> getReminders(String studentNo) {
        return remindersByStudent.computeIfAbsent(studentNo, this::seedReminders);
    }

    private Set<String> seedFavorites(String studentNo) {
        // same defaults for everyone for now
        Set<String> keys = ConcurrentHashMap.newKeySet();
        keys.addAll(Set.of("WEATHER", "LIBRARY", "NOTES"));
        return keys;
    }

    private List<ReminderResponse> seedReminders(String studentNo) {
        ReminderResponse r1 = new ReminderResponse();
        r1.setType("APPOINTMENT");
        r1.setMessage("Hairdresser appointment slots update is available. Check availability.");

        ReminderResponse r2 = new ReminderResponse();
        r2.setType("RESERVATION");
        r2.setMessage("Library reservations refresh regularly. Ensure you confirm with “I'm here”.");

        return new ArrayList<>(List.of(r1, r2));
    }

    public List<ScheduleAlternativeResponse> generateSchedules(GenerateScheduleRequest request) {
        List<Long> selectedCourseIds = request.getSelectedCourseIds() == null ? List.of() : request.getSelectedCourseIds();
        int limit = request.getMaxAlternatives() == null ? 5 : Math.max(1, request.getMaxAlternatives());

        if (selectedCourseIds.isEmpty()) return List.of();

        List<CourseModel> selectedCourses = new ArrayList<>();
        for (CourseModel c : courses) {
            if (selectedCourseIds.contains(c.id())) selectedCourses.add(c);
        }
        if (selectedCourses.size() != selectedCourseIds.size()) {
            // ignore missing courses
        }

        List<ScheduleAlternativeResponse> results = new ArrayList<>();
        backtrack(selectedCourses, 0, new ArrayList<>(), results, limit);
        return results;
    }

    private void backtrack(List<CourseModel> selectedCourses, int courseIndex, List<SectionModel> chosen, List<ScheduleAlternativeResponse> results, int limit) {
        if (results.size() >= limit) return;
        if (courseIndex >= selectedCourses.size()) {
            // build alternative
            ScheduleAlternativeResponse alt = new ScheduleAlternativeResponse();
            alt.setId(scheduleIdSeq.getAndIncrement());
            alt.setName("Alternative " + alt.getId());

            List<ScheduleSessionResponse> sessions = new ArrayList<>();
            for (SectionModel s : chosen) {
                ScheduleSessionResponse ss = new ScheduleSessionResponse();
                ss.setDay(s.day());
                ss.setStartTime(s.startTime());
                ss.setEndTime(s.endTime());
                ss.setCourseName(s.courseName());
                ss.setClassroom(s.classroom());
                ss.setInstructor(s.instructor());
                sessions.add(ss);
            }
            sessions.sort(Comparator.comparing(ScheduleSessionResponse::getDay)
                    .thenComparing(s -> parseTimeToMinutes(s.getStartTime())));

            alt.setSessions(sessions);
            generatedSchedules.put(alt.getId(), alt);
            results.add(alt);
            return;
        }

        CourseModel course = selectedCourses.get(courseIndex);
        for (SectionModel section : course.sections()) {
            boolean ok = true;
            for (SectionModel already : chosen) {
                if (conflicts(already.day(), already.startTime(), already.endTime(), section.day(), section.startTime(), section.endTime())) {
                    ok = false;
                    break;
                }
            }
            if (!ok) continue;

            chosen.add(section);
            backtrack(selectedCourses, courseIndex + 1, chosen, results, limit);
            chosen.remove(chosen.size() - 1);

            if (results.size() >= limit) return;
        }
    }

    public SavedScheduleResponse saveSchedule(String studentNo, SaveScheduleRequest req) {
        ScheduleAlternativeResponse alt = generatedSchedules.get(req.getScheduleId());
        if (alt == null) {
            throw new IllegalArgumentException("Schedule not found. Generate schedules first.");
        }

        SavedScheduleResponse saved = new SavedScheduleResponse();
        saved.setId(alt.getId());
        saved.setName(req.getName() == null || req.getName().isBlank() ? alt.getName() : req.getName());
        saved.setSessions(alt.getSessions());

        savedSchedulesByStudent.computeIfAbsent(studentNo, k -> new ArrayList<>()).add(saved);
        return saved;
    }

    public List<SavedScheduleResponse> getSavedSchedules(String studentNo) {
        return savedSchedulesByStudent.getOrDefault(studentNo, List.of());
    }

    public Set<String> getFavoriteKeys(String studentNo) {
        return favoriteKeysByStudent.computeIfAbsent(studentNo, this::seedFavorites);
    }

    public void setFavorites(String studentNo, Set<String> moduleKeys) {
        favoriteKeysByStudent.put(studentNo, moduleKeys);
    }
}

