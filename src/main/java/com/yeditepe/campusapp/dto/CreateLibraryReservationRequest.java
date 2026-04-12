package com.yeditepe.campusapp.dto;

import com.yeditepe.campusapp.entity.LibrarySectionType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateLibraryReservationRequest {
    /** COMP veya GENERAL — Europe/Istanbul yerel tarih-saat olarak startLocal/endLocal */
    private LibrarySectionType sectionType;
    private LocalDateTime startLocal;
    private LocalDateTime endLocal;
}
