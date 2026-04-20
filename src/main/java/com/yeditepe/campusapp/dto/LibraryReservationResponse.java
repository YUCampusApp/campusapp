package com.yeditepe.campusapp.dto;

import com.yeditepe.campusapp.entity.LibrarySectionType;
import lombok.Data;

import java.time.Instant;

@Data
public class LibraryReservationResponse {
    private Long id;
    private String studentName;
    private String studentNo;
    private LibrarySectionType sectionType;
    /** ISO-8601 UTC anı */
    private String startAt;
    private String endAt;
    /** Europe/Istanbul yerel (API/istemci için) */
    private String startLocal;
    private String endLocal;
    /** Başlangıcın yerel tarihi (yyyy-MM-dd) */
    private String reservationDate;
    /** ACTIVE, CANCELLED, COMPLETED */
    private String status;
    private Instant createdAt;
}
