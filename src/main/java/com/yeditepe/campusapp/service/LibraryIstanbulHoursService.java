package com.yeditepe.campusapp.service;

import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Kütüphane çalışma saatleri (Europe/Istanbul):
 * Pazartesi 09:00 – Cumartesi 22:45 kesintisiz; Cmt 22:45 – Paz 10:00 kapalı;
 * Pazar 10:00 – 22:45 açık; Paz 22:45 – Pazartesi 09:00 kapalı.
 */
@Service
public class LibraryIstanbulHoursService {

    public static final ZoneId ISTANBUL = ZoneId.of("Europe/Istanbul");

    private static final int MON_OPEN = 9 * 60;
    private static final int SUN_OPEN = 10 * 60;
    private static final int SAT_SUN_CLOSE = 22 * 60 + 45;

    public boolean isOpenAt(Instant instant) {
        ZonedDateTime z = instant.atZone(ISTANBUL);
        int minutes = z.getHour() * 60 + z.getMinute();
        DayOfWeek dow = z.getDayOfWeek();
        return switch (dow) {
            case MONDAY -> minutes >= MON_OPEN;
            case TUESDAY, WEDNESDAY, THURSDAY, FRIDAY -> true;
            case SATURDAY -> minutes <= SAT_SUN_CLOSE;
            case SUNDAY -> minutes >= SUN_OPEN && minutes <= SAT_SUN_CLOSE;
        };
    }

    /** [start, end) aralığının her dakikası açık saatte mi (kapalı dilime rezervasyon yok)? */
    public boolean isIntervalFullyWithinOpenHours(Instant start, Instant end) {
        if (!end.isAfter(start)) {
            return false;
        }
        Instant cur = start;
        while (cur.isBefore(end)) {
            if (!isOpenAt(cur)) {
                return false;
            }
            cur = cur.plus(1, ChronoUnit.MINUTES);
        }
        return true;
    }
}
